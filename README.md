# 学习项目 — Active Theory Replica

复刻 [activetheory.net](https://activetheory.net/) 的 WebGL 学习项目。把他们闭源的 Hydra 引擎用 Three.js + React Three Fiber 等价拼出来。

## Stack

- Next.js 16.2.6 (Turbopack) + React 19
- Three.js 0.184 + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- GSAP · Lenis · Howler · Zustand · Leva
- TypeScript · Tailwind CSS v4

## Run

```bash
npm install
npm run dev -- -p 3100
# → http://localhost:3100
```

## 进度

| Phase | 状态 | 内容 |
|---|---|---|
| 1 | ✅ 完成 | 骨架 + 持久 Canvas + 5 条路由 + zustand store + 占位场景 |
| 2 | ⏳ 待办 | CameraRig 视差+抖动 / CursorTracker / PostFX (Bloom + LensStreak) / AssetLoader |
| 3 | ⏳ 待办 | HomeScene 完整（走廊 / 反射地板 / 屏幕 / 粒子） |
| 4 | ⏳ 待办 | WorkScene + WorkDetail 粒子碎化转场 |
| 5 | ⏳ 待办 | About + Contact + 完整 Nav + Audio |
| 6 | ⏳ 待办 | Loader / 性能优化 / 移动端 fallback |

详细方案见 `~/.claude/plans/https-activetheory-net-floating-turing.md`。每个 phase 的实现细节、shader 映射、AT UIL 参数对照都在那里。

## Phase 1 已落地

- `app/layout.tsx` · `app/{page,work/page,work/[slug]/page,about/page,contact/page}.tsx`
- `lib/{palette,sceneParams,store}.ts` — 31 个 AT 颜色 + 5 场景相机参数 + zustand
- `components/webgl/{WebGLProvider,SceneRouter}.tsx` — 持久 Canvas + 路径驱动场景切换
- `components/rig/{CameraRig,CursorTracker}.tsx` — moveXY/wobble/lerp + 全局光标
- `components/scenes/{Home,Work,WorkDetail,About,Contact}Scene.tsx` — 5 个占位 3D 形状
- `components/dom/{Nav,LenisProvider}.tsx` — 基础导航 + 平滑滚动

## AT 配色参考 (`lib/palette.ts`)

- 品红 `#d600ff` · 浅紫 `#c64dff` · 深紫 `#422ea3`
- 青 `#93e5ff` · 浅青 `#b4e0e3` · 镜头条纹 `#c2dcff`
- 电绿 `#0bed90` · 冷白 `#e5f1ff`

## 参考

- [Active Theory Hydra 引擎介绍 (Medium)](https://medium.com/active-theory/the-story-of-technology-built-at-active-theory-5d17ae0e3fb4)
- 公开的 UIL 场景配置：`https://activetheory.net/assets/data/uil.1778129964370.json` (2593 keys, 54 shaders, 31 colors)
