/**
 * Active Theory color palette extracted from the public UIL configuration.
 *
 * Source: activetheory.net/assets/data/uil.1778129964370.json
 * Stats: 31 unique hex colors, 49 color entries, from 20 shader namespaces.
 */

const legacy = {
  /** HomeAlleyShader uPhongColor — 入口霓虹主色 */
  magenta: '#d600ff',
  /** CoreParticlesShader uColor — 粒子高亮紫 */
  magentaLight: '#c64dff',
  /** BulbShader uTint — 灯泡柔紫 */
  magentaDeep: '#b38aff',
  /** CoreParticlesShader uColor — 核心粒子第一停色 */
  particleA: '#c64dff',
  /** CoreParticlesShader uColorB — 核心粒子第二停色 */
  particleB: '#422ea3',
  /** CoreParticlesShader uColorC — 核心粒子第三停色 */
  particleC: '#84c8c3',
  /** HomeFloorShader uColor — 地面冷青光 */
  cyan: '#93e5ff',
  /** TreeFBR uColor — 树场景天光蓝 */
  cyanSky: '#94dbff',
  /** INPUT_HydraLensStreak_uHaloColor — 镜头 halo 冷白 */
  cyanWhite: '#cceeff',
  /** SpineShader uColor — Work 脊柱冰青 */
  cyanIce: '#d1fff4',
  /** GlassCubeShader uFresnelColor — Home 玻璃 fresnel */
  tealLight: '#b4e0e3',
  /** WorkGlassShader uFresnelColor — Work 玻璃雾青 */
  tealMist: '#e9f9ff',
  /** ParticleTestShader uTint — 测试粒子湖蓝 */
  blueLake: '#61c2ff',
  /** TreeFBR uColor — 树场景皇家蓝 */
  blueRoyal: '#8b9de5',
  /** TreeFBR uColor — 树场景灰蓝 */
  blueSlate: '#7687a2',
  /** RoomPBR uTint — CleanRoom 蓝紫材质 */
  bluePurple: '#a2aedd',
  /** TreeWaterShader uColor — 深海蓝 */
  blueDeepSea: '#002d57',
  /** HomeSceneVFX_home_uFogColor — Home 体积雾 */
  fog: '#1a90ad',
  /** L_Element_11_home_scenecolor — Home 电绿灯 */
  greenElectric: '#0bed90',
  /** PBR uTint — CleanRoom 荧光绿 */
  greenLime: '#00ff40',
  /** ATPBR uTint — Home PBR 冷白 tint */
  white: '#e5f1ff',
  /** GlassCubeShader uPhongColor — 纯白高光 */
  pureWhite: '#ffffff',
  /** INPUT_HydraLensStreak_uStreakColor — 镜头条纹色 */
  streak: '#c2dcff',
  /** WallShader uColor — 背景黑 */
  bg: '#000000',
  /** HomeFloorShader uBaseColor — Home 房间底色 */
  bgRoom: '#161616',
  /** FloorShader uColor — CleanRoom 深灰地面 */
  grayDark: '#454545',
  /** PBR uTint — CleanRoom 中灰材质 */
  grayMid: '#4f4f4f',
  /** TreeFBR uColor — TreeScene 石板灰 */
  graySlate: '#595959',
  /** PBR uTint — CleanRoom 软灰材质 */
  graySoft: '#6b6b6b',
  /** PBR uTint — CleanRoom 浅灰材质 */
  grayLight: '#c7c7c7',
  /** HomeAlleyShader uColor0 — Home 走廊雾灰 */
  grayMist: '#c9c8c8',
  /** GlassShaderPBR uFresnelColor — 玻璃测试红 */
  red: '#ff0000',
  /** CoreParticlesShader uColorB — 深粒子蓝 */
  blueDeep: '#422ea3',
} as const;

