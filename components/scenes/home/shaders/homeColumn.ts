import { Color, Vector2 } from 'three';
import { palette } from '@/lib/palette';

export const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uTip;
  uniform vec3 uRim;
  uniform float uRimPow;

  void main() {
    float t = clamp(vWorldPos.y / 9.0, 0.0, 1.0);
    vec3 body = mix(uBase, uTip, smoothstep(0.1, 0.9, t));

    float rim = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uRimPow);
    vec3 col = body + uRim * rim * 0.6;

    // gentle vertical pulse along the rim
    col += uRim * rim * 0.08 * sin(uTime * 0.6 + vWorldPos.y * 0.4);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type HomeColumnUniforms = {
  uTime: { value: number };
  uCursor: { value: Vector2 };
  uBase: { value: Color };
  uTip: { value: Color };
  uRim: { value: Color };
  uRimPow: { value: number };
};

export function makeUniforms(overrides?: Partial<HomeColumnUniforms>): HomeColumnUniforms {
  return {
    uTime: { value: 0 },
    uCursor: { value: new Vector2(0, 0) },
    uBase: { value: new Color(palette.home.floorBase) },
    uTip: { value: new Color(palette.particles.coreB) },
    uRim: { value: new Color(palette.particles.coreA) },
    uRimPow: { value: 3.0 },
    ...overrides,
  };
}
