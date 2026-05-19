'use client';

import { hex } from '@/lib/palette';

export function AboutEnvironment() {
  return (
    <>
      <fog attach="fog" args={[hex('bg.homeRoom'), 5, 18]} />
      <ambientLight intensity={0.5} color={hex('white')} />
      <pointLight position={[2, 2, 3]} intensity={6} color={hex('white')} />
      <pointLight
        position={[-2, -1, 2]}
        intensity={4}
        color={hex('home.screen')}
      />
    </>
  );
}