export const palette = {
  ...legacy,

  legacy,

  home: {
    /** HomeAlleyShader uPhongColor — 走廊霓虹屏光 */
    screen: '#d600ff',
    /** HomeAlleyShader uColor0 — 走廊墙面雾灰 */
    alleyMist: '#c9c8c8',
    /** HomeFloorShader uBaseColor — Home 地面暗底 */
    floorBase: '#161616',
    /** HomeFloorShader uColor — Home 地面冷青反光 */
    floorGlow: '#93e5ff',
    /** HomeScreenLight uColor — Home 屏幕投射光 */
    screenLight: '#d600ff',
    /** HomeSceneVFX_home_uFogColor — Home 场景体积雾 */
    fog: '#1a90ad',
    /** ATPBR uTint — Home 墙面、地面和平台 PBR tint */
    pbrTint: '#e5f1ff',
    /** BulbShader uTint — Home 灯泡柔紫 tint */
    bulbTint: '#b38aff',
  },

  work: {
    /** WorkGlassCubeShader uFresnelColor — Work 玻璃立方 fresnel 黑 */
    cubeFresnel: '#000000',
    /** WorkGlassCubeShader uPhongColor — Work 玻璃立方 phong 黑 */
    cubePhong: '#000000',
    /** WorkGlassShader uFresnelColor — Work 玻璃雾青 fresnel */
    glassFresnel: '#e9f9ff',
    /** WorkGlassShader uPhongColor — Work 玻璃白色高光 */
    glassPhong: '#ffffff',
    /** SpineShader uColor — Work 脊柱冰青发光 */
    spine: '#d1fff4',
    /** TentacleShader uTint — Work 触手柔紫 tint */
    tentacle: '#b38aff',
  },

  particles: {
    /** CoreParticlesShader uColor — 核心粒子第一停色 */
    coreA: '#c64dff',
    /** CoreParticlesShader uColorB — 核心粒子第二停色 */
    coreB: '#422ea3',
    /** CoreParticlesShader uColorC — 核心粒子第三停色 */
    coreC: '#84c8c3',
    /** ParticleTestShader uTint — ParticleTest 湖蓝 tint */
    testTint: '#61c2ff',
  },

  glass: {
    /** GlassCubeShader uFresnelColor — Home 玻璃立方 fresnel 青 */
    cubeFresnel: '#b4e0e3',
    /** GlassCubeShader uPhongColor — Home 玻璃立方白色高光 */
    cubePhong: '#ffffff',
    /** GlassShaderPBR uFresnelColor — 玻璃测试 fresnel 红 */
    pbrFresnel: '#ff0000',
    /** WorkGlassShader uFresnelColor — Work 玻璃 fresnel 雾青 */
    workFresnel: '#e9f9ff',
    /** WorkGlassShader uPhongColor — Work 玻璃 phong 白 */
    workPhong: '#ffffff',
    /** WorkGlassCubeShader uFresnelColor — Work 玻璃立方 fresnel 黑 */
    workCubeFresnel: '#000000',
    /** WorkGlassCubeShader uPhongColor — Work 玻璃立方 phong 黑 */
    workCubePhong: '#000000',
  },

  post: {
    /** INPUT_HydraBloom_Bloom_Tint — HydraBloom 泛光 tint */
    bloomTint: '#ffffff',
    /** INPUT_HydraLensStreak_uHaloColor — HydraLensStreak halo 色 */
    halo: '#cceeff',
    /** INPUT_HydraLensStreak_uStreakColor — HydraLensStreak streak 色 */
    streak: '#c2dcff',
    /** UnrealBloomComposite/UnrealBloomComposite/homebloom/bloomTintColor — Home bloom 合成 tint */
    homeBloom: '#ffffff',
    /** UnrealBloomComposite/UnrealBloomComposite/cleanroom/bloomTintColor — CleanRoom bloom 合成 tint */
    cleanRoomBloom: '#ffffff',
  },

  lights: {
    /** L_Element_11_home_scenecolor — Home 绿色点光 */
    homeGreen: '#0bed90',
    /** L_Element_9_CleanRoomcolor — CleanRoom 白色灯光 */
    cleanRoomWhite: '#ffffff',
  },

  pbr: {
    /** ATPBR uTint — Home ATPBR 冷白 tint */
    atHomeTint: '#e5f1ff',
    /** PBR/PBR/Element_0_CleanRoom/uTint — CleanRoom 中灰 PBR tint */
    cleanRoomGray: '#4f4f4f',
    /** PBR/PBR/Element_2_CleanRoom/uTint — CleanRoom 软灰 PBR tint */
    cleanRoomSoftGray: '#6b6b6b',
    /** PBR/PBR/Element_3_CleanRoom/uTint — CleanRoom 纯白 PBR tint */
    cleanRoomWhite: '#ffffff',
    /** PBR/PBR/Element_6_CleanRoom/uTint — CleanRoom 浅灰 PBR tint */
    cleanRoomLightGray: '#c7c7c7',
    /** PBR/PBR/Element_8_CleanRoom/uTint — CleanRoom 荧光绿 PBR tint */
    cleanRoomLime: '#00ff40',
    /** RoomPBR/RoomPBR/Element_3_CleanRoom/uTint — CleanRoom 房间蓝紫 tint */
    roomTint: '#a2aedd',
    /** TreeFBR/TreeFBR/Element_1_TreeScene/uColor — TreeScene 皇家蓝叶面 */
    treeRoyal: '#8b9de5',
    /** TreeFBR/TreeFBR/Element_5_TreeScene/uColor — TreeScene 灰蓝叶面 */
    treeSlate: '#7687a2',
    /** TreeFBR/TreeFBR/Element_6_TreeScene/uColor — TreeScene 白色叶面 */
    treeWhite: '#ffffff',
    /** TreeFBR/TreeFBR/Element_7_TreeScene/uColor — TreeScene 石板灰叶面 */
    treeGray: '#595959',
    /** TreeFBR/TreeFBR/Element_8_TreeScene/uColor — TreeScene 天光蓝叶面 */
    treeSky: '#94dbff',
    /** TreeWaterShader uColor — TreeScene 深海水面 */
    treeWaterDeep: '#002d57',
  },

  bg: {
    /** WallShader uColor — CleanRoom 墙面纯黑 */
    black: '#000000',
    /** HomeFloorShader uBaseColor — Home 房间暗底 */
    homeRoom: '#161616',
    /** FloorShader uColor — CleanRoom 深灰地面 */
    cleanRoomFloor: '#454545',
    /** PBR/PBR/Element_0_CleanRoom/uTint — CleanRoom 中灰背景材质 */
    grayMid: '#4f4f4f',
    /** TreeFBR/TreeFBR/Element_7_TreeScene/uColor — TreeScene 灰阶背景 */
    graySlate: '#595959',
    /** PBR/PBR/Element_2_CleanRoom/uTint — CleanRoom 软灰背景材质 */
    graySoft: '#6b6b6b',
    /** PBR/PBR/Element_6_CleanRoom/uTint — CleanRoom 浅灰背景材质 */
    grayLight: '#c7c7c7',
    /** HomeAlleyShader uColor0 — Home 走廊灰雾背景 */
    grayMist: '#c9c8c8',
    /** INPUT_HydraBloom_Bloom_Tint — bloom 白色背景参考 */
    white: '#ffffff',
  },
} as const;

