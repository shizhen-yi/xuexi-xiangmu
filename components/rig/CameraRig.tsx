'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { sceneParams } from '@/lib/sceneParams';

const targetVec = new THREE.Vector3();
const lookAtVec = new THREE.Vector3();
const tmpVec = new THREE.Vector3();

/**
 * Single camera, smoothly lerped toward the current scene's parameters.
 * Adds cursor-parallax (moveXY) and an idle sin-based wobble (wobbleStrength).
 * Mirrors the per-scene `CAMERA_Element_*_<Scene>*` fields from Active Theory's UIL.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const currentScene = useStore((s) => s.currentScene);
  const cursor = useStore((s) => s.cursor);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    const p = sceneParams[currentScene];
    tRef.current += delta;
    const t = tRef.current;

    const wobble = reducedMotion ? 0 : p.wobbleStrength;
    const moveX = reducedMotion ? 0 : cursor.x * p.moveXY[0];
    const moveY = reducedMotion ? 0 : cursor.y * p.moveXY[1];

    targetVec.set(
      p.position[0] + moveX + Math.sin(t * 0.4) * wobble,
      p.position[1] + moveY + Math.cos(t * 0.3) * wobble,
      p.position[2] + Math.sin(t * 0.15) * wobble * 0.5,
    );

    lookAtVec.set(p.lookAt[0], p.lookAt[1], p.lookAt[2]);

    camera.position.lerp(targetVec, p.lerpSpeed);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fovDelta = p.fov - camera.fov;
      if (Math.abs(fovDelta) > 0.01) {
        camera.fov += fovDelta * p.lerpSpeed;
        camera.updateProjectionMatrix();
      }
    }

    tmpVec.copy(camera.position).add(
      lookAtVec.clone().sub(camera.position).normalize(),
    );
    camera.lookAt(lookAtVec);
  });

  return null;
}
