'use client';

import { create } from 'zustand';
import type { SceneId } from './sceneParams';

export type TransitionState = {
  from: SceneId;
  toSlug: string;
};

type State = {
  currentScene: SceneId;
  /** Smooth-tweened cursor in [-1, 1] NDC */
  cursor: { x: number; y: number };
  /** Asset preload progress [0, 1] */
  loadProgress: number;
  /** Scene-to-scene transition progress [0, 1]. 0 = transition start, 1 = settled. */
  transitionProgress: number;
  /** Active route transition descriptor; null when idle. Drives the WorkDetail particle dissolve. */
  transition: TransitionState | null;
  /** Lenis scroll progress [0, 1], normalized over the page's scrollable height. */
  scrollProgress: number;
  audioOn: boolean;
  reducedMotion: boolean;
};

type Actions = {
  setCurrentScene: (s: SceneId) => void;
  setCursor: (x: number, y: number) => void;
  setLoadProgress: (p: number) => void;
  setTransitionProgress: (p: number) => void;
  setTransition: (t: TransitionState | null) => void;
  setScrollProgress: (p: number) => void;
  toggleAudio: () => void;
  setReducedMotion: (r: boolean) => void;
};

export const useStore = create<State & Actions>((set) => ({
  currentScene: 'home',
  cursor: { x: 0, y: 0 },
  loadProgress: 0,
  transitionProgress: 1,
  transition: null,
  scrollProgress: 0,
  audioOn: false,
  reducedMotion: false,

  setCurrentScene: (s) => set({ currentScene: s }),
  setCursor: (x, y) => set({ cursor: { x, y } }),
  setLoadProgress: (p) => set({ loadProgress: p }),
  setTransitionProgress: (p) => set({ transitionProgress: p }),
  setTransition: (t) => set({ transition: t }),
  setScrollProgress: (p) => set({ scrollProgress: p }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setReducedMotion: (r) => set({ reducedMotion: r }),
}));
