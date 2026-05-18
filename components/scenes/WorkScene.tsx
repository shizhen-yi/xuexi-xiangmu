'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { hex } from '@/lib/palette';

/** Phase-1 placeholder — replaced in Phase 4 with 4-6 GlassCube case-study grid. */
export function WorkScene() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.2;
    }
  });
  return (
    <group ref={ref}>
      {[-1.5, 0, 1.5].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial
            color={hex('cyan')}
            emissive={hex('cyan')}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 4]} intensity={20} color={hex('magenta')} />
    </group>
  );
}
