'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { hex } from '@/lib/palette';

/** Phase-1 placeholder — replaced in Phase 5 with AboutLogoShader + LabLogoShader wireframe lab. */
export function AboutScene() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.25;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={hex('greenElectric')}
          emissive={hex('greenElectric')}
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={15} color={hex('white')} />
    </group>
  );
}