export type Palette = typeof palette;
export type PaletteKey = string;

// Three.js-safe numeric color helper. Supports legacy flat keys and dot paths.
export const hex = (key: PaletteKey): number => {
  let value: unknown = palette;

  for (const part of key.split('.')) {
    if (!part || value === null || typeof value !== 'object' || !(part in value)) {
      throw new TypeError(`Unknown palette color: ${key}`);
    }

    value = (value as Record<string, unknown>)[part];
  }

  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new TypeError(`Palette key does not resolve to a hex color: ${key}`);
  }

  return Number.parseInt(value.slice(1), 16);
};

export const paletteRaw: Record<string, string> = {
  'ATPBR/ATPBR/Element_2_homeScene/uTint': '#e5f1ff',
  'ATPBR/ATPBR/Element_3_homeScene/uTint': '#e5f1ff',
  'ATPBR/ATPBR/Element_6_homeScene/uTint': '#e5f1ff',
  'BulbShader/BulbShader/Element_0_Bulb/uTint': '#b38aff',
  'CoreParticlesShader/CoreParticlesShader/P_Element_0_BodyCores/uColor': '#c64dff',
  'CoreParticlesShader/CoreParticlesShader/P_Element_0_BodyCores/uColorB': '#422ea3',
  'CoreParticlesShader/CoreParticlesShader/P_Element_0_BodyCores/uColorC': '#84c8c3',
  'FloorShader/FloorShader/Element_0_CleanRoom/uColor': '#454545',
  'GlassCubeShader/GlassCubeShader/Element_0_home_scene/uFresnelColor': '#b4e0e3',
  'GlassCubeShader/GlassCubeShader/Element_0_home_scene/uPhongColor': '#ffffff',
  'GlassShaderPBR/GlassShaderPBR/Element_1_glass_test/uFresnelColor': '#ff0000',
  'HomeAlleyShader/HomeAlleyShader/Element_4_home_scene/uColor0': '#c9c8c8',
  'HomeAlleyShader/HomeAlleyShader/Element_4_home_scene/uPhongColor': '#d600ff',
  'HomeFloorShader/HomeFloorShader/Element_2_home_scene/uBaseColor': '#161616',
  'HomeFloorShader/HomeFloorShader/Element_2_home_scene/uColor': '#93e5ff',
  'HomeSceneVFX_home_uFogColor': '#1a90ad',
  'HomeScreenLight/HomeScreenLight/Element_14_home_scene/uColor': '#d600ff',
  'HomeScreenLight/HomeScreenLight/Element_15_home_scene/uColor': '#d600ff',
  'INPUT_HydraBloom_Bloom_Tint': '#ffffff',
  'INPUT_HydraLensStreak_uHaloColor': '#cceeff',
  'INPUT_HydraLensStreak_uStreakColor': '#c2dcff',
  'L_Element_11_home_scenecolor': '#0bed90',
  'L_Element_9_CleanRoomcolor': '#ffffff',
  'ParticleTestShader/ParticleTestShader/P_Element_0_ParticleTest/uTint': '#61c2ff',
  'PBR/PBR/Element_0_CleanRoom/uTint': '#4f4f4f',
  'PBR/PBR/Element_1_CleanRoom/uTint': '#4f4f4f',
  'PBR/PBR/Element_2_CleanRoom/uTint': '#6b6b6b',
  'PBR/PBR/Element_3_CleanRoom/uTint': '#ffffff',
  'PBR/PBR/Element_6_CleanRoom/uTint': '#c7c7c7',
  'PBR/PBR/Element_8_CleanRoom/uTint': '#00ff40',
  'RoomPBR/RoomPBR/Element_3_CleanRoom/uTint': '#a2aedd',
  'SpineShader/SpineShader/Element_5_Work/uColor': '#d1fff4',
  'TentacleShader/TentacleShader/uTint': '#b38aff',
  'TreeFBR/TreeFBR/Element_1_TreeScene/uColor': '#8b9de5',
  'TreeFBR/TreeFBR/Element_5_TreeScene/uColor': '#7687a2',
  'TreeFBR/TreeFBR/Element_6_TreeScene/uColor': '#ffffff',
  'TreeFBR/TreeFBR/Element_7_TreeScene/uColor': '#595959',
  'TreeFBR/TreeFBR/Element_8_TreeScene/uColor': '#94dbff',
  'TreeWaterShader/TreeWaterShader/Element_9_TreeScene/uColor': '#ffffff',
  'TreeWaterShader/TreeWaterShader/uColor': '#002d57',
  'UnrealBloomComposite_shaderVariants_contactbloomTintColor': '#ffffff',
  'UnrealBloomComposite_shaderVariants_footerbloomTintColor': '#ffffff',
  'UnrealBloomComposite/UnrealBloomComposite/cleanroom/bloomTintColor': '#ffffff',
  'UnrealBloomComposite/UnrealBloomComposite/homebloom/bloomTintColor': '#ffffff',
  'WallShader/WallShader/Element_1_CleanRoom/uColor': '#000000',
  'WorkGlassCubeShader/WorkGlassCubeShader/uFresnelColor': '#000000',
  'WorkGlassCubeShader/WorkGlassCubeShader/uPhongColor': '#000000',
  'WorkGlassShader/WorkGlassShader/uFresnelColor': '#e9f9ff',
  'WorkGlassShader/WorkGlassShader/uPhongColor': '#ffffff',
} as const;

export default palette;
