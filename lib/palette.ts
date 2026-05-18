// Color palette extracted from Active Theory's public UIL configuration.
// 31 unique hex values across CoreParticles, GlassCube, HomeAlley, HomeFloor,
// HydraBloom/LensStreak, TreeFBR, RoomPBR, ATPBR and more.

export const palette = {
  // Signature neons (Hero screen lights, work cube edges, UI accents)
  magenta: '#d600ff',
  magentaLight: '#c64dff',
  magentaDeep: '#b38aff',

  // Particle gradient stops (CoreParticlesShader)
  particleA: '#c64dff',
  particleB: '#422ea3',
  particleC: '#84c8c3',

  // Cyan / teal family (floors, fresnel, fog)
  cyan: '#93e5ff',
  cyanSky: '#94dbff',
  cyanWhite: '#cceeff',
  cyanIce: '#d1fff4',
  tealLight: '#b4e0e3',
  tealMist: '#e9f9ff',
  blueLake: '#61c2ff',
  blueRoyal: '#8b9de5',
  blueSlate: '#7687a2',
  bluePurple: '#a2aedd',
  blueDeepSea: '#002d57',
  fog: '#1a90ad',

  // Green accents (CleanRoom highlights, scene lights)
  greenElectric: '#0bed90',
  greenLime: '#00ff40',

  // Tints (PBR, ATPBR)
  white: '#e5f1ff',
  pureWhite: '#ffffff',
  streak: '#c2dcff',

  // Grays (PBR materials)
  bg: '#000000',
  bgRoom: '#161616',
  grayDark: '#454545',
  grayMid: '#4f4f4f',
  graySlate: '#595959',
  graySoft: '#6b6b6b',
  grayLight: '#c7c7c7',
  grayMist: '#c9c8c8',

  // Reserved test/debug colors
  red: '#ff0000',

  // Deep particle blue
  blueDeep: '#422ea3',
} as const;

export type PaletteKey = keyof typeof palette;

// Three.js helper — convert to numeric color
export const hex = (key: PaletteKey): number => parseInt(palette[key].slice(1), 16);
