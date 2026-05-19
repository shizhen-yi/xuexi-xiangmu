import { Color } from 'three';
import { palette } from '@/lib/palette';

// Source: shaders/workDetail/dissolve.vert (Codex codex/dissolve-shader)
export const vertexShader = /* glsl */ `
  attribute vec3 aFromPos;
  attribute vec3 aToPos;
  attribute float aSeed;
  attribute float aLife;

  uniform float uTime;
  uniform float uProgress;
  uniform float uPxRatio;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vProgress;
  varying vec3 vColor;

  vec3 curlNoise(vec3 p) {
    return vec3(
      sin(p.y * 1.7 + p.z * 0.9) - cos(p.z * 2.3),
      sin(p.z * 1.3 + p.x * 1.1) - cos(p.x * 2.1),
      sin(p.x * 0.7 + p.y * 1.9) - cos(p.y * 2.5)
    );
  }

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    vec3 base = mix(aFromPos, aToPos, p);
    vec3 curl = curlNoise(base * 0.5 + uTime * 0.3 + aSeed * 6.283);
    float disturb = 1.0 - abs(uProgress - 0.5) * 2.0;
    vec3 pos = base + curl * disturb * 0.8;

    gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
    gl_PointSize = (2.0 + sin(aSeed * 6.283) * 1.0) * uPxRatio;

    vProgress = uProgress;
    vColor = aSeed < 0.33 ? uColorA : (aSeed < 0.66 ? uColorB : uColorC);
  }
`;

// Source: shaders/workDetail/dissolve.frag (Codex codex/dissolve-shader)
export const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vProgress;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d) * 0.9;
    alpha *= 1.0 - smoothstep(0.85, 1.0, vProgress);

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export type DissolveUniforms = {
  uTime: { value: number };
  uProgress: { value: number };
  uPxRatio: { value: number };
  uColorA: { value: Color };
  uColorB: { value: Color };
  uColorC: { value: Color };
};

export function makeUniforms(overrides?: Partial<DissolveUniforms>): DissolveUniforms {
  return {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPxRatio: { value: 1 },
    uColorA: { value: new Color(palette.particles.coreA) },
    uColorB: { value: new Color(palette.particles.coreB) },
    uColorC: { value: new Color(palette.particles.coreC) },
    ...overrides,
  };
}
