'use client';

import { useEffect, useMemo, useRef, type JSX } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  Group,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import { palette } from '@/lib/palette';

const TRAIL_COUNT = 5;
const POINTS_PER_TRAIL = 8;
const TWO_PI = Math.PI * 2;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uTrailColor;

  varying vec2 vUv;

  void main() {
    float head = fract(vUv.x - uTime * 0.15 + uPhase);
    float intensity = smoothstep(0.0, 0.05, head) * smoothstep(0.15, 0.05, head);

    vec3 baseColor = vec3(0.6) * 0.08;
    vec3 glowColor = uTrailColor * intensity * 2.5;
    float baseAlpha = 0.08;
    float finalAlpha = max(baseAlpha, intensity * 0.9);

    gl_FragColor = vec4(baseColor + glowColor, finalAlpha);
  }
`;

type Trail = {
  geometry: TubeGeometry;
  material: ShaderMaterial;
};

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeTrail(index: number, trailColor: Color): Trail {
  const rand = random(0x5f3759df + index * 977);
  const startPhi = (index / TRAIL_COUNT) * TWO_PI + rand() * 0.4;
  const points: Vector3[] = [];

  for (let i = 0; i < POINTS_PER_TRAIL; i++) {
    const radius = 1.5 + rand() * 1.5;
    const phi = startPhi + i * (Math.PI / 4 + (rand() - 0.5) * 0.16);
    const theta = Math.PI / 2 + (rand() - 0.5) * 1.0;

    points.push(
      new Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.cos(theta),
        radius * Math.sin(theta) * Math.sin(phi),
      ),
    );
  }

  const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const geometry = new TubeGeometry(curve, 200, 0.012, 8, false);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: index / TRAIL_COUNT },
      uTrailColor: { value: trailColor.clone() },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  return { geometry, material };
}

export function HomeTrails(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const trailColor = useMemo(() => new Color(palette.pureWhite), []);
  const trails = useMemo(
    () => Array.from({ length: TRAIL_COUNT }, (_, index) => makeTrail(index, trailColor)),
    [trailColor],
  );

  useEffect(() => {
    return () => {
      for (const trail of trails) {
        trail.geometry.dispose();
        trail.material.dispose();
      }
    };
  }, [trails]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }

    for (const trail of trails) {
      trail.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={groupRef}>
      {trails.map((trail, index) => (
        <mesh key={index}>
          <primitive object={trail.geometry} attach="geometry" />
          <primitive object={trail.material} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
