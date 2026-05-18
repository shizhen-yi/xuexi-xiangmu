'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useStore } from '@/lib/store';

export function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    const onScroll = ({ progress }: { progress: number }) => {
      useStore.getState().setScrollProgress(progress);
    };
    lenis.on('scroll', onScroll);

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
