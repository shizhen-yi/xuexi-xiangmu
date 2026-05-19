'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BoxGeometry, EdgesGeometry, type Group } from 'three';
import { palette } from '@/lib/palette';
import { projects } from '@/data/projects';
import { useStore } from '@/lib/store';

const DOLLY_RANGE = 24;

const CUBE_SIZE = 1.2;

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
}: {
  slug: string;
  position: readonly [number, number, number];
}) {
  const boxGeom = useMemo(() => new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE), []);
  const edgesGeom = useMemo(() => new EdgesGeometry(boxGeom, 15), [boxGeom]);

  useEffect(() => {
    return () => {
      boxGeom.dispose();
      edgesGeom.dispose();
    };
  }, [boxGeom, edgesGeom]);

  return (
    <group position={position} userData={{ slug }}>
      <mesh geometry={boxGeom}>
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
      </mesh>
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color={palette.magenta} />
      </lineSegments>
    </group>
  );
}

export function WorkGlassCubes() {
  const dollyRef = useRef<Group>(null);

  useFrame(() => {
    if (!dollyRef.current) return;
    dollyRef.current.position.z = useStore.getState().scrollProgress * DOLLY_RANGE;
  });

  return (
    <group ref={dollyRef}>
      {projects.map((project, i) => {
        const pos = CUBE_POSITIONS[i] ?? ([0, 0, -10 - i * 4] as const);
        return <WorkGlassCube key={project.slug} slug={project.slug} position={pos} />;
      })}
    </group>
  );
}
