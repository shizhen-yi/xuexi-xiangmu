'use client';

import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { HalfFloatType, Vector2 } from 'three';
import { LensStreak } from './LensStreakEffect';

/**
 * Global postprocessing stack mounted inside the persistent <Canvas>.
 *
 * Stack order: Bloom -> LensStreak -> ChromaticAberration -> Vignette.
 * - HDR framebuffer (HalfFloat) prevents emissive magenta clipping before Bloom samples it.
 * - LensStreak is placed after Bloom (so it samples the already-bloomed highlights)
 *   and before ChromaticAberration (so CA can shift the streak chromatically).
 */
export function PostFX() {
  return (
    <EffectComposer
      multisampling={0}
      enableNormalPass={false}
      stencilBuffer={false}
      frameBufferType={HalfFloatType}
    >
      <Bloom
        mipmapBlur
        intensity={1.6}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.25}
        radius={0.88}
      />
      <LensStreak
        streakColor="#c2dcff"
        haloColor="#cceeff"
        intensity={0.7}
        threshold={0.65}
        stretch={0.02}
      />
      <ChromaticAberration offset={new Vector2(0.0012, 0.0016)} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.32} darkness={0.6} />
    </EffectComposer>
  );
}
