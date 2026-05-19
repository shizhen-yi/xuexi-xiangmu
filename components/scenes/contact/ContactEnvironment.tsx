'use client';

import { hex } from '@/lib/palette';

export function ContactEnvironment() {
  return (
    <>
      <fog attach="fog" args={[hex('bg.black'), 6, 22]} />
      <ambientLight intensity={0.3} />
      <pointLight
        position={[0, 2, 2]}
        intensity={3}
        color={hex('home.screen')}
      />
    </>
  );
}
