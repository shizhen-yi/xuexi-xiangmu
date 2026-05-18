import { palette } from '@/lib/palette';

export type ProjectMedia = {
  readonly src: string;
  readonly alt: string;
};

export type ProjectHero = {
  readonly mp4: string;
  readonly poster: string;
};

export type ProjectAccent = {
  readonly primary: string;
  readonly secondary: string;
};

export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly year: number;
  readonly client: string;
  readonly tags: readonly string[];
  readonly accent: ProjectAccent;
  readonly summary: string;
  readonly description: string;
  readonly heroVideo: ProjectHero;
  readonly gallery: readonly ProjectMedia[];
};

export const projects = [
  {
    slug: 'signal-garden',
    title: 'Signal Garden',
    subtitle: '一座会随声音与触点生长的品牌数据温室。',
    year: 2026,
    client: 'Lumen Group',
    tags: ['WebGL', 'Interactive', 'Audio Reactive', 'Particle System'],
    accent: {
      primary: palette.lights.homeGreen,
      secondary: palette.particles.coreC,
    },
    summary: '用声纹、粒子和实时光场构建一座可探索的品牌花园。',
    description:
      '挑战在于把抽象的品牌声学资产变成可被浏览、停留和记住的空间，而不是一段只能观看的影片。我们把声音频谱拆成节奏、能量和密度三组信号，映射到粒子枝蔓、雾面光束与相机推进速度，让页面在互动时保持清晰叙事。\n\n解法采用轻量 WebGL 场景与 DOM 信息层并行驱动：用户滚动进入不同章节，场景逐步从点云生长为半透明结构。亮点是音频响应没有喧宾夺主，只在关键段落增强呼吸感，使品牌的“可听见的科技感”变成可操作的视觉系统。',
    heroVideo: {
      mp4: 'https://videos.pexels.com/video-files/3018669/3018669-uhd_2560_1440_30fps.mp4',
      poster: '',
    },
    gallery: [
      {
        src: 'https://picsum.photos/seed/signal-garden-1/1600/900',
        alt: 'Signal Garden particle field study',
      },
      {
        src: 'https://picsum.photos/seed/signal-garden-2/1600/900',
        alt: 'Signal Garden interaction detail',
      },
      {
        src: 'https://picsum.photos/seed/signal-garden-3/1600/900',
        alt: 'Signal Garden luminous data canopy',
      },
    ],
  },
  {
    slug: 'neon-index',
    title: 'Neon Index',
    subtitle: '为下一代创意档案设计一条高速霓虹索引。',
    year: 2025,
    client: 'Nebula AI',
    tags: ['WebGPU', 'GenAI', 'Real-time', 'Shader', '3D'],
    accent: {
      primary: palette.magenta,
      secondary: palette.particles.coreB,
    },
    summary: '将生成式检索结果转译为可穿行的霓虹档案隧道。',
    description:
      '挑战是让 AI 检索结果不再像列表，而像一条有方向、有速度、有层级的品牌通道。我们把结果置信度、主题距离和时间权重压缩为节点尺寸、隧道弧线与色带强度，用户在前进中理解信息关系，而不是被文本墙淹没。\n\n解法以 shader 驱动的管线空间承载视觉记忆点，React 层负责筛选状态和章节文案。亮点是实时结果只改变索引结构，不重建完整世界，因此切换查询时仍保留连续运动，让实验感和可用性保持在同一条轨道上。',
    heroVideo: {
      mp4: 'https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_24fps.mp4',
      poster: '',
    },
    gallery: [
      {
        src: 'https://picsum.photos/seed/neon-index-1/1600/900',
        alt: 'Neon Index corridor overview',
      },
      {
        src: 'https://picsum.photos/seed/neon-index-2/1600/900',
        alt: 'Neon Index search state',
      },
      {
        src: 'https://picsum.photos/seed/neon-index-3/1600/900',
        alt: 'Neon Index archive node detail',
      },
      {
        src: 'https://picsum.photos/seed/neon-index-4/1600/900',
        alt: 'Neon Index transition frame',
      },
    ],
  },
  {
    slug: 'echo-vault',
    title: 'Echo Vault',
    subtitle: '一套从记忆、影像与实时触发构成的沉浸式品牌片。',
    year: 2024,
    client: 'Aster Labs',
    tags: ['Brand Film', 'Real-time', 'Spatial', 'Shader'],
    accent: {
      primary: palette.home.floorGlow,
      secondary: palette.home.fog,
    },
    summary: '把品牌影片拆解成可触发的雾层、空间声场和记忆碎片。',
    description:
      '挑战来自传统品牌片的单向时间线：画面很强，但用户无法参与，也难以在网页上形成二次探索。我们把故事拆成多个空间片段，用滚动和指针位置触发镜头遮罩、雾层密度与旁白声像，让观众像进入档案库一样逐步拼合线索。\n\n解法保留影片质感，同时把关键帧做成实时可控的视觉层。亮点是每段内容都有明确的交互边界，用户不会迷失在效果里；技术上通过低频的 uniform 更新和预加载媒体队列，保证移动端也能平滑进入主叙事。',
    heroVideo: {
      mp4: 'https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4',
      poster: '',
    },
    gallery: [
      {
        src: 'https://picsum.photos/seed/echo-vault-1/1600/900',
        alt: 'Echo Vault atmospheric archive',
      },
      {
        src: 'https://picsum.photos/seed/echo-vault-2/1600/900',
        alt: 'Echo Vault film fragment',
      },
      {
        src: 'https://picsum.photos/seed/echo-vault-3/1600/900',
        alt: 'Echo Vault spatial interface',
      },
    ],
  },
  {
    slug: 'midnight-grid',
    title: 'Midnight Grid',
    subtitle: '为城市夜间服务品牌打造实时地图与光影叙事。',
    year: 2023,
    client: 'Nocturne Works',
    tags: ['WebGL', 'Real-time', 'Interactive', '3D'],
    accent: {
      primary: palette.post.streak,
      secondary: palette.pbr.roomTint,
    },
    summary: '以夜景网格和实时路径表现城市服务网络的隐形运转。',
    description:
      '挑战是让一套复杂的城市服务网络显得可信、精密，同时避免落入普通地图可视化的冷冰冰质感。我们将道路、站点和流量抽象为夜间光带，把用户悬停、滚动与章节切换转化为镜头高度和路径亮度变化。\n\n解法没有追求真实 GIS 还原，而是使用程序化网格和精选路径塑造品牌世界观。亮点在于信息层始终可读：当 3D 场景推进时，指标、案例和服务范围固定在稳定排版中，形成技术感与商业表达之间的平衡。',
    heroVideo: {
      mp4: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1280_720_30fps.mp4',
      poster: '',
    },
    gallery: [
      {
        src: 'https://picsum.photos/seed/midnight-grid-1/1600/900',
        alt: 'Midnight Grid city network',
      },
      {
        src: 'https://picsum.photos/seed/midnight-grid-2/1600/900',
        alt: 'Midnight Grid route highlight',
      },
      {
        src: 'https://picsum.photos/seed/midnight-grid-3/1600/900',
        alt: 'Midnight Grid dashboard moment',
      },
      {
        src: 'https://picsum.photos/seed/midnight-grid-4/1600/900',
        alt: 'Midnight Grid night map detail',
      },
    ],
  },
  {
    slug: 'liquid-origin',
    title: 'Liquid Origin',
    subtitle: '用可变形材质讲述新材料品牌的诞生过程。',
    year: 2022,
    client: 'Morrow Materials',
    tags: ['WebGL', 'Shader', 'Spatial', 'Particle System'],
    accent: {
      primary: palette.glass.cubeFresnel,
      secondary: palette.particles.coreA,
    },
    summary: '用液态 shader、折射边缘和粒子沉积呈现材料从原型到产品。',
    description:
      '挑战是把材料研发从实验室语言转成直观的网页体验：既要有触感和重量，也要解释从分子结构到应用场景的层级。我们用液态表面作为主视觉，把章节切换设计成形态相变，让用户在滚动中看见材料从流动、凝结到稳定的过程。\n\n解法以自定义 shader 控制法线扰动、边缘 fresnel 和粒子沉积，内容层则围绕性能、可持续和制造路径展开。亮点是视觉变化服务于理解：每一次形态稳定都对应一个产品论点，而不是单纯展示流体效果。',
    heroVideo: {
      mp4: 'https://videos.pexels.com/video-files/3045170/3045170-uhd_2560_1440_24fps.mp4',
      poster: '',
    },
    gallery: [
      {
        src: 'https://picsum.photos/seed/liquid-origin-1/1600/900',
        alt: 'Liquid Origin material surface',
      },
      {
        src: 'https://picsum.photos/seed/liquid-origin-2/1600/900',
        alt: 'Liquid Origin refractive detail',
      },
      {
        src: 'https://picsum.photos/seed/liquid-origin-3/1600/900',
        alt: 'Liquid Origin product transition',
      },
    ],
  },
] as const satisfies readonly Project[];

export const getProjectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);

export const getProjectIndex = (slug: string): number =>
  projects.findIndex((project) => project.slug === slug);

export const getNextProject = (slug: string): Project => {
  const index = getProjectIndex(slug);

  if (index === -1) {
    return projects[0];
  }

  return projects[(index + 1) % projects.length];
};
