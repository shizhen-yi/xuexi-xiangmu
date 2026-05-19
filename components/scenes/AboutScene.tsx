'use client';

import { AboutEnvironment } from './about/AboutEnvironment';
import { AboutLabLogo } from './about/AboutLabLogo';
import { AboutLogo } from './about/AboutLogo';

export function AboutScene() {
  return (
    <group>
      <AboutEnvironment />
      <AboutLogo />
      <AboutLabLogo />
    </group>
  );
}
