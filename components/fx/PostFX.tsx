'use client';

import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { HalfFloatType, Vector2 } from 'three';

/**
 * Global postprocessing stack mounted inside the persistent <Canvas>.
 *
 * Stack order: Bloom -> ChromaticAberration -> Vignette.
 * HDR framebuffer (HalfFloat) prevents emissive magenta clipping before Bloom samples it.
 * LensStreak (Phase 3.x) will be added as a custom Effect subclass and inserted between
 * Bloom and ChromaticAberration once implemented.
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
        intensity={1.2}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.2}
        radius={0.85}
      />
      {/* TODO Phase 3.x: <LensStreakEffect tint="#c2dcff" haloColor="#cceeff" /> */}
      <ChromaticAberration offset={new Vector2(0.0008, 0.0012)} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.35} darkness={0.55} />
    </EffectComposer>
  );
}
