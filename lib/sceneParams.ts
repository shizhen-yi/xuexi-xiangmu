/**
 * Per-scene camera and rig parameters mapped from Active Theory's public UIL JSON:
 * https://activetheory.net/assets/data/uil.1778129964370.json
 *
 * Raw UIL fields captured here:
 * position, lookAt, rotation, cameraRotation, groupPos, viewportFocus, fov,
 * moveXY, wobbleStrength, deltaRotate, lerpSpeed, lerpSpeed2, far, near.
 *
 * Defaults only fill missing required runtime fields:
 * lookAt defaults to [position.x, position.y, 0], fov to 30, lerpSpeed to 0.08,
 * wobbleStrength to 0.08, and moveXY to [0, 0]. About/Contact use Home-derived
 * low-intensity fallbacks where their UIL entries are sparse.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

export type SceneParams = {
  position: Vec3;
  lookAt: Vec3;
  fov: number;
  lerpSpeed: number;
  wobbleStrength: number;
  moveXY: Vec2;
  groupPos?: Vec3;
  viewportFocus?: Vec2;
  lerpSpeed2?: number;
  rotation?: Vec3;
  cameraRotation?: Vec3;
  deltaRotate?: number;
  far?: number;
  near?: number;
};

export type SceneId = 'home' | 'work' | 'workDetail' | 'about' | 'contact';

export const sceneParams: Readonly<Record<SceneId, SceneParams>> = {
  home: {
    position: [0, 0, 7],
    lookAt: [0, 0, 0],
    fov: 38,
    lerpSpeed: 0.08,
    wobbleStrength: 0.05,
    moveXY: [0.3, 0.2],
    groupPos: [0, 0, 0],
    lerpSpeed2: 1,
    rotation: [0, 0, 0],
    deltaRotate: 3,
    far: 100,
  },
  work: {
    position: [0, 0, 2],
    lookAt: [0, 0, -4],
    fov: 35,
    lerpSpeed: 0.07,
    wobbleStrength: 0.08,
    moveXY: [0, 0],
    groupPos: [0, 0, 0],
    lerpSpeed2: 1,
    rotation: [0, 196.07, 0],
    cameraRotation: [0, 0, 0],
  },
  workDetail: {
    position: [0, 0, 1],
    lookAt: [0, 0, -10],
    fov: 30,
    lerpSpeed: 0.07,
    wobbleStrength: 0.08,
    moveXY: [-1, 0.5],
    groupPos: [0, 0, 9.33],
    viewportFocus: [0, 0],
  },
  about: {
    position: [0, 0, 6],
    lookAt: [0, 0, 0],
    fov: 30,
    lerpSpeed: 0.1,
    wobbleStrength: 0.06,
    moveXY: [0, 0],
  },
  contact: {
    position: [0, 0, 6],
    lookAt: [0, 0, 0],
    fov: 30,
    lerpSpeed: 0.1,
    wobbleStrength: 0.06,
    moveXY: [0, 0],
    groupPos: [0, 0, 0.004],
  },
} as const;

export const cameraRawByScene: Readonly<
  Record<SceneId, Readonly<Record<string, unknown>>>
> = {
  home: {
    CAMERA_Element_1_Homefov: 30,
    CAMERA_Element_1_HomegroupPos: [0, 0, 0],
    CAMERA_Element_1_HomelerpSpeed: 0.1,
    CAMERA_Element_1_HomelerpSpeed2: 1,
    CAMERA_Element_1_HomelookAt: [0, 4.59, 0],
    CAMERA_Element_1_HomemoveXY: [0, 0],
    CAMERA_Element_1_Homeposition: [0, 2, 40],
    CAMERA_Element_1_homeScenefar: 100,
    CAMERA_Element_1_homeScenefov: 20,
    CAMERA_Element_1_homeScenelookAt: [0, 3, 0],
    CAMERA_Element_1_homeSceneposition: [0, 3, 15],
    CAMERA_Element_3_home_scenedeltaRotate: 3,
    CAMERA_Element_3_home_scenefov: 30,
    CAMERA_Element_3_home_scenegroupPos: [0, 1.95, 8.020000000000001],
    CAMERA_Element_3_home_scenemoveXY: [0.4, 0.2],
    CAMERA_Element_3_home_sceneposition: [0, 0, 8],
    CAMERA_Element_3_home_scenerotation: [0, 0, 0],
    CAMERA_Element_3_home_scenewobbleStrength: 0.1,
  },
  work: {
    CAMERA_Element_2_WorkcameraRotation: [0, 0, 0],
    CAMERA_Element_2_Workfov: 35,
    CAMERA_Element_2_WorkgroupPos: [0, 0, 0],
    CAMERA_Element_2_WorklerpSpeed: 0.07,
    CAMERA_Element_2_WorklerpSpeed2: 1,
    CAMERA_Element_2_WorklookAt: [0, 0, -4],
    CAMERA_Element_2_WorkmoveXY: [0, 0],
    CAMERA_Element_2_Workposition: [0, 0, 2],
    CAMERA_Element_2_Workrotation: [0, 196.07, 0],
    CAMERA_Element_2_work_pagemoveXY: [0.5, 0.5],
    CAMERA_Element_2_work_pageposition: [0, 0, 2],
  },
  workDetail: {
    CAMERA_Element_1_WorkDetailParticleslookAt: [0, 0, 5],
    CAMERA_Element_1_WorkDetailParticlesmoveXY: [-4, 4],
    CAMERA_Element_1_WorkDetailParticlesposition: [0, 0, 22],
    CAMERA_Element_1_WorkDetailgroupPos: [0, 0, 9.33],
    CAMERA_Element_1_WorkDetaillerpSpeed: 0.07,
    CAMERA_Element_1_WorkDetaillookAt: [0, 0, -10],
    CAMERA_Element_1_WorkDetailmoveXY: [-1, 0.5],
    CAMERA_Element_1_WorkDetailposition: [0, 0, 1],
    CAMERA_Element_1_WorkDetailviewportFocus: [0, 0],
  },
  about: {
    CAMERA_Element_1_AboutmoveXY: [0, 0],
    CAMERA_Element_1_Aboutposition: [0, 0, 6],
  },
  contact: {
    CAMERA_Element_1_ContactUsposition: [0, 0, 6],
    CAMERA_Element_1_ContactgroupPos: [0, 0, 0.004],
    CAMERA_Element_1_Contactposition: [0, 0, 6],
  },
} as const;

export const sceneFromUilKey = (key: string): SceneId | null => {
  if (key in cameraRawByScene.home) return 'home';
  if (key in cameraRawByScene.work) return 'work';
  if (key in cameraRawByScene.workDetail) return 'workDetail';
  if (key in cameraRawByScene.about) return 'about';
  if (key in cameraRawByScene.contact) return 'contact';
  return null;
};

export const pathToSceneId = (pathname: string): SceneId => {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/work/')) return 'workDetail';
  if (pathname === '/work') return 'work';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  return 'home';
};
