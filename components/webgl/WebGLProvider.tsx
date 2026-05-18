'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CameraRig } from '@/components/rig/CameraRig';
import { CursorTracker } from '@/components/rig/CursorTracker';
import { SceneRouter } from './SceneRouter';
import { sceneParams } from '@/lib/sceneParams';

/**
 * Persistent global Canvas mounted in the root layout. It survives client-side
 * route changes (the layout component does not unmount), so WebGL state, GL
 * context, and pipeline caches persist across scenes.
 */
export function WebGLProvider() {
  const home = sceneParams.home;
  return (
    <>
      <CursorTracker />
      <div className="canvas-layer" data-canvas-root>
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          camera={{
            position: home.position,
            fov: home.fov,
            near: 0.1,
            far: 200,
          }}
          style={{ background: '#000' }}
        >
          <CameraRig />
          <Suspense fallback={null}>
            <SceneRouter />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
