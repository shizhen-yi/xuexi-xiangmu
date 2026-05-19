'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  EdgesGeometry,
  type Group,
  IcosahedronGeometry,
  ShaderMaterial,
} from 'three';
import {
  fragmentShader,
  makeUniforms,
  vertexShader,
} from './shaders/aboutLabLogo';

export function AboutLabLogo() {
  const groupRef = useRef<Group>(null);

  const icoGeom = useMemo(() => new IcosahedronGeometry(0.6, 1), []);
  const edgesGeom = useMemo(() => new EdgesGeometry(icoGeom), [icoGeom]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: makeUniforms(),
      }),
    [],
  );

  useEffect(() => {
    return () => {
      icoGeom.dispose();
      edgesGeom.dispose();
      material.dispose();
    };
  }, [icoGeom, edgesGeom, material]);

  useFrame((state, dt) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.2;
      groupRef.current.rotation.x += dt * 0.08;
      groupRef.current.position.y =
        -1.1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.1, 0]}>
      <lineSegments geometry={edgesGeom}>
        <primitive object={material} attach="material" />
      </lineSegments>
    </group>
  );
}
