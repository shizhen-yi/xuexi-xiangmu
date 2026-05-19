'use client';

import { useEnvironment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BoxGeometry, EdgesGeometry, ShaderMaterial, type Group, type Texture } from 'three';
import { palette } from '@/lib/palette';
import { projects } from '@/data/projects';
import { useStore } from '@/lib/store';
import {
  fragmentShader,
  makeUniforms,
  vertexShader,
} from './shaders/workGlassCube';

const CUBE_SIZE = 1.2;
const DOLLY_RANGE = 24;

const CUBE_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [3, 0.3, -4],
  [-3, -0.3, -8],
  [2, 0, -12],
  [-2, 0.3, -16],
  [0, -0.3, -20],
];

function WorkGlassCube({
  slug,
  position,
  envMap,
}: {
  slug: string;
  position: readonly [number, number, number];
  envMap: Texture;
}) {
  const boxGeom = useMemo(() => new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE), []);
  const edgesGeom = useMemo(() => new EdgesGeometry(boxGeom, 15), [boxGeom]);

  const [hovered, setHovered] = useState(false);

  const voronoiMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: makeUniforms({ uEnvMap: { value: envMap } }),
      }),
    [envMap],
  );

  useEffect(() => {
    return () => {
      boxGeom.dispose();
      edgesGeom.dispose();
      voronoiMaterial.dispose();
    };
  }, [boxGeom, edgesGeom, voronoiMaterial]);

  useFrame((state, dt) => {
    voronoiMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    damp(voronoiMaterial.uniforms.uHoverAmount, 'value', hovered ? 1 : 0, 0.15, dt);
  });

  return (
    <group position={position} userData={{ slug }}>
      <mesh
        geometry={boxGeom}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {hovered ? (
          <primitive object={voronoiMaterial} attach="material" />
        ) : (
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.5}
            roughness={0.1}
            ior={1.4}
            clearcoat={1}
            attenuationColor={palette.glass.cubeFresnel}
            attenuationDistance={1.5}
            envMapIntensity={1.2}
          />
        )}
      </mesh>
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color={palette.magenta} />
      </lineSegments>
    </group>
  );
}

export function WorkGlassCubes() {
  const dollyRef = useRef<Group>(null);
  const envMap = useEnvironment({ files: '/hdri/studio_small_09_1k.hdr' });

  useFrame(() => {
    if (!dollyRef.current) return;
    dollyRef.current.position.z = useStore.getState().scrollProgress * DOLLY_RANGE;
  });

  return (
    <group ref={dollyRef}>
      {projects.map((project, i) => {
        const pos = CUBE_POSITIONS[i] ?? ([0, 0, -10 - i * 4] as const);
        return (
          <WorkGlassCube
            key={project.slug}
            slug={project.slug}
            position={pos}
            envMap={envMap as Texture}
          />
        );
      })}
    </group>
  );
}
