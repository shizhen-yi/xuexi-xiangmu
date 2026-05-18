// Per-scene camera & rig parameters.
// Values mapped from Active Theory's public UIL JSON (CAMERA_Element_*_<Scene>* keys).

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export type SceneParams = {
  position: Vec3;
  lookAt: Vec3;
  fov: number;
  /** Cursor parallax intensity (camera translates `cursor * moveXY`) */
  moveXY: Vec2;
  /** Idle camera wobble amplitude (sin-based drift) */
  wobbleStrength: number;
  /** Camera lerp speed toward target (lower = smoother, AT uses 0.07-0.1) */
  lerpSpeed: number;
};

export type SceneId = 'home' | 'work' | 'workDetail' | 'about' | 'contact';

export const sceneParams: Record<SceneId, SceneParams> = {
  // CAMERA_Element_1_Home* + CAMERA_Element_3_home_scene*
  home: {
    position: [0, 2, 40],
    lookAt: [0, 4.59, 0],
    fov: 30,
    moveXY: [0.4, 0.2],
    wobbleStrength: 0.1,
    lerpSpeed: 0.1,
  },
  // CAMERA_Element_2_Work*
  work: {
    position: [0, 0, 2],
    lookAt: [0, 0, -4],
    fov: 35,
    moveXY: [0, 0],
    wobbleStrength: 0.05,
    lerpSpeed: 0.07,
  },
  // CAMERA_Element_1_WorkDetail*
  workDetail: {
    position: [0, 0, 1],
    lookAt: [0, 0, -10],
    fov: 30,
    moveXY: [-1, 0.5],
    wobbleStrength: 0.04,
    lerpSpeed: 0.07,
  },
  // CAMERA_Element_1_About*
  about: {
    position: [0, 0, 6],
    lookAt: [0, 0, 0],
    fov: 30,
    moveXY: [0, 0],
    wobbleStrength: 0.06,
    lerpSpeed: 0.08,
  },
  // CAMERA_Element_1_Contact*
  contact: {
    position: [0, 0, 6],
    lookAt: [0, 0, 0],
    fov: 30,
    moveXY: [0, 0],
    wobbleStrength: 0.06,
    lerpSpeed: 0.08,
  },
};

export const pathToSceneId = (pathname: string): SceneId => {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/work/')) return 'workDetail';
  if (pathname === '/work') return 'work';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  return 'home';
};
