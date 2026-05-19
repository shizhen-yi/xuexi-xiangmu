import { palette } from '@/lib/palette';

const toGlslRgb = (hex: string): string => {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  return `vec3(${r.toFixed(6)}, ${g.toFixed(6)}, ${b.toFixed(6)})`;
};

const coreTint = toGlslRgb(palette.particles.coreA);

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

  vec3 cosinePalette(float hue) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);

    return a + b * cos(6.28318530718 * (c * hue + d));
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
    float hue = fract(fres * 1.5 + uTime * 0.05);

    vec3 rainbow = vec3(
      cosinePalette(fract(hue - 0.02)).r,
      cosinePalette(hue).g,
      cosinePalette(fract(hue + 0.02)).b
    );

    vec3 tint = ${coreTint};
    vec3 color = mix(rainbow, tint, 0.3);
    color *= mix(0.8, 3.0, fres);

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
