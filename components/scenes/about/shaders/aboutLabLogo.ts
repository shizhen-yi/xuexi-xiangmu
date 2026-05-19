import { Color } from 'three';
import { palette } from '@/lib/palette';

// Simplified take on shaders/about/labLogo.{vert,frag} (Codex codex/lab-logo-shader).
// The Codex original used barycentric-coord wireframe rendering, which requires
// per-vertex aBary attributes on a non-indexed BufferGeometry. We instead drive a
// LineSegments + EdgesGeometry mesh (matches WorkGlassCubes' pattern), so this
// shader only needs to handle the float wobble + emissive pulse on line vertices.

export const vertexShader = /* glsl */ `
  uniform float uTime;

  void main() {
    vec3 p = position;
    p.y += sin(uTime + position.x) * 0.05;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    float pulse = mix(0.7, 1.3, sin(uTime * 1.5) * 0.5 + 0.5);
    gl_FragColor = vec4(uColor * pulse, 1.0);
  }
`;

export type AboutLabLogoUniforms = {
  uTime: { value: number };
  uColor: { value: Color };
};

export function makeUniforms(overrides?: Partial<AboutLabLogoUniforms>): AboutLabLogoUniforms {
  return {
    uTime: { value: 0 },
    uColor: { value: new Color(palette.particles.coreA) },
    ...overrides,
  };
}
