'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { hex } from '@/lib/palette';

/** Phase-1 placeholder — replaced in Phase 4 with particle dissolve transition + detail hero plane. */
export function WorkDetailScene() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.z += dt * 0.6;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={hex('magentaLight')}
          emissive={hex('magentaLight')}
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      <ambientLight intensity={0.5} />
    </group>
  );
}
