# 学习项目 / Learning Project — Active Theory Replica

这是一个面向 WebGL 学习的 Active Theory 复刻项目：用 Next.js、React Three Fiber 和自定义 shader 复现 Hydra 风格的走廊、玻璃案例网格、粒子转场与持久 Canvas 路由体验，重点记录每个阶段的工程取舍、视觉映射和可验证进度。

/

This is a WebGL learning project that rebuilds an Active Theory-style experience with Next.js, React Three Fiber, and custom shaders instead of the closed-source Hydra engine. It recreates the corridor hero, glass work grid, particle route transitions, and persistent Canvas navigation while keeping the work documented as a staged engineering study, with progress notes, shader mapping, and verification status preserved across sessions.

## Stack / 技术栈

- Next.js 16.2.6 (Turbopack/Webpack), React 19
- Three.js 0.184 + R3F + drei + postprocessing
- GSAP, Lenis, Howler, Zustand
- TypeScript strict, Tailwind v4

## Progress / 进度

| Phase | Status | 内容 / Content |
|---|---|---|
| 1 | Done / 已完成 | Project shell, 5 routes, persistent Canvas, zustand store, placeholder scenes. / 项目骨架、5 条路由、持久 Canvas、zustand 状态和占位场景。 |
| 2 | Done / 已完成 | Palette, scene parameters, project data, cursor/camera rig, asset tooling. / AT 配色、场景参数、项目数据、光标与相机 rig、资源脚本。 |
| 3 | Code done / 代码完成 | Home corridor, reflective floor, video back screen, particles, Bloom/CA/Vignette/LensStreak. / Home 走廊、反射地板、视频屏、粒子和后处理栈。 |
| 4 | Code done, runtime visual QA pending / 代码完成，运行时视觉待验 | Work glass cube grid, voronoi hover, scroll dolly, WorkDetail hero, 30k particle dissolve transition. / Work 玻璃方块、hover 碎裂、滚动 dolly、详情页 hero 和 30k 粒子转场。 |
| 5 | Planned / 计划中 | About, Contact, full navigation, audio toggle, mobile fallback. / About、Contact、完整导航、音频开关和移动端 fallback。 |
| 6 | Planned / 计划中 | Loader, performance pass, final visual QA, release polish. / Loader、性能优化、最终视觉验收和发布收口。 |

## Implemented Shaders / 已实现 Shader

| Shader | Source | Purpose 用途 |
|---|---|---|
| HomeAlleyShader | `components/scenes/home/shaders/homeAlley.ts` | Corridor wall material with scanlines, fresnel rim, roughness/normal texture coupling, cursor tint, and distant magenta glow. / 走廊墙面材质：扫描线、菲涅尔边缘、粗糙度与法线贴图耦合、光标染色和远端品红辉光。 |
| HomeColumnShader | `components/scenes/home/shaders/homeColumn.ts` | Vertical column gradient with camera-facing rim light and slow emissive pulse. / 柱体渐变、视角边缘光和缓慢发光脉冲。 |
| HomeLogoShader | `components/scenes/home/shaders/homeLogo.ts` | VideoTexture screen shader with RGB jitter, magenta tint, luminance lift, and bloom-ready emissive mix. / 视频屏 shader：RGB 抖动、品红染色、亮度提升和适配 Bloom 的发光混合。 |
| HomeParticleShader | `components/scenes/home/shaders/homeParticle.ts` | DPR-aware point particles with lightweight curl-like motion, cursor drift, depth sizing, and three-color gradient. / DPR 感知点粒子：轻量 curl 动态、光标漂移、深度缩放和三段颜色渐变。 |
| WorkBackgroundShader | `components/scenes/work/shaders/workBackground.ts` | Work scene backing plane with dark vertical gradient and slow procedural noise. / Work 场景背板：暗色垂直渐变和慢速程序噪声。 |
| WorkGlassCubeShader | `components/scenes/work/shaders/workGlassCube.ts` | Hover material for glass cubes using 3D voronoi normal displacement, equirect environment sampling, fresnel, and RGB split. / 玻璃方块 hover 材质：3D voronoi 法线位移、环境贴图采样、菲涅尔和 RGB 分离。 |
| WorkDetailDissolveShader | `components/scenes/workDetail/shaders/dissolve.ts` | Route transition particles that lerp from cube surface samples to the detail hero plane with curl disturbance and fade-out. / 路由转场粒子：从方块表面采样插值到详情页 hero 平面，带 curl 扰动和淡出。 |

## Run / 运行

```bash
npm install
npm run dev -- -p 3100
open http://localhost:3100
```

Webpack mode is often more stable on this machine when Turbopack/R3F dev memory pressure is high. / 在本机 Turbopack 与 R3F dev 内存压力较高时，Webpack 模式通常更稳：

```bash
npm run dev -- --webpack -p 3100
open http://localhost:3100
```

## References / 参考资源

- [Active Theory Hydra Medium article](https://medium.com/active-theory/the-story-of-technology-built-at-active-theory-5d17ae0e3fb4)
- [UIL JSON URL](https://activetheory.net/assets/data/uil.1778129964370.json)
- Plan file / 计划文件：`~/.claude/plans/https-activetheory-net-floating-turing.md`
