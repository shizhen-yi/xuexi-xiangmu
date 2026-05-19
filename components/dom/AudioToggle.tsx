'use client';

import { useEffect } from 'react';
import { Howl } from 'howler';
import { useStore } from '@/lib/store';

let howl: Howl | null = null;

function getHowl(): Howl {
  if (!howl) {
    howl = new Howl({
      src: ['/audio/ambient.ogg'],
      loop: true,
      volume: 0,
      html5: true,
    });
  }
  return howl;
}

export function AudioToggle() {
  const audioOn = useStore((s) => s.audioOn);
  const toggleAudio = useStore((s) => s.toggleAudio);

  useEffect(() => {
    const h = getHowl();
    if (audioOn) {
      if (!h.playing()) h.play();
      h.fade(h.volume(), 0.35, 800);
    } else {
      h.fade(h.volume(), 0, 800);
      setTimeout(() => {
        if (!useStore.getState().audioOn) h.stop();
      }, 900);
    }
  }, [audioOn]);

  return (
    <button
      onClick={toggleAudio}
      aria-label={audioOn ? '关闭音效' : '开启音效'}
      className="fixed bottom-6 right-6 z-50 flex items-end gap-[3px] h-5 hover:opacity-100 transition-opacity"
      style={{ opacity: audioOn ? 1 : 0.4 }}
    >
      {[8, 14, 20, 14, 8].map((h, i) => (
        <span
          key={i}
          className="w-[2px] bg-white rounded-full"
          style={{ height: audioOn ? h : 4, transition: 'height 0.4s ease' }}
        />
      ))}
    </button>
  );
}
