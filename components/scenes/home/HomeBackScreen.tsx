'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { ShaderMaterial, SRGBColorSpace, VideoTexture } from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/homeLogo';
import { hex } from '@/lib/palette';

/**
 * Far end of the corridor: solid black back wall + video plane (RGB-shifted +
 * magenta-tinted via HomeLogoShader) + a softly emissive "screen light" plane
 * in front to feed Bloom and tint nearby surfaces.
 */
export function HomeBackScreen() {
  const matRef = useRef<ShaderMaterial>(null);

  const video = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const v = document.createElement('video');
    v.src = '/videos/hero.mp4';
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
    const tex = new VideoTexture(video);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const playSafely = () => {
      void video.play().catch(() => {});
    };
    playSafely();
    const onPointerDown = () => {
      playSafely();
      window.removeEventListener('pointerdown', onPointerDown);
    };
    window.addEventListener('pointerdown', onPointerDown, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      video.pause();
      video.src = '';
      video.load();
    };
  }, [video]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms({
        uTex: { value: videoTexture },
      }),
      transparent: true,
    });
  }, [videoTexture]);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      {/* Black backdrop to anchor the video and hide bleed-through */}
      <mesh position={[0, 6, -30]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Video plane with HomeLogoShader (RGB-shift + magenta tint) */}
      <mesh position={[0, 5.5, -29.95]}>
        <planeGeometry args={[11, 6.2]} />
        <primitive ref={matRef} object={material} attach="material" />
      </mesh>

      {/* Screen light: emissive halo plane feeding Bloom */}
      <mesh position={[0, 5.5, -29.5]}>
        <planeGeometry args={[13, 8]} />
        <meshBasicMaterial
          color={hex('home.screenLight')}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
