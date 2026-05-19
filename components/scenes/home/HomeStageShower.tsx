'use client';

import { useMemo, useRef, type JSX } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three';
import { palette } from '@/lib/palette';

const vertexShader = /* glsl */ `
  attribute float a_id;
  attribute float a_speed;

  varying float vSpeed;

  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    float baseY = position.y;
    float t = uTime * a_speed * 0.8;
    float y = mod(baseY + t + 8.0, 16.0) - 8.0;
    vec3 pos = vec3(position.x, y, position.z);
    pos.x += sin(uTime * 1.2 + a_id * 0.1) * 0.06;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (1.4 + 2.4 * a_speed) * uPixelRatio;
    gl_PointSize *= 1.0 / max(-mvPosition.z, 0.1);

    vSpeed = a_speed;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vSpeed;

  uniform vec3 uWhite;
  uniform vec3 uGold;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d);
    float whiteMix = smoothstep(0.6, 1.4, vSpeed);
    vec3 color = mix(uGold, uWhite, whiteMix) * 1.6;

    gl_FragColor = vec4(color, alpha);
  }
`;

type HomeStageShowerProps = {
  count?: number;
};

type HomeStageShowerUniforms = {
  uTime: { value: number };
  uPixelRatio: { value: number };
  uWhite: { value: Color };
  uGold: { value: Color };
};

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeUniforms(pixelRatio: number): HomeStageShowerUniforms {
  return {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uWhite: { value: new Color(palette.legacy.pureWhite) },
    uGold: { value: new Color('#e6b520') },
  };
}

export function HomeStageShower({ count = 5000 }: HomeStageShowerProps = {}): JSX.Element {
  const materialRef = useRef<ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const ids = new Float32Array(count);
    const speeds = new Float32Array(count);
    const rand = random(0x5f10f00d);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = rand() * 14 - 7;
      positions[i * 3 + 1] = rand() * 16 - 8;
      positions[i * 3 + 2] = rand() * 8 - 4;
      ids[i] = i;
      speeds[i] = 0.6 + rand() * 0.8;
    }

    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('a_id', new BufferAttribute(ids, 1));
    g.setAttribute('a_speed', new BufferAttribute(speeds, 1));
    g.computeBoundingSphere();

    return g;
  }, [count]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: makeUniforms(gl.getPixelRatio()),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, [gl]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  );
}
