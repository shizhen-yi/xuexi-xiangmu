'use client';

import { useEffect, useMemo, useRef, type JSX } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from 'three';
import { palette } from '@/lib/palette';

const vertexShader = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aTwinkle;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  uniform float uTime;
  uniform float uPixelRatio;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec3 pos = position;

    float layer = clamp((pos.z + 6.0) / 8.0, 0.0, 1.0);
    float fall = fract((pos.y * 0.08) - (uTime * aSpeed * 0.045) + aSeed);
    pos.y = mix(-7.2, 6.6, fall);

    float swirl = uTime * (0.018 + aSpeed * 0.015) + aSeed * 6.28318530718;
    pos.xz = rotate2d(swirl * (0.25 + layer * 0.55)) * pos.xz;
    pos.x += sin(uTime * (0.42 + aSpeed * 0.12) + aSeed * 38.0) * (0.12 + layer * 0.28);
    pos.y += cos(uTime * 0.31 + aSeed * 49.0) * 0.08;
    pos.z += sin(uTime * 0.24 + aSeed * 27.0) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthScale = 1.0 / max(-mvPosition.z, 0.12);
    float sparkle = 0.72 + 0.28 * sin(uTime * (1.8 + aTwinkle * 3.2) + aSeed * 61.0);
    gl_PointSize = (2.2 + aSize * 6.8) * uPixelRatio * depthScale * sparkle;

    vColor = aColor;
    vAlpha = mix(0.42, 0.92, sparkle) * mix(0.72, 1.0, layer);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.24, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d);
    vec3 color = vColor * (1.15 + core * 1.95);
    float alpha = (core * 0.85 + halo * 0.32) * vAlpha;

    gl_FragColor = vec4(color, alpha);
  }
`;

const HOME_GOLD = '#d4a017';
const WARM_GOLD = '#ffd978';
const DEEP_GOLD = '#8a5a08';
const MIN_DESKTOP_COUNT = 52000;
const MIN_MOBILE_COUNT = 32000;

type HomeGoldParticlesProps = {
  count?: number;
  radius?: number;
};

type HomeGoldParticleUniforms = {
  uTime: { value: number };
  uPixelRatio: { value: number };
};

function makeUniforms(pixelRatio: number): HomeGoldParticleUniforms {
  return {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
  };
}

function detectMinimumCount(): number {
  if (typeof window === 'undefined') return MIN_DESKTOP_COUNT;
  return window.matchMedia('(max-width: 768px)').matches ? MIN_MOBILE_COUNT : MIN_DESKTOP_COUNT;
}

function hash01(value: number): number {
  const x = Math.sin(value * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function randomInRange(seed: number, min: number, max: number): number {
  return min + hash01(seed) * (max - min);
}

export function HomeGoldParticles({ count = MIN_DESKTOP_COUNT, radius = 3.5 }: HomeGoldParticlesProps = {}): JSX.Element {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const particleCount = useMemo(() => Math.max(count, detectMinimumCount()), [count]);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const twinkles = new Float32Array(particleCount);

    const gold = new Color(HOME_GOLD);
    const warmGold = new Color(WARM_GOLD);
    const deepGold = new Color(DEEP_GOLD);
    const green = new Color(palette.legacy.greenElectric);
    const color = new Color();

    const spreadX = radius * 3.15;
    const spreadY = radius * 2.15;
    const spreadZ = radius * 2.45;

    for (let i = 0; i < particleCount; i++) {
      const particleSeed = i + 1;
      const layer = hash01(particleSeed * 1.17);
      const centerBias = Math.pow(hash01(particleSeed * 2.31), 1.8);
      const angle = hash01(particleSeed * 3.73) * Math.PI * 2;
      const clusterRadius = centerBias * radius * 1.35;
      const inCloud = hash01(particleSeed * 4.49) < 0.36;

      positions[i * 3 + 0] = inCloud
        ? Math.cos(angle) * clusterRadius + randomInRange(particleSeed * 5.21, -1.8, 1.8)
        : randomInRange(particleSeed * 5.21, -spreadX, spreadX);
      positions[i * 3 + 1] = inCloud
        ? Math.sin(angle) * clusterRadius * 0.72 + randomInRange(particleSeed * 6.83, -2.1, 2.1)
        : randomInRange(particleSeed * 6.83, -spreadY, spreadY);
      positions[i * 3 + 2] = randomInRange(particleSeed * 7.97, -spreadZ, spreadZ * 0.62) + layer * 1.2;

      const seed = hash01(particleSeed * 8.67);
      seeds[i] = seed;
      sizes[i] = Math.pow(hash01(particleSeed * 9.41), 1.9);
      speeds[i] = randomInRange(particleSeed * 10.79, 0.55, 1.85);
      twinkles[i] = hash01(particleSeed * 11.13);

      if (seed < 0.055) {
        color.copy(green).lerp(warmGold, 0.35);
      } else if (seed < 0.32) {
        color.copy(deepGold).lerp(gold, hash01(particleSeed * 12.71) * 0.75);
      } else {
        color.copy(gold).lerp(warmGold, hash01(particleSeed * 13.29) * 0.82);
      }

      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    g.setAttribute('aColor', new BufferAttribute(colors, 3));
    g.setAttribute('aSize', new BufferAttribute(sizes, 1));
    g.setAttribute('aSpeed', new BufferAttribute(speeds, 1));
    g.setAttribute('aTwinkle', new BufferAttribute(twinkles, 1));
    g.computeBoundingSphere();

    return g;
  }, [particleCount, radius]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(gl.getPixelRatio()),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
  }, [gl]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  );
}
