'use client';

import { useEffect } from 'react';
import { WorkBackground } from './work/WorkBackground';
import { WorkEnvironment } from './work/WorkEnvironment';
import { WorkGlassCubes } from './work/WorkGlassCubes';
import { WorkParticles } from './work/WorkParticles';

/**
 * Toggle the globally-fixed `.canvas-layer` to receive pointer events while
 * Work is mounted, so cubes can fire onPointerOver / onClick. The DOM layer
 * sits on top (z=10 > z=0), so links/cards still win over canvas hits.
 */
function useCanvasPointerEvents() {
  useEffect(() => {
    const el = document.querySelector('.canvas-layer') as HTMLElement | null;
    if (!el) return;
    const prev = el.style.pointerEvents;
    el.style.pointerEvents = 'auto';
    return () => {
      el.style.pointerEvents = prev;
    };
  }, []);
}

export function WorkScene() {
  useCanvasPointerEvents();
  return (
    <>
      <WorkEnvironment />
      <WorkBackground />
      <WorkGlassCubes />
      <WorkParticles />
    </>
  );
}
