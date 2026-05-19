'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[999] pointer-events-none"
        style={{ transform: 'translate(-100px, -100px)' }}
      >
        <div className="w-[6px] h-[6px] rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[999] pointer-events-none"
        style={{ transform: 'translate(-100px, -100px)' }}
      >
        <div className="w-[32px] h-[32px] rounded-full border border-white/40 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </>
  );
}
