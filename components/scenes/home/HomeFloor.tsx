'use client';

import { MeshReflectorMaterial } from '@react-three/drei';
import { hex } from '@/lib/palette';

/**
 * Mirror floor centered under the corridor. Uses drei MeshReflectorMaterial,
 * which renders the scene to a half-res off-screen RT once per frame and
 * blends it with a base color. resolution=512 + mixStrength=0.6 keeps the
 * extra cost ~+20 drawcalls on desktop.
 */
export function HomeFloor() {
  return (
    <mesh position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[16, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={0.6}
        mixContrast={1}
        depthScale={0.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1}
        roughness={0.85}
        metalness={0.4}
        color={hex('home.floorBase')}
        mirror={0.55}
      />
    </mesh>
  );
}
