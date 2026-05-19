'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { type Mesh, ShaderMaterial } from 'three';
import {
  fragmentShader,
  makeUniforms,
  vertexShader,
} from './shaders/aboutLogo';

export function AboutLogo() {
  const meshRef = useRef<Mesh>(null);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: makeUniforms(),
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={[0, 1.2, 0]}>
      <planeGeometry args={[3, 1.5]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
