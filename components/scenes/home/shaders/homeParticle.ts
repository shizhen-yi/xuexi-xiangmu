import { Color, Vector2 } from 'three';
import { palette } from '@/lib/palette';

export const vertexShader = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;

  varying vec3 vColor;

  uniform float uTime;
  uniform vec2 uCursor;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uSizeScale;
  uniform float uPxRatio;

  void main() {
    vec3 p = position;

    // curl-noise-lite: 3 phase-offset sin/cos drives for each axis
    p.x += sin(uTime * 0.6 + aSeed * 6.283) * 0.4;
    p.z += cos(uTime * 0.4 + aSeed * 3.141) * 0.4;
    p.y += sin(uTime * 0.5 + aSeed * 9.42) * 0.25;

    // slow rise along y with per-particle phase, wrap inside corridor height
    p.y = mod((p.y - 0.5) + uTime * 0.05 * (0.4 + aSeed), 8.0) + 0.5;

    // cursor drift (subtle)
    p.x += uCursor.x * 0.3;
    p.y += uCursor.y * 0.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // size attenuates with depth and respects DPR
    gl_PointSize = aSize * uSizeScale * uPxRatio * (8.0 / max(-mv.z, 0.1));

    // 3-stop color gradient driven by aSeed
    vec3 c1 = mix(uColorA, uColorB, smoothstep(0.0, 0.5, aSeed));
    vColor = mix(c1, uColorC, smoothstep(0.5, 1.0, aSeed));
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * 0.9;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export type HomeParticleUniforms = {
  uTime: { value: number };
  uCursor: { value: Vector2 };
  uColorA: { value: Color };
  uColorB: { value: Color };
  uColorC: { value: Color };
  uSizeScale: { value: number };
  uPxRatio: { value: number };
};

export function makeUniforms(overrides?: Partial<HomeParticleUniforms>): HomeParticleUniforms {
  return {
    uTime: { value: 0 },
    uCursor: { value: new Vector2(0, 0) },
    uColorA: { value: new Color(palette.particles.coreA) },
    uColorB: { value: new Color(palette.particles.coreB) },
    uColorC: { value: new Color(palette.particles.coreC) },
    uSizeScale: { value: 1 },
    uPxRatio: { value: 1 },
    ...overrides,
  };
}
