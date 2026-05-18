'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/homeParticle';
import { useStore } from '@/lib/store';

function detectCount(): number {
  if (typeof window === 'undefined') return 800;
  return window.matchMedia('(max-width: 768px)').matches ? 300 : 800;
}

export function HomeParticles() {
  const pointsRef = useRef<Points>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const count = useMemo(() => detectCount(), []);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() * 2 - 1) * 6;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = Math.random() * -36 + 8;
      seeds[i] = Math.random();
      sizes[i] = 1.3 + Math.random() * 1.6;
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    g.setAttribute('aSize', new BufferAttribute(sizes, 1));
    return g;
  }, [count]);

  const material = useMemo(() => {
    const m = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms({
        uPxRatio: { value: gl.getPixelRatio() },
      }),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return m;
  }, [gl]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    const c = useStore.getState().cursor;
    m.uniforms.uCursor.value.set(c.x, c.y);
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}
