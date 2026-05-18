'use client';

import { Environment } from '@react-three/drei';
import { hex, palette } from '@/lib/palette';

export function WorkEnvironment() {
  return (
    <>
      <Environment files="/hdri/studio_small_09_1k.hdr" background={false} />
      <fog attach="fog" args={[palette.home.fog, 15, 45]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 0]} intensity={1.0} color={hex('magenta')} />
      <pointLight position={[-5, -3, -10]} intensity={0.6} color={hex('particles.coreB')} />
    </>
  );
}
