import { palette } from '@/lib/palette';

const toGlslRgb = (hex: string): string => {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  return `vec3(${r.toFixed(6)}, ${g.toFixed(6)}, ${b.toFixed(6)})`;
};

const coreTint = toGlslRgb(palette.particles.coreA);
const metalTint = toGlslRgb(palette.home.pbrTint);
const haloTint = toGlslRgb(palette.post.halo);
const sparkTint = toGlslRgb(palette.lights.homeGreen);

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  uniform float uTime;

  mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }

  void main() {
    vUv = uv;

    mat3 yRot = rotateY(uTime * 0.1);
    vec3 animatedPosition = yRot * position;
    animatedPosition.y += sin(uTime) * 0.15;

    vec4 worldPos = modelMatrix * vec4(animatedPosition, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * (yRot * normal));
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
  uniform float uOpacity;

  const float PI = 3.14159265359;

  vec3 cosinePalette(float hue) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);

    return a + b * cos(6.28318530718 * (c * hue + d));
  }

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  vec3 fakeEnvironment(vec3 ray, float fresnel) {
    float latitude = ray.y * 0.5 + 0.5;
    float longitude = atan(ray.z, ray.x) / (PI * 2.0) + 0.5;

    float horizon = smoothstep(0.18, 0.88, latitude);
    float bandA = smoothstep(0.43, 0.50, latitude) * (1.0 - smoothstep(0.53, 0.62, latitude));
    float bandB = pow(0.5 + 0.5 * sin((longitude + ray.y * 0.18 + uTime * 0.035) * 30.0), 10.0);
    float bandC = pow(0.5 + 0.5 * sin((longitude - ray.y * 0.24 - uTime * 0.02) * 54.0), 18.0);

    vec3 coolSteel = ${metalTint};
    vec3 deepPurple = ${coreTint};
    vec3 coldHalo = ${haloTint};
    vec3 electric = ${sparkTint};

    vec3 env = mix(deepPurple * 0.22, coolSteel * 0.95, horizon);
    env += coldHalo * bandA * 1.15;
    env += electric * bandB * mix(0.16, 0.48, fresnel);
    env += vec3(1.0) * bandC * 0.38;

    return env;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 R = normalize(reflect(-V, N));

    float ndv = saturate(dot(N, V));
    float fres = pow(1.0 - ndv, 2.2);
    float halo = pow(1.0 - ndv, 3.8);
    float outerHalo = pow(1.0 - ndv, 7.5);

    float hue = fract(fres * 1.45 + R.y * 0.22 + uTime * 0.05);

    vec3 rainbow = vec3(
      cosinePalette(fract(hue - 0.028)).r,
      cosinePalette(hue).g,
      cosinePalette(fract(hue + 0.028)).b
    );

    vec3 tint = ${coreTint};
    vec3 metal = fakeEnvironment(R, fres);

    vec3 halfA = normalize(normalize(vec3(-0.7, 0.35, 0.62)) + V);
    vec3 halfB = normalize(normalize(vec3(0.35, 0.78, -0.5)) + V);
    float specA = pow(saturate(dot(N, halfA)), 96.0);
    float specB = pow(saturate(dot(N, halfB)), 42.0);
    float anisotropic = pow(abs(sin((vUv.x * 18.0 + vUv.y * 6.0 + uTime * 0.24) * PI)), 22.0);
    anisotropic *= smoothstep(0.18, 1.0, fres);

    vec3 thinFilm = mix(rainbow, tint, 0.18) * mix(0.78, 2.65, fres);
    vec3 color = mix(metal, thinFilm, 0.52 + fres * 0.18);
    color += vec3(1.0, 0.96, 0.9) * specA * 1.55;
    color += ${haloTint} * specB * 0.95;
    color += rainbow * anisotropic * 0.72;

    vec3 haloColor = mix(${haloTint}, rainbow, 0.38);
    color += haloColor * halo * 2.8;
    color += haloColor * outerHalo * 6.5;
    color += vec3(1.0) * outerHalo * 1.35;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

export type HomeRingUniforms = {
  uTime: { value: number };
  uOpacity: { value: number };
};

export function makeUniforms(overrides?: Partial<HomeRingUniforms>): HomeRingUniforms {
  return {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    ...overrides,
  };
}
