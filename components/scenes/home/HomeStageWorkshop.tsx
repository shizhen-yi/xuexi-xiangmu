'use client';

import { useMemo, useRef, type JSX } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  ShaderMaterial,
} from 'three';

const DOME_RADIUS = 2.6;
const INNER_PARTICLE_COUNT = 600;
const HANGING_LINE_COUNT = 18;

const particleVert = /* glsl */ `
  attribute float a_seed;
  varying float vSeed;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.18 + a_seed * 9.0) * 0.12;
    pos.x += cos(uTime * 0.15 + a_seed * 7.0) * 0.08;
    pos.z += sin(uTime * 0.16 + a_seed * 5.0) * 0.08;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.4 + 1.6 * a_seed) * uPixelRatio * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vSeed = a_seed;
  }
`;

const particleFrag = /* glsl */ `
  varying float vSeed;
  uniform vec3 uColorWarm;
  uniform vec3 uColorCool;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorCool, uColorWarm, vSeed);
    gl_FragColor = vec4(color * (0.5 + 0.5 * vSeed), alpha * 0.65);
  }
`;

export function HomeStageWorkshop(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const particleRef = useRef<Group>(null);

  const domeEdges = useMemo(() => {
    const geo = new IcosahedronGeometry(DOME_RADIUS, 1);
    return new EdgesGeometry(geo, 1);
  }, []);

  const particleGeometry = useMemo(() => {
    const positions = new Float32Array(INNER_PARTICLE_COUNT * 3);
    const seeds = new Float32Array(INNER_PARTICLE_COUNT);

    for (let i = 0; i < INNER_PARTICLE_COUNT; i++) {
      let x = 0,
        y = 0,
        z = 0,
        r = 0;
      do {
        x = (Math.random() * 2 - 1) * DOME_RADIUS * 0.85;
        y = (Math.random() * 2 - 1) * DOME_RADIUS * 0.85;
        z = (Math.random() * 2 - 1) * DOME_RADIUS * 0.85;
        r = Math.sqrt(x * x + y * y + z * z);
      } while (r > DOME_RADIUS * 0.85);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random();
    }

    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('a_seed', new BufferAttribute(seeds, 1));
    return g;
  }, []);

  const particleMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: particleVert,
        fragmentShader: particleFrag,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uColorWarm: { value: new Color('#cceeff') },
          uColorCool: { value: new Color('#5a86a8') },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  const hangingLines = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < HANGING_LINE_COUNT; i++) {
      const phi = (i / HANGING_LINE_COUNT) * Math.PI * 2;
      const startR = DOME_RADIUS * 0.95;
      const sx = Math.cos(phi) * startR * 0.3;
      const sy = DOME_RADIUS * 0.8;
      const sz = Math.sin(phi) * startR * 0.3;

      const endR = 0.4 + ((i * 137) % 100) / 100 * 0.6;
      const ex = Math.cos(phi + 0.3) * endR;
      const ey = -0.5 - ((i * 79) % 100) / 100 * 0.5;
      const ez = Math.sin(phi + 0.3) * endR;

      positions.push(sx, sy, sz, ex, ey, ez);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const domeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: new Color('#3a6680'),
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );

  const hangingMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: new Color('#7090a8'),
        transparent: true,
        opacity: 0.35,
      }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    particleMaterial.uniforms.uTime.value = t;
    particleMaterial.uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
    if (particleRef.current) {
      particleRef.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={domeEdges} material={domeMaterial} />
      <lineSegments geometry={hangingLines} material={hangingMaterial} />

      <mesh position={[0, -DOME_RADIUS * 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 64]} />
        <meshBasicMaterial color="#4a7a99" transparent opacity={0.25} />
      </mesh>

      <group ref={particleRef}>
        <points geometry={particleGeometry} material={particleMaterial} />
      </group>
    </group>
  );
}
