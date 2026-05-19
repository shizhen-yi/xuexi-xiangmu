'use client';

import { useEffect, useMemo, useRef, type JSX } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  attribute float a_seed;

  varying float vSeed;

  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;

    pos.y += sin(uTime * 0.05 + a_seed * 12.0) * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (0.8 + 1.2 * a_seed) * uPixelRatio;
    gl_PointSize *= 1.0 / max(-mvPosition.z, 0.1);

    vSeed = a_seed;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d) * (0.35 + 0.65 * vSeed);
    vec3 color = vec3(1.0) * vSeed;

    gl_FragColor = vec4(color, alpha);
  }
`;

type HomeBackgroundStarsProps = {
  count?: number;
};

type HomeBackgroundStarsUniforms = {
  uTime: { value: number };
  uPixelRatio: { value: number };
};

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeUniforms(pixelRatio: number): HomeBackgroundStarsUniforms {
  return {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
  };
}

export function HomeBackgroundStars({ count = 25000 }: HomeBackgroundStarsProps = {}): JSX.Element {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rand = random(0x51a7f00d);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = rand() * 60 - 30;
      positions[i * 3 + 1] = rand() * 40 - 20;
      positions[i * 3 + 2] = rand() * 22 - 30;
      seeds[i] = rand();
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('a_seed', new BufferAttribute(seeds, 1));

    return g;
  }, [count]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(gl.getPixelRatio()),
      transparent: true,
      depthWrite: false,
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
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  );
}
