'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { ShaderMaterial } from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/homeColumn';
import { useStore } from '@/lib/store';

const COLUMN_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [-5.5, 4.5, -2],
  [-5.5, 4.5, -12],
  [-5.5, 4.5, -22],
  [5.5, 4.5, -2],
  [5.5, 4.5, -12],
  [5.5, 4.5, -22],
];

export function HomeColumns() {
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

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    const c = useStore.getState().cursor;
    m.uniforms.uCursor.value.set(c.x, c.y);
  });

  return (
    <group>
      {COLUMN_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.6, 9, 0.6]} />
          <primitive ref={i === 0 ? matRef : null} object={material} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
