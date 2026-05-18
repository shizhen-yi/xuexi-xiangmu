import { Color, Texture, Vector2 } from 'three';
import { palette } from '@/lib/palette';

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform float uScrollSpd;

  void main() {
    vUv = uv * vec2(4.0, 1.0);
    vUv.x += uTime * uScrollSpd;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  uniform float uTime;
  uniform vec2 uCursor;
  uniform vec3 uColor0;
  uniform vec3 uPhongColor;
  uniform float uFresnelPow;
  uniform sampler2D uNormalMap;
  uniform sampler2D uRoughMap;

  void main() {
    // top -> floor falloff
    float fall = smoothstep(0.0, 8.0, vWorldPos.y);
    vec3 base = mix(uColor0, uColor0 * 0.35, fall);

    // sample normal/rough just for texture coupling; we don't do real PBR here
    float roughness = texture2D(uRoughMap, vUv).r;
    vec3 nMap = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
    vec3 n = normalize(vNormal + nMap * 0.15);

    // scanlines drifting up
    float scan = step(0.5, fract(vUv.y * 28.0 + uTime * 0.6));
    base += uPhongColor * (1.0 - scan) * 0.06 * roughness;

    // fresnel rim toward camera
    float fres = pow(1.0 - max(dot(n, vViewDir), 0.0), uFresnelPow);
    vec3 col = base + uPhongColor * fres * 0.35;

    // distance glow toward back wall (-z deeper)
    float depthGlow = smoothstep(-30.0, -5.0, vWorldPos.z);
    col += uPhongColor * (1.0 - depthGlow) * 0.18;

    // subtle cursor reactive tint
    col += uPhongColor * 0.04 * uCursor.x;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type HomeAlleyUniforms = {
  uTime: { value: number };
  uCursor: { value: Vector2 };
  uColor0: { value: Color };
  uPhongColor: { value: Color };
  uFresnelPow: { value: number };
  uScrollSpd: { value: number };
  uNormalMap: { value: Texture | null };
  uRoughMap: { value: Texture | null };
};

export function makeUniforms(overrides?: Partial<HomeAlleyUniforms>): HomeAlleyUniforms {
  return {
    uTime: { value: 0 },
    uCursor: { value: new Vector2(0, 0) },
    uColor0: { value: new Color(palette.home.alleyMist) },
    uPhongColor: { value: new Color(palette.home.screen) },
    uFresnelPow: { value: 2.5 },
    uScrollSpd: { value: 0.03 },
    uNormalMap: { value: null },
    uRoughMap: { value: null },
    ...overrides,
  };
}
