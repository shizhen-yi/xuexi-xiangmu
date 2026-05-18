import { Color } from 'three';
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
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;

  float noise(vec2 p, float t) {
    return 0.25 * (
      sin(p.x * 4.0 + t * 0.3)
      + sin(p.y * 5.0 - t * 0.2)
      + sin((p.x + p.y) * 3.0 + t * 0.4)
      + sin((p.x - p.y) * 6.0 - t * 0.1)
    );
  }

  void main() {
    vec3 col = mix(uColorTop, uColorBottom, smoothstep(0.0, 1.0, vUv.y));
    col += noise(vUv, uTime) * 0.02;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export type WorkBackgroundUniforms = {
  uTime: { value: number };
  uColorTop: { value: Color };
  uColorBottom: { value: Color };
};

export function makeUniforms(): WorkBackgroundUniforms {
  return {
    uTime: { value: 0 },
    uColorTop: { value: new Color(palette.bg.homeRoom) },
    uColorBottom: { value: new Color(palette.bg.black) },
  };
}
