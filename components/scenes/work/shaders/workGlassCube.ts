import { Color, type Texture } from 'three';
import { palette } from '@/lib/palette';

// Source: shaders/work/voronoi.vert (Codex codex/voronoi-shader)
export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHoverAmount;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }

  float voronoi(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    float res = 1.0;

    for (int k = -1; k <= 1; k++) {
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec3 b = vec3(float(i), float(j), float(k));
          vec3 r = b + hash3(p + b) - f;
          float d = dot(r, r);
          res = min(res, d);
        }
      }
    }

    return clamp(sqrt(res), 0.0, 1.0);
  }

  void main() {
    float v = voronoi(position * 4.0 + uTime * 0.5);
    vec3 displaced = position + normal * v * 0.25 * uHoverAmount;
    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vUv = uv;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Source: shaders/work/voronoi.frag (Codex codex/voronoi-shader)
export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uEnvMap;
  uniform vec3 uTint;
  uniform float uHoverAmount;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  vec2 equirectUv(vec3 d) {
    return vec2(atan(d.z, d.x) / 6.2831853 + 0.5,
                asin(clamp(d.y, -1.0, 1.0)) / 3.1415926 + 0.5);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 R = reflect(-V, N);
    float off = 0.04 * uHoverAmount;

    vec2 uvR = equirectUv(R + vec3(off, 0.0, 0.0));
    vec2 uvG = equirectUv(R);
    vec2 uvB = equirectUv(R - vec3(off, 0.0, 0.0));

    vec3 chroma = vec3(texture2D(uEnvMap, uvR).r,
                       texture2D(uEnvMap, uvG).g,
                       texture2D(uEnvMap, uvB).b);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    vec3 col = mix(chroma, uTint, 0.2) + uTint * fres * 0.4;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type WorkGlassCubeUniforms = {
  uTime: { value: number };
  uHoverAmount: { value: number };
  uEnvMap: { value: Texture | null };
  uTint: { value: Color };
};

export function makeUniforms(
  overrides?: Partial<WorkGlassCubeUniforms>,
): WorkGlassCubeUniforms {
  return {
    uTime: { value: 0 },
    uHoverAmount: { value: 0 },
    uEnvMap: { value: null },
    uTint: { value: new Color(palette.glass.cubeFresnel) },
    ...overrides,
  };
}
