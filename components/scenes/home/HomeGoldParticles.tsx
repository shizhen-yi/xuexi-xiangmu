'use client';

import { useEffect, useMemo, useRef, type JSX } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from 'three';
import { palette } from '@/lib/palette';

const vertexShader = /* glsl */ `
  attribute float a_id;
  attribute float a_size;
  attribute vec3 a_color;

  varying vec3 vColor;

  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;

    pos.x += sin(uTime * 0.3 + a_id * 0.1) * 0.15;
    pos.y += cos(uTime * 0.25 + a_id * 0.13) * 0.18;
    pos.z += sin(uTime * 0.28 + a_id * 0.07) * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (2.0 + 4.0 * a_size) * uPixelRatio;
    gl_PointSize *= 1.0 / max(-mvPosition.z, 0.1);

    vColor = a_color;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * 1.8, alpha);
  }
`;

const HOME_GOLD = '#d4a017';

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

export function HomeGoldParticles({ count = 8000, radius = 3.5 }: HomeGoldParticlesProps = {}): JSX.Element {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const ids = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const gold = new Color(HOME_GOLD);
    const green = new Color(palette.legacy.greenElectric);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0;
      const y = 1 - 2 * t;
      const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * goldenAngle;
      const shellRadius = radius + (Math.random() - 0.5);

      positions[i * 3 + 0] = Math.cos(theta) * ringRadius * shellRadius;
      positions[i * 3 + 1] = y * shellRadius;
      positions[i * 3 + 2] = Math.sin(theta) * ringRadius * shellRadius;

      ids[i] = i;
      sizes[i] = Math.random();

      const color = Math.random() < 0.1 ? green : gold;
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('a_id', new BufferAttribute(ids, 1));
    g.setAttribute('a_color', new BufferAttribute(colors, 3));
    g.setAttribute('a_size', new BufferAttribute(sizes, 1));

    return g;
  }, [count, radius]);

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
