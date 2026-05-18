'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { hex } from '@/lib/palette';

/**
 * Phase-1 placeholder. Replaced in Phase 3 with: corridor walls (HomeAlleyShader),
 * columns, MeshReflectorMaterial floor, screen lights, logo plane, particle system.
 */
export function HomeScene() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.3;
      ref.current.rotation.y += dt * 0.4;
    }
  });
  return (
    <group>
      <mesh ref={ref} position={[0, 4, 0]} scale={1.6}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial
          color={hex('magenta')}
          emissive={hex('magenta')}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 8, 5]} intensity={50} color={hex('cyan')} />
      <pointLight position={[-5, 4, 5]} intensity={30} color={hex('magenta')} />
    </group>
  );
}
