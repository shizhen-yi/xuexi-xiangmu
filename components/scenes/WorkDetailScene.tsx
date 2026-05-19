'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { SRGBColorSpace, VideoTexture } from 'three';
import { hex, palette } from '@/lib/palette';

const HERO_VIDEO_PATH = '/videos/work.mp4';

const SUB_CUBE_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [-2.6, -0.6, -3],
  [2.6, -0.4, -4],
  [0, -1.4, -5.5],
];

/**
 * Detail scene: a single video-textured hero plane at z=-2 plus 3 small
 * decorative GlassCubes. DOM overlay (title / client / year / MDX body)
 * lives in app/work/[slug]/page.tsx. Lenis handles smooth scroll.
 */
export function WorkDetailScene() {
  const pathname = usePathname();
  const slug = pathname.split('/')[2] ?? '';

  const video = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const v = document.createElement('video');
    v.src = HERO_VIDEO_PATH;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = 'anonymous';
    v.preload = 'auto';
    v.autoplay = true;
    return v;
  }, []);

  const videoTexture = useMemo(() => {
    if (!video) return null;
    const t = new VideoTexture(video);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const play = () => {
      void video.play().catch(() => {});
    };
    play();
    const onDown = () => {
      play();
      window.removeEventListener('pointerdown', onDown);
    };
    window.addEventListener('pointerdown', onDown, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      video.pause();
      video.src = '';
      video.load();
      videoTexture?.dispose();
    };
  }, [video, videoTexture]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 2]} intensity={0.8} color={hex('magenta')} />
      <pointLight position={[-3, -2, 1]} intensity={0.4} color={hex('particles.coreB')} />

      {/* Hero plane displays the project video. Matches the WorkDetailParticles
          dissolve target region (HERO_PLANE_CENTER) so dissolve finishes here. */}
      <mesh position={[0, 1, -2]} userData={{ slug }}>
        <planeGeometry args={[4, 2.25]} />
        <meshBasicMaterial map={videoTexture ?? null} toneMapped={false} />
      </mesh>

      {SUB_CUBE_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.3}
            roughness={0.15}
            ior={1.4}
            clearcoat={1}
            attenuationColor={palette.glass.cubeFresnel}
            attenuationDistance={1.2}
            envMapIntensity={1.0}
          />
        </mesh>
      ))}
    </>
  );
}
