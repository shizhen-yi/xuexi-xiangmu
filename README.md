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
| 5 | Done / 已完成 | AboutScene (SDF logo + wireframe lab + team), ContactScene (particles + bilingual form), hamburger menu (GSAP slide-out), AudioToggle (Howler ambient), MobileFallback poster, bilingual README. / AboutScene（SDF logo、线框实验室、团队）、ContactScene（粒子和双语表单）、汉堡菜单（GSAP 滑出）、AudioToggle（Howler 环境音）、MobileFallback 海报和双语 README。 |
| 6 | In progress / 进行中 | HomeScene rebuilt as a 4-stage scroll narrative (ring → shower → workshop → spiral), LoadingMandala, multi-viewport sanity in progress, v0.1 tag pending. / HomeScene 重建为 4-stage 滚动叙事（ring → shower → workshop → spiral）、LoadingMandala、多视口 sanity 进行中，v0.1 tag 待发布。 |

## Implemented Shaders / 已实现 Shader

| Shader | Source | Purpose 用途 |
|---|---|---|
| HomeRingShader | `components/scenes/home/shaders/homeRing.ts` | Iridescent torus ring for Home stage 1, with chromatic fresnel and rotating shimmer. / Home 第 1 段的虹彩环形 torus，带色散菲涅尔和旋转闪烁。 |
| HomeParticleShader | `components/scenes/home/shaders/homeParticle.ts` | DPR-aware point particles with lightweight curl-like motion, cursor drift, depth sizing, and three-color gradient. / DPR 感知点粒子：轻量 curl 动态、光标漂移、深度缩放和三段颜色渐变。 |
| WorkBackgroundShader | `components/scenes/work/shaders/workBackground.ts` | Work scene backing plane with dark vertical gradient and slow procedural noise. / Work 场景背板：暗色垂直渐变和慢速程序噪声。 |
| WorkGlassCubeShader | `components/scenes/work/shaders/workGlassCube.ts` | Hover material for glass cubes using 3D voronoi normal displacement, equirect environment sampling, fresnel, and RGB split. / 玻璃方块 hover 材质：3D voronoi 法线位移、环境贴图采样、菲涅尔和 RGB 分离。 |
| WorkDetailDissolveShader | `components/scenes/workDetail/shaders/dissolve.ts` | Route transition particles that lerp from cube surface samples to the detail hero plane with curl disturbance and fade-out. / 路由转场粒子：从方块表面采样插值到详情页 hero 平面，带 curl 扰动和淡出。 |
| AboutLogoShader | `components/scenes/about/shaders/aboutLogo.ts` | SDF Active Theory-style logo with chromatic fresnel and shader-driven glow. / SDF Active Theory 风格 logo，带色散菲涅尔和 shader 发光。 |
| AboutLabLogoShader | `components/scenes/about/shaders/aboutLabLogo.ts` | Wireframe lab-logo pulse with floating drift and cyan/magenta energy. / 线框实验室 logo 脉冲，带漂浮偏移和青色/品红能量感。 |

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
