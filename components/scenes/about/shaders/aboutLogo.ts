import { Color } from 'three';
import { palette } from '@/lib/palette';

// GLSL extracted from shaders/about/aboutLogo.{vert,frag} (Codex codex/about-logo-shader).
// Inlined as TS template strings to match the project's home/work shader convention.

export const vertexShader = /* glsl */ `
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 p = position + normal * sin(uTime + position.x * 2.0) * 0.02;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uTint;
  uniform vec3 uChroma;

  varying vec2 vUv;
  varying vec3 vNormal;

  float rect(vec2 p, vec2 halfSize) {
    vec2 d = abs(p) - halfSize;
    return step(max(d.x, d.y), 0.0);
  }

  float line(vec2 p, vec2 a, vec2 b, float width) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return step(length(pa - ba * h), width);
  }

  void main() {
    vec2 uv = vUv - 0.5;

    float ring = smoothstep(0.36, 0.34, length(uv)) - smoothstep(0.34, 0.32, length(uv));

    float aRect = rect(uv - vec2(-0.08, 0.0), vec2(0.08, 0.22));
    float tRect = rect(uv - vec2(0.10, 0.04), vec2(0.10, 0.16));
    float slash = line(uv, vec2(-0.16, -0.20), vec2(0.00, 0.20), 0.025);
    float at = max(max(aRect, tRect), slash);

    float sdf = max(ring, at);

    float fres = pow(1.0 - abs(vNormal.z), 2.0);
    vec3 col = mix(uTint, uChroma, fres);

    float pulse = 0.6 + sin(uTime * 2.0) * 0.4;
    gl_FragColor = vec4(col, sdf * pulse);
  }
`;

export type AboutLogoUniforms = {
  uTime: { value: number };
  uTint: { value: Color };
  uChroma: { value: Color };
};

export function makeUniforms(overrides?: Partial<AboutLogoUniforms>): AboutLogoUniforms {
  return {
    uTime: { value: 0 },
    uTint: { value: new Color(palette.white) },
    uChroma: { value: new Color(palette.home.screen) },
    ...overrides,
  };
}
