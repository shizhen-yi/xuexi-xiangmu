'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { ShaderMaterial } from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/workBackground';

export function WorkBackground() {
  const matRef = useRef<ShaderMaterial>(null);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: makeUniforms(),
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -25]}>
      <planeGeometry args={[60, 30]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}
