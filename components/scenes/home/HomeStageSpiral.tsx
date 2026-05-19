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

const SPIRAL_COUNT = 12;
const POINTS_PER_SPIRAL = 64;
const TUBE_SEGMENTS = 200;
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
    float head = fract(vUv.x * 1.5 - uTime * 0.18 + uPhase);
    float intensity = smoothstep(0.0, 0.04, head) * smoothstep(0.12, 0.04, head);

    vec3 baseColor = vec3(0.5) * 0.06;
    vec3 glowColor = uTrailColor * intensity * 3.0;
    float alpha = intensity * 0.95 + 0.05;

    gl_FragColor = vec4(baseColor + glowColor, alpha);
  }
`;

type SpiralTrail = {
  geometry: TubeGeometry;
  material: ShaderMaterial;
};

function makeSpiralTrail(index: number, trailColor: Color): SpiralTrail {
  const phaseOffset = (index / SPIRAL_COUNT) * TWO_PI;
  const radiusBase = 3.5 + (index % 3) * 0.8;
  const points: Vector3[] = [];

  for (let pointIndex = 0; pointIndex < POINTS_PER_SPIRAL; pointIndex++) {
    const t = (pointIndex / (POINTS_PER_SPIRAL - 1)) * Math.PI * 4;
    const radius = radiusBase * (1 - 0.3 * Math.sin(t * 0.5));
    const x = Math.cos(t + phaseOffset) * radius;
    const y = ((pointIndex - 32) / 32) * 4;
    const z = Math.sin(t + phaseOffset) * radius;

    points.push(new Vector3(x, y, z));
  }

  const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const geometry = new TubeGeometry(curve, TUBE_SEGMENTS, 0.008, 8, false);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: index / SPIRAL_COUNT },
      uTrailColor: { value: trailColor.clone() },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  return { geometry, material };
}

export function HomeStageSpiral(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const trailColor = useMemo(() => new Color(palette.pureWhite), []);
  const trails = useMemo(
    () => Array.from({ length: SPIRAL_COUNT }, (_, index) => makeSpiralTrail(index, trailColor)),
    [trailColor],
  );
  const trailsRef = useRef<SpiralTrail[]>(trails);

  useEffect(() => {
    trailsRef.current = trails;

    return () => {
      for (const trail of trails) {
        trail.geometry.dispose();
        trail.material.dispose();
      }
    };
  }, [trails]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
    }

    for (const trail of trailsRef.current) {
      // eslint-disable-next-line react-hooks/immutability -- R3F frame loop mutates Three.js uniforms.
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
