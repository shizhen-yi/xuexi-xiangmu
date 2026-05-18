# Progress Log

跨 session 流水。新 session 进来先读 plan file + 这份 + `git log --oneline -10`。

---

## Session 1 · 2026-05-18 · Bootstrap

**目标**：搭骨架，5 路由 + 持久 Canvas 跑起来。
**结果**：✅ 完成。dev server 跑通，Home 页面渲染 magenta torus knot 占位，DOM nav + Tailwind 黑底就位。

**做了**：
- `create-next-app xuexi-xiangmu` (folder 用拼音规避 npm 包名约束；显示名仍是 学习项目)
- 装满依赖：three / @react-three/fiber / drei / postprocessing / gsap / lenis / howler / zustand / leva / maath / r3f-perf
- 读 Next 16 docs 三篇：`turbopack.md`、`preserving-ui-state.md`、`instant-navigation.md`。关键发现：
  - Turbopack 是 Next 16 默认（不是 webpack）→ GLSL 用 TS 模板字符串避开 bundler 配置
  - `cacheComponents: true` 启用后路由通过 `<Activity>` 保留 DOM（不卸载），跨路由状态自动持久 — Phase 4 SceneRouter 可考虑用
  - `unstable_instant` 注解给路由做静态壳预渲染验证 — Phase 6 性能阶段加
- 写完所有 Phase 1 文件（详见 README）
- `next.config.ts` 加 `turbopack.root` 消除多 lockfile 警告
- 验证：preview_start 跑 dev，Canvas 渲染 ✓ WebGL2 上下文 ✓ pathname=/ ✓

**遇到的问题**：
- npm 包名不允许中文 → folder 改成 `xuexi-xiangmu`
- 父目录有 zackshi-site 的 git/lockfile/package.json → Turbopack 推断 workspace root 出错 → 在 `next.config.ts` 加 `turbopack: { root: __dirname }`
- 父目录 `.claude/launch.json` 加了 xuexi-xiangmu 条目以便 preview_start — 该改动留在父 repo 的工作区，用户可自行决定是否 keep
- session 末尾内存吃紧导致 dev server 被 OOM 杀掉 — 这是 Turbopack + R3F dev + MCP 服务器叠加的代价。下次 session 进来直接 `npm run dev` 即可

**未验证（留给下次 session 开头快速 sanity check）**：
- 5 路由依次点击 → 同一个 `<canvas>` 实例不重建（用 `dataset.markerId` 标记验证）
- 每个路由的 3D 场景颜色对应（Home magenta · Work cyan · WorkDetail magenta-light · About green · Contact teal）
- 光标移动看 CameraRig 视差有响应（Phase 1 stub 没接 moveXY 上限够大，目测可能不明显，Phase 2 调）

---

## 下次 Session 开局 checklist

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git log --oneline -10
cat progress.md
# 读 ~/.claude/plans/https-activetheory-net-floating-turing.md 找 Phase 2 切片
npm run dev -- -p 3100
# 跑 sanity check：点遍 5 条路由确认 Canvas 持久 + 场景切换
```

进度行（一次 session 加一行）：

- `2026-05-18` · Session 1 · Phase 1 完成 · 五路由 + 持久 Canvas
- `2026-05-18` · Session 2 · Phase 2 完成 · palette + sceneParams + projects + 资源脚本
- `2026-05-18` · Session 3 · Phase 3 代码完成（**未本地验证**） · 走廊几何 + 4 shader + PostFX

---

## Session 3 · 2026-05-18 · Phase 3 HomeScene 走廊 + PostFX

**目标**：把 `/` 路由从 Phase 1 的 magenta torus knot 占位重写成 AT 招牌走廊 hero，并接通 PostFX（Bloom / Vignette / ChromaticAberration；LensStreak 留 TODO）。

**结果**：⚠️ 代码完整、commit `8bfa094` 已 push，**但未在本机起 dev server 验证**。验证 + 调参委托给独立 session，spec 见 `docs/session-3-codex-tasks.md`。

**做了**：
- 资源：curl Mozilla UA + Pexels Referer 抓 2 个 1080p H.264 clip 到 `public/videos/hero.mp4` (5.8MB) / `work.mp4` (7.7MB)。Mixkit 的 `assets.mixkit.co` S3 全部 403、Pexels 部分 ID 也 403，最终用 ID 2887463 / 1851190。视频被 .gitignore 屏蔽不进 commit
- 4 shader 文件（components/scenes/home/shaders/*.ts，TS 模板字符串 + makeUniforms 工厂）：
  - `homeAlley.ts` — wall scanline + fresnel + UV scroll + 远端 magenta 渐亮 + 法线/粗糙度 map 耦合
  - `homeColumn.ts` — y 轴渐变 + 视向 rim + sin 脉冲
  - `homeLogo.ts` — VideoTexture RGB-shift + magenta tint + 亮度提升 + emissive 混合
  - `homeParticle.ts` — curl-noise-lite vert（3 相位 sin/cos）+ 3-stop frag + DPR 感知 PointSize
- 6 子组件（components/scenes/home/*.tsx）：HomeEnvironment / HomeFloor / HomeColumns / HomeAlleyWalls / HomeBackScreen / HomeParticles
- PostFX：`<EffectComposer frameBufferType=HalfFloat>` + Bloom（luminanceThreshold 0.6, mipmapBlur） + ChromaticAberration + Vignette，挂在 SceneRouter 后
- WebGLProvider：`gl` prop 加 `toneMapping=ACESFilmicToneMapping` + `outputColorSpace=SRGBColorSpace`
- HomeScene.tsx 改为薄壳 import 6 子组件 + ambientLight + 2 个 pointLight

**遇到的问题 / 决策**：
- Mixkit assets.mixkit.co 全 403（S3 AccessDenied），改用 Pexels CDN + 跑 6 个 URL 探测找到 200 的小文件
- 本机起 dev server 验证时 Turbopack 首次编译 + R3F + MCP preview 把电脑卡爆（用户中断），同 Phase 1 末尾 OOM 模式
- 决定不在当前 Opus session 完成本机验证 — 留 5h 配额给后续 session；写 Codex 任务包让独立 session 跑 npm run dev + 修编译错误 + 微调

**未验证（留给 Codex / 下次 session）**：
- npm run dev 是否能干净编译（shader uniform 类型、useTexture 对象签名、VideoTexture 跨域、ShaderMaterial 实例共享等都没验）
- preview_screenshot 与 activetheory.net 真站对比构图/配色/Bloom 强度
- console 无 `WebGLProgram: shader error` / `Material uniform 'X' not used`
- Canvas 在 `/` ↔ `/work` 路由切换时持久（dataset.canvasRoot 同实例）
- r3f-perf：FPS ≥ 55、drawcall < 80
- 移动端粒子降到 300 后整体仍渲染

**下次 session 进来怎么继续**：
读 `docs/session-3-codex-tasks.md`，按 Task 1 → Task 2 → Task 3 顺序跑。Task 1 是「最小可见验证」（编译 + 截图 + console clean），多半能跑通；Task 2 是「修 bug」（如果 Task 1 报错的话）；Task 3 是「视觉调参」（对照 AT 真站）。所有改动汇成 `[P3-fix]` 单 commit 或多 commit 都可以。

---
