'use client';

import { create } from 'zustand';
import type { SceneId } from './sceneParams';

type State = {
  currentScene: SceneId;
  /** Smooth-tweened cursor in [-1, 1] NDC */
  cursor: { x: number; y: number };
  /** Asset preload progress [0, 1] */
  loadProgress: number;
  /** Scene-to-scene transition progress [0, 1], 1 = fully on target */
  transitionProgress: number;
  audioOn: boolean;
  reducedMotion: boolean;
};

type Actions = {
  setCurrentScene: (s: SceneId) => void;
  setCursor: (x: number, y: number) => void;
  setLoadProgress: (p: number) => void;
  setTransitionProgress: (p: number) => void;
  toggleAudio: () => void;
  setReducedMotion: (r: boolean) => void;
};

export const useStore = create<State & Actions>((set) => ({
  currentScene: 'home',
  cursor: { x: 0, y: 0 },
  loadProgress: 0,
  transitionProgress: 1,
  audioOn: false,
  reducedMotion: false,

  setCurrentScene: (s) => set({ currentScene: s }),
  setCursor: (x, y) => set({ cursor: { x, y } }),
  setLoadProgress: (p) => set({ loadProgress: p }),
  setTransitionProgress: (p) => set({ transitionProgress: p }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setReducedMotion: (r) => set({ reducedMotion: r }),
}));
