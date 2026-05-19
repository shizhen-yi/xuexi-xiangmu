'use client';

import { ContactEnvironment } from './contact/ContactEnvironment';
import { ContactParticles } from './contact/ContactParticles';

export function ContactScene() {
  return (
    <group>
      <ContactEnvironment />
      <ContactParticles />
    </group>
  );
}
