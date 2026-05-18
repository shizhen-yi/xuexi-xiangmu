'use client';

import { BlendFunction, Effect } from 'postprocessing';
import { Color, Uniform } from 'three';
import { wrapEffect } from '@react-three/postprocessing';

/**
 * Custom LensStreak — AT-inspired horizontal anisotropic bloom streak.
 *
 * Mounted in PostFX between Bloom and ChromaticAberration. Adds a horizontal
 * 13-tap gaussian streak only on pixels above `threshold` luminance, plus a
 * radial halo contribution. Streak tinted with `streakColor` (default #c2dcff,
 * cool blue), halo with `haloColor` (default #cceeff, paler).
 *
 * `inputBuffer` (sampler2D) is auto-provided by the postprocessing 6.x Effect
 * base, so we don't declare it as an explicit uniform.
 */
const fragmentShader = /* glsl */ `
  uniform float uIntensity;
  uniform float uThreshold;
  uniform float uStretch;
  uniform vec3 uStreakColor;
  uniform vec3 uHaloColor;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Horizontal 13-tap anisotropic gaussian, gated by soft luminance threshold.
    vec3 streak = vec3(0.0);
    float total = 0.0;
    for (float i = -6.0; i <= 6.0; i += 1.0) {
      vec2 offset = vec2(i * uStretch, 0.0);
      vec3 s = texture2D(inputBuffer, uv + offset).rgb;
      float lum = dot(s, vec3(0.299, 0.587, 0.114));
      float w = exp(-i * i * 0.08) * smoothstep(uThreshold, 1.0, lum);
      streak += s * w;
      total += w;
    }
    streak = (streak / max(total, 0.001)) * uStreakColor * uIntensity;

    // Radial halo gated by source luminance (only bright center pixels bloom out).
    vec2 c = vec2(0.5);
    float radial = max(1.0 - distance(uv, c) * 2.0, 0.0);
    float halo = pow(radial, 3.0)
      * smoothstep(uThreshold, 1.0, dot(inputColor.rgb, vec3(0.333)));

    outputColor = vec4(
      inputColor.rgb + streak + uHaloColor * halo * uIntensity * 0.3,
      inputColor.a
    );
  }
`;

export interface LensStreakOptions {
  /** Horizontal streak tint (cool blue by default, AT palette #c2dcff). */
  streakColor?: string;
  /** Radial halo tint (paler blue, AT palette #cceeff). */
  haloColor?: string;
  /** Master scalar applied to both streak and halo contributions. Typical 0.4-0.9. */
  intensity?: number;
  /** Soft luminance gate. Pixels below this contribute zero. Typical 0.6-0.85. */
  threshold?: number;
  /** Horizontal sample step in UV space. Larger = longer streaks. Typical 0.015-0.04. */
  stretch?: number;
}

export class LensStreakEffectImpl extends Effect {
  constructor({
    streakColor = '#c2dcff',
    haloColor = '#cceeff',
    intensity = 0.6,
    threshold = 0.7,
    stretch = 0.02,
  }: LensStreakOptions = {}) {
    super('LensStreakEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uIntensity', new Uniform(intensity)],
        ['uThreshold', new Uniform(threshold)],
        ['uStretch', new Uniform(stretch)],
        ['uStreakColor', new Uniform(new Color(streakColor))],
        ['uHaloColor', new Uniform(new Color(haloColor))],
      ]),
    });
  }
}

/**
 * React component wrapper for use inside `<EffectComposer>`. Props map to
 * `LensStreakOptions`. See `LensStreakEffectImpl` for the underlying Effect.
 *
 * Usage:
 * ```tsx
 * <LensStreak streakColor="#c2dcff" haloColor="#cceeff" intensity={0.6} />
 * ```
 */
export const LensStreak = wrapEffect(LensStreakEffectImpl);
