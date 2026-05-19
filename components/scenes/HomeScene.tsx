'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, ShaderMaterial } from 'three';
import {
  vertexShader as ringVert,
  fragmentShader as ringFrag,
  makeUniforms as makeRingUniforms,
} from './home/shaders/homeRing';
import { HomeGoldParticles } from './home/HomeGoldParticles';
import { HomeTrails } from './home/HomeTrails';
import { HomeBackgroundStars } from './home/HomeBackgroundStars';
import { HomeStageShower } from './home/HomeStageShower';
import { HomeStageWorkshop } from './home/HomeStageWorkshop';
import { HomeStageSpiral } from './home/HomeStageSpiral';
import { useStore } from '@/lib/store';

/**
 * Trapezoid envelope:
 *   p < start      → 0
 *   p in [start, fadeIn]   → ramp 0 → 1 (smoothstep)
 *   p in [fadeIn, fadeOut] → 1
 *   p in [fadeOut, end]    → ramp 1 → 0 (smoothstep)
 *   p > end        → 0
 */
function stageEnvelope(p: number, start: number, fadeIn: number, fadeOut: number, end: number): number {
  if (p <= start || p >= end) return 0;
  if (p < fadeIn) return MathUtils.smoothstep(p, start, fadeIn);
  if (p > fadeOut) return 1 - MathUtils.smoothstep(p, fadeOut, end);
  return 1;
}

export function HomeScene() {
  const stage1Ref = useRef<Group>(null);
  const stage2Ref = useRef<Group>(null);
  const stage3Ref = useRef<Group>(null);
  const stage4Ref = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  const ringMaterial = useMemo(() => {
    const uniforms = makeRingUniforms();
    return new ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms,
      transparent: true,
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ringMaterial.uniforms.uTime.value = t;

    const { cursor, scrollProgress } = useStore.getState();

    // Stage envelopes — overlapping crossfades
    const s1 = stageEnvelope(scrollProgress, -0.05, 0.0, 0.22, 0.35);
    const s2 = stageEnvelope(scrollProgress, 0.25, 0.32, 0.48, 0.58);
    const s3 = stageEnvelope(scrollProgress, 0.5, 0.58, 0.72, 0.82);
    const s4 = stageEnvelope(scrollProgress, 0.75, 0.82, 1.0, 1.05);

    ringMaterial.uniforms.uOpacity.value = s1;

    const applyStage = (g: Group | null, opacity: number) => {
      if (!g) return;
      const visible = opacity > 0.005;
      g.visible = visible;
      if (visible) {
        // Lerp scale toward target opacity for a softer entry
        const target = 0.4 + opacity * 0.6;
        g.scale.setScalar(g.scale.x + (target - g.scale.x) * 0.15);
      }
    };

    applyStage(stage1Ref.current, s1);
    applyStage(stage2Ref.current, s2);
    applyStage(stage3Ref.current, s3);
    applyStage(stage4Ref.current, s4);

    // Stage 1 ring micro-anim + cursor parallax (only when stage 1 visible)
    if (stage1Ref.current && s1 > 0.01) {
      const cursorRotY = cursor.x * 0.15;
      const cursorRotX = -cursor.y * 0.1;
      stage1Ref.current.rotation.y += (cursorRotY - stage1Ref.current.rotation.y) * 0.05;
      stage1Ref.current.rotation.x += (cursorRotX - stage1Ref.current.rotation.x) * 0.05;
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.25;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
      ringRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <HomeBackgroundStars count={25000} />

      {/* Stage 1: Iridescent Ring */}
      <group ref={stage1Ref}>
        <group ref={ringRef}>
          <mesh material={ringMaterial}>
            <torusKnotGeometry args={[1, 0.32, 256, 32, 2, 3]} />
          </mesh>
        </group>
        <HomeGoldParticles count={20000} radius={5.5} />
        <HomeTrails />
      </group>

      {/* Stage 2: Vertical light shower */}
      <group ref={stage2Ref}>
        <HomeStageShower count={5000} />
      </group>

      {/* Stage 3: Industrial workshop under glass dome */}
      <group ref={stage3Ref}>
        <HomeStageWorkshop />
      </group>

      {/* Stage 4: Spiral light trails */}
      <group ref={stage4Ref}>
        <HomeStageSpiral />
      </group>
    </>
  );
}
