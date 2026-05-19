'use client';

import { useMemo, useRef, type JSX } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, ShaderMaterial } from 'three';
import { palette } from '@/lib/palette';

const PARTICLE_COUNT = 250;
const TWO_PI = Math.PI * 2;

const vertexShader = /* glsl */ `
  attribute float a_id;
  attribute float a_radius;
  attribute float a_theta;
  attribute float a_phi;
  attribute float a_size;

  varying float vGlow;

  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    float orbitJitter = fract(sin(a_id * 78.233) * 43758.5453123);
    float theta = a_theta + sin(uTime * 0.42 + a_id * 1.71) * 0.18;
    float phi = a_phi + uTime * (0.26 + orbitJitter * 0.12);
    float radius = a_radius + sin(uTime * 0.65 + a_id * 2.39) * 0.08;

    vec3 pos = vec3(
      radius * sin(theta) * cos(phi),
      radius * cos(theta),
      radius * sin(theta) * sin(phi)
    );

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (2.0 + a_size) * uPixelRatio;

    vGlow = 0.72 + 0.28 * sin(uTime * 1.7 + a_id * 4.13);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vGlow;

  uniform vec3 uColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.2, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d);
    vec3 color = uColor * (1.8 + core * 1.6) * vGlow;
    float alpha = (core * 0.88 + halo * 0.38) * vGlow;

    gl_FragColor = vec4(color, alpha);
  }
`;

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeParticleGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const ids = new Float32Array(PARTICLE_COUNT);
  const radii = new Float32Array(PARTICLE_COUNT);
  const thetas = new Float32Array(PARTICLE_COUNT);
  const phis = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const rand = random(0xace7ab1e);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.acos(rand() * 2 - 1);
    const phi = rand() * TWO_PI;
    const radius = 2.6 + rand() * 0.4;

    positions[i * 3 + 0] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.cos(theta);
    positions[i * 3 + 2] = radius * Math.sin(theta) * Math.sin(phi);

    ids[i] = i + rand();
    radii[i] = radius;
    thetas[i] = theta;
    phis[i] = phi;
    sizes[i] = rand();
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('a_id', new BufferAttribute(ids, 1));
  geometry.setAttribute('a_radius', new BufferAttribute(radii, 1));
  geometry.setAttribute('a_theta', new BufferAttribute(thetas, 1));
  geometry.setAttribute('a_phi', new BufferAttribute(phis, 1));
  geometry.setAttribute('a_size', new BufferAttribute(sizes, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export function HomeStageWorkshop(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const particleMaterialRef = useRef<ShaderMaterial>(null);

  const particleGeometry = useMemo(() => makeParticleGeometry(), []);
  const particleMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new Color(palette.particles.testTint) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }

    const material = particleMaterialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <group>
      <pointLight position={[0, 4, 0]} intensity={6} color="#88ccff" distance={8} />

      <group ref={groupRef}>
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[3, 0.3, 3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 2, 24]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
        </mesh>

        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[1.5, 0.8, 1.5]} />
          <meshStandardMaterial color="#2a2a2a" emissive="#1a4a6a" emissiveIntensity={0.4} roughness={0.6} />
        </mesh>

        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 1.5, 12]} />
          <meshStandardMaterial color="#444444" roughness={0.5} />
        </mesh>

        <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 1.5, 12]} />
          <meshStandardMaterial color="#444444" roughness={0.5} />
        </mesh>

        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>

      <mesh castShadow={false} receiveShadow={false}>
        <icosahedronGeometry args={[3, 2]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.08}
          transmission={0.6}
          thickness={0.3}
          roughness={0.1}
          ior={1.45}
          color="#88ccff"
        />
      </mesh>

      <points frustumCulled={false}>
        <primitive object={particleGeometry} attach="geometry" />
        <primitive ref={particleMaterialRef} object={particleMaterial} attach="material" />
      </points>
    </group>
  );
}
