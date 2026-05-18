'use client';

import { WorkBackground } from './work/WorkBackground';
import { WorkEnvironment } from './work/WorkEnvironment';
import { WorkGlassCubes } from './work/WorkGlassCubes';
import { WorkParticles } from './work/WorkParticles';

export function WorkScene() {
  return (
    <>
      <WorkEnvironment />
      <WorkBackground />
      <WorkGlassCubes />
      <WorkParticles />
    </>
  );
}
