'use client';
import { useEffect, useState } from 'react';

export function MobileFallback() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const widthMobile = window.matchMedia('(max-width: 767px)').matches;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(widthMobile || coarse);
    };
    check();
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);
  if (!isMobile) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white pointer-events-auto"
      style={{ backgroundImage: 'url(/poster-mobile.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative text-center px-8 max-w-xs">
        <p className="text-xs uppercase tracking-[0.4em] text-[#d600ff] mb-4">学习项目 / xuexi-xiangmu</p>
        <h1 className="text-2xl font-medium leading-tight mb-3">请在桌面访问</h1>
        <p className="text-sm text-white/70 leading-relaxed">View on desktop · 这是一个 WebGL 学习 demo，需要更大屏幕和更强的图形性能。</p>
      </div>
    </div>
  );
}
