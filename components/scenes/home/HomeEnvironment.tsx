'use client';

import { Environment } from '@react-three/drei';
import { palette } from '@/lib/palette';

export function HomeEnvironment() {
  return (
    <>
      <Environment files="/hdri/studio_small_09_1k.hdr" background={false} />
      <fog attach="fog" args={[palette.home.fog, 25, 80]} />
    </>
  );
}
