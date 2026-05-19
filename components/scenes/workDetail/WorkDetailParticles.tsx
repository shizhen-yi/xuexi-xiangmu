'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Points,
  ShaderMaterial,
} from 'three';
import { fragmentShader, makeUniforms, vertexShader } from './shaders/dissolve';
import { useStore } from '@/lib/store';

const PARTICLE_COUNT_DESKTOP = 30000;
const PARTICLE_COUNT_MOBILE = 10000;
const CUBE_HALF = 0.6; // matches CUBE_SIZE/2 in WorkGlassCubes
const HERO_PLANE_CENTER: readonly [number, number, number] = [0, 1, -2];
const HERO_PLANE_HALF_X = 2.0;
const HERO_PLANE_HALF_Y = 1.0;

function detectCount(): number {
  if (typeof window === 'undefined') return PARTICLE_COUNT_DESKTOP;
  return window.matchMedia('(max-width: 768px)').matches
    ? PARTICLE_COUNT_MOBILE
    : PARTICLE_COUNT_DESKTOP;
}

/**
 * Samples a uniform random point on the unit cube surface (half-extent 0.5).
 * Returns the local-space position. Caller adds the cube world origin.
 */
function sampleCubeSurface(out: Float32Array, offset: number): void {
  const face = Math.floor(Math.random() * 6);
  const u = Math.random() - 0.5;
  const v = Math.random() - 0.5;
  switch (face) {
    case 0:
      out[offset] = CUBE_HALF;
      out[offset + 1] = v;
      out[offset + 2] = u;
      break;
    case 1:
      out[offset] = -CUBE_HALF;
      out[offset + 1] = v;
      out[offset + 2] = u;
      break;
    case 2:
      out[offset] = u;
      out[offset + 1] = CUBE_HALF;
      out[offset + 2] = v;
      break;
    case 3:
      out[offset] = u;
      out[offset + 1] = -CUBE_HALF;
      out[offset + 2] = v;
      break;
    case 4:
      out[offset] = u;
      out[offset + 1] = v;
      out[offset + 2] = CUBE_HALF;
      break;
    default:
      out[offset] = u;
      out[offset + 1] = v;
      out[offset + 2] = -CUBE_HALF;
      break;
  }
}

/**
 * Mounted by SceneRouter only while `transition !== null`. Spawns particles
 * from the clicked cube's world position and dissolves them onto the detail
 * page's hero plane region. `uProgress` reads from `transitionProgress`.
 */
export function WorkDetailParticles() {
  const transition = useStore((s) => s.transition);
  const pointsRef = useRef<Points>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const count = useMemo(() => detectCount(), []);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3); // unused but Three needs `position`
    const fromPos = new Float32Array(count * 3);
    const toPos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const lives = new Float32Array(count);

    const [ox, oy, oz] = transition?.fromWorldPos ?? [0, 0, 0];
    const [hx, hy, hz] = HERO_PLANE_CENTER;

    for (let i = 0; i < count; i++) {
      const base = i * 3;
      sampleCubeSurface(fromPos, base);
      fromPos[base] += ox;
      fromPos[base + 1] += oy;
      fromPos[base + 2] += oz;

      toPos[base] = hx + (Math.random() * 2 - 1) * HERO_PLANE_HALF_X;
      toPos[base + 1] = hy + (Math.random() * 2 - 1) * HERO_PLANE_HALF_Y;
      toPos[base + 2] = hz + (Math.random() * 2 - 1) * 0.1;

      seeds[i] = Math.random();
      lives[i] = Math.random();
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aFromPos', new BufferAttribute(fromPos, 3));
    g.setAttribute('aToPos', new BufferAttribute(toPos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    g.setAttribute('aLife', new BufferAttribute(lives, 1));
    return g;
    // We intentionally recompute the buffers per mount — the cube origin
    // changes each transition, and unmount happens once `transition === null`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, transition?.fromWorldPos]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: makeUniforms({
          uPxRatio: { value: gl.getPixelRatio() },
        }),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [gl],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uProgress.value = useStore.getState().transitionProgress;
  });

  if (!transition) return null;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}
