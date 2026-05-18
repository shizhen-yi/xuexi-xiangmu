'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Captures pointer / touch in normalized [-1, 1] coordinates and smooths to the store
 * with a low-pass filter. Camera rigs read `useStore().cursor`.
 */
export function CursorTracker() {
  const setCursor = useStore((s) => s.setCursor);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const tick = () => {
      curX += (targetX - curX) * 0.1;
      curY += (targetY - curY) * 0.1;
      setCursor(curX, curY);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [setCursor]);

  return null;
}
