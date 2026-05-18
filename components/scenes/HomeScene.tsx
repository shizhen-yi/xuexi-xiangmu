'use client';

import { Suspense } from 'react';
import { HomeAlleyWalls } from './home/HomeAlleyWalls';
import { HomeBackScreen } from './home/HomeBackScreen';
import { HomeColumns } from './home/HomeColumns';
import { HomeEnvironment } from './home/HomeEnvironment';
import { HomeFloor } from './home/HomeFloor';
import { HomeParticles } from './home/HomeParticles';
import { hex } from '@/lib/palette';

/**
 * Home corridor hero scene (Phase 3): two side walls + 6 columns + reflective
 * floor + back video screen + emissive screen light + drifting particle dust,
 * lit by an HDRI environment, a point light at the screen, and a soft front
 * cyan rim. Camera params come from sceneParams.home; PostFX (Bloom / CA /
 * Vignette) is mounted globally inside WebGLProvider.
 */
export function HomeScene() {
  return (
    <group>
      <Suspense fallback={null}>
        <HomeEnvironment />
      </Suspense>

      <ambientLight intensity={0.18} />
      <pointLight
        position={[0, 6, -28]}
        intensity={28}
        color={hex('home.screen')}
        distance={28}
        decay={2}
      />
      <pointLight
        position={[0, 7, 6]}
        intensity={6}
        color={hex('home.floorGlow')}
        distance={22}
        decay={2}
      />

      <Suspense fallback={null}>
        <HomeAlleyWalls />
      </Suspense>
      <HomeColumns />
      <HomeFloor />
      <Suspense fallback={null}>
        <HomeBackScreen />
      </Suspense>
      <HomeParticles />
    </group>
  );
}
