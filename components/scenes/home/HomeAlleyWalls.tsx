'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { RepeatWrapping, ShaderMaterial, SRGBColorSpace } from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/homeAlley';
import { useStore } from '@/lib/store';

export function HomeAlleyWalls() {
  const matRef = useRef<ShaderMaterial>(null);
  const textures = useTexture({
    normalMap: '/textures/wall_normal_1k.jpg',
    roughMap: '/textures/wall_roughness_1k.jpg',
  });

  useEffect(() => {
    for (const tex of [textures.normalMap, textures.roughMap]) {
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;
      tex.repeat.set(4, 2);
      tex.colorSpace = SRGBColorSpace;
      tex.needsUpdate = true;
    }
  }, [textures.normalMap, textures.roughMap]);

  const material = useMemo(() => {
    const m = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms({
        uNormalMap: { value: textures.normalMap },
        uRoughMap: { value: textures.roughMap },
      }),
    });
    return m;
  }, [textures.normalMap, textures.roughMap]);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    const c = useStore.getState().cursor;
    m.uniforms.uCursor.value.set(c.x, c.y);
  });

  return (
    <group>
      <mesh position={[-7, 6, -10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 12]} />
        <primitive ref={matRef} object={material} attach="material" />
      </mesh>
      <mesh position={[7, 6, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
