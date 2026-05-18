'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { hex } from '@/lib/palette';

/** Phase-1 placeholder — replaced in Phase 5 with ambient particle field + glass CTA. */
export function ContactScene() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.3;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={hex('tealLight')}
          emissive={hex('tealLight')}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 2, 4]} intensity={20} color={hex('cyan')} />
    </group>
  );
}
