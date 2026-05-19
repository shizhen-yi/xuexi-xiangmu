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
import { WorkDetailParticles } from '@/components/scenes/workDetail/WorkDetailParticles';

/**
 * Maps the current pathname to one mounted scene. While a route transition
 * is active (`store.transition !== null`), the dissolve particle overlay
 * renders alongside the current scene — it survives the pathname swap so
 * particles smoothly bridge Work → WorkDetail.
 */
export function SceneRouter() {
  const pathname = usePathname();
  const setCurrentScene = useStore((s) => s.setCurrentScene);
  const currentScene = useStore((s) => s.currentScene);
  const transition = useStore((s) => s.transition);

  useEffect(() => {
    setCurrentScene(pathToSceneId(pathname));
  }, [pathname, setCurrentScene]);

  const sceneNode = (() => {
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
  })();

  return (
    <>
      {sceneNode}
      {transition && <WorkDetailParticles />}
    </>
  );
}
