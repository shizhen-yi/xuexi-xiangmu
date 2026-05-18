import { Color, Texture } from 'three';
import { palette } from '@/lib/palette';

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform sampler2D uTex;
  uniform vec3 uTint;
  uniform float uGlitch;
  uniform float uOpacity;

  void main() {
    vec2 uv = vUv;
    float jitter = sin(uv.y * 60.0 + uTime * 4.0) * uGlitch * 0.02;
    uv.x += jitter;

    float r = texture2D(uTex, uv + vec2( 0.003 * uGlitch, 0.0)).r;
    float g = texture2D(uTex, uv).g;
    float b = texture2D(uTex, uv - vec2( 0.003 * uGlitch, 0.0)).b;
    vec3 rgb = vec3(r, g, b);

    // bias toward magenta so it always reads as the screen tint
    rgb = mix(rgb, rgb * uTint, 0.35);

    // luminance lift so dark frames still glow
    float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    rgb *= 0.6 + lum * 0.8;

    // emissive blend with tint for bloom
    rgb = mix(rgb, uTint, 0.15);

    gl_FragColor = vec4(rgb, uOpacity);
  }
`;

export type HomeLogoUniforms = {
  uTime: { value: number };
  uTex: { value: Texture | null };
  uTint: { value: Color };
  uGlitch: { value: number };
  uOpacity: { value: number };
};

export function makeUniforms(overrides?: Partial<HomeLogoUniforms>): HomeLogoUniforms {
  return {
    uTime: { value: 0 },
    uTex: { value: null },
    uTint: { value: new Color(palette.home.screen) },
    uGlitch: { value: 0 },
    uOpacity: { value: 1 },
    ...overrides,
  };
}
