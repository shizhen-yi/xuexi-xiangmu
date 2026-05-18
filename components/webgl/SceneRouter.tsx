'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { pathToSceneId } from '@/lib/sceneParams';
import { HomeScene } from '@/components/scenes/HomeScene';
import { WorkScene } from '@/components/scenes/WorkScene';
import { WorkDetailScene } from '@/components/scenes/WorkDetailScene';
import { AboutScene } from '@/components/scenes/AboutScene';
import { ContactScene } from '@/components/scenes/ContactScene';

/**
 * Maps the current pathname to one mounted scene. Phase-1 implementation is a
 * naive swap. Phase 4 will replace this with crossfade + WorkDetail particle
 * dissolve transitions driven by `transitionProgress` in the store.
 */
export function SceneRouter() {
  const pathname = usePathname();
  const setCurrentScene = useStore((s) => s.setCurrentScene);
  const currentScene = useStore((s) => s.currentScene);

  useEffect(() => {
    setCurrentScene(pathToSceneId(pathname));
  }, [pathname, setCurrentScene]);

  switch (currentScene) {
    case 'home':
      return <HomeScene />;
    case 'work':
      return <WorkScene />;
    case 'workDetail':
      return <WorkDetailScene />;
    case 'about':
      return <AboutScene />;
    case 'contact':
      return <ContactScene />;
  }
}
