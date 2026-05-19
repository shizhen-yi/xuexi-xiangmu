'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, ShaderMaterial } from 'three';
import {
  vertexShader as ringVert,
  fragmentShader as ringFrag,
  makeUniforms as makeRingUniforms,
} from './home/shaders/homeRing';
import { HomeGoldParticles } from './home/HomeGoldParticles';
import { HomeTrails } from './home/HomeTrails';
import { useStore } from '@/lib/store';

export function HomeScene() {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);
  const matRef = useRef<ShaderMaterial>(null);

  const ringMaterial = useMemo(() => {
    const uniforms = makeRingUniforms();
    return new ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms,
      transparent: false,
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ringMaterial.uniforms.uTime.value = t;

    const { cursor, scrollProgress } = useStore.getState();

    if (groupRef.current) {
      const cursorRotY = cursor.x * 0.15 + scrollProgress * Math.PI * 0.6;
      const cursorRotX = -cursor.y * 0.1 + scrollProgress * 0.3;
      groupRef.current.rotation.y += (cursorRotY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (cursorRotX - groupRef.current.rotation.x) * 0.05;
      const targetZ = -scrollProgress * 11;
      groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.08;
      const targetScale = 1 + scrollProgress * 0.6;
      groupRef.current.scale.setScalar(
        groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * 0.08,
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.25;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
      ringRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} />
      <group ref={ringRef}>
        <mesh material={ringMaterial}>
          <torusKnotGeometry args={[1, 0.32, 256, 32, 2, 3]} />
        </mesh>
      </group>
      <HomeGoldParticles count={8000} radius={3.5} />
      <HomeTrails />
    </group>
  );
}
