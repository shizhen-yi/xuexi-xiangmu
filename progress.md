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
- `2026-05-18` · Session 3 · Phase 3 代码完成 · 走廊几何 + 4 shader + PostFX（tsc + build 验证通过，视觉调参留 Session 4）
- `2026-05-18` · Session 4 · Phase 3 关闭 · LensStreak Effect 上线 + Phase 4 spec + baseline report（视觉调参留 Session 5，OOM 限制）

---

## Session 3 · 2026-05-18 · Phase 3 HomeScene 走廊 + PostFX

**目标**：把 `/` 路由从 Phase 1 的 magenta torus knot 占位重写成 AT 招牌走廊 hero，并接通 PostFX（Bloom / Vignette / ChromaticAberration；LensStreak 留 TODO）。

**结果**：✅ 代码完整（commit `8bfa094`） + 编译验证通过（`npx tsc --noEmit` exit 0；`npm run build` 3.2s clean + 7 个静态页全生成）。视觉调参 / LensStreak / 路由切换 sanity 留给 Session 4，spec 见 `docs/session-4-tuning-tasks.md`。

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
- 起 dev server 验证时 Turbopack 首次编译 + R3F + MCP preview 把电脑卡爆（用户中断）
- **判断失误纠正**：第一反应是把"验证 + 修 bug + 调参"全打包给 Codex，被用户拨正——`tsc --noEmit` 和 `next build` 只要 5-10s 自己干、不烧 5h 配额；视觉调参确实要持续观察反馈但应该是另一个 Claude session 不是 Codex（Codex 不善反复 iterate）。Codex 适合的是「输入输出可完整 spec、不依赖周围代码」的机械活
- 实际验证路径：`npx tsc --noEmit` exit 0 + `npm run build` 3.2s clean → 集成胶水都装对了（drei MeshReflectorMaterial、useTexture 对象签名、VideoTexture SSR guard、ShaderMaterial 实例共享、@react-three/postprocessing 栈）

**编译已验证（Session 3 内做掉）**：
- ✅ TypeScript strict 类型检查 clean
- ✅ Turbopack production build 7 个静态页全生成
- ✅ React Server Components 边界（'use client' 标注）正确

**运行时未验证（留 Session 4）**：
- ✅ 运行时 GLSL 编译（Session 4 webpack 模式起 dev 渲染走廊几何 + magenta 屏光 + 视频，无报错）
- ⏸️ preview_screenshot 对比 activetheory.net 真站（拿到 baseline-ours，AT 真站没抓——留 Session 5）
- ⏸️ 路由切换 Canvas 持久（Session 4 OOM 限制，没做多路由切换 sanity）
- ✅ VideoTexture autoplay 真实表现（hero.mp4 渲染显示文字内容）
- ⏸️ r3f-perf：FPS ≥ 55、drawcall < 80（OOM 限制，没开 r3f-perf）
- ⏸️ 移动端粒子降到 300 后整体仍渲染（多视口 sanity 全留 Session 5）
- ⏸️ 视觉调参（Bloom 烈度等 3-5 轮）（OOM 限制 + 时间预算，只跑了 baseline 看现状、调参留 Session 5）
- ✅ LensStreak Effect 实现（Session 4 完成，commit `5e8d231`）

**下次 session 进来怎么继续**：
读 `docs/session-5-spec.md` 进 Phase 4（WorkScene + WorkDetail）。视觉调参另开一份 `docs/session-4-baseline-report.md` 已有「推荐第一轮」表格，Session 5 想插一段 Home tuning 也可以按那份起步。

---

## Session 4 · 2026-05-18 · Phase 3 关闭：LensStreak + Phase 4 spec + baseline report

**目标**：原计划做完 baseline 双图 → 3-5 轮 Home 视觉调参 → LensStreak Effect → 多视口 sanity → 收口。

**结果**：⚠️ **部分完成**。LensStreak Effect 实现 + 集成 + 编译 + 上线（commit `5e8d231`）、写完 Phase 4 spec、拿到一张 baseline 截图、写完 baseline-report。**视觉调参循环完全没跑**——OOM 风险 + 5h 配额 + 1h 时间预算让多轮 iterate 不现实。代码层 Phase 3 关闭，运行时调参挪到 Session 5。

**做了**：
- `components/fx/LensStreakEffect.ts` 新建：postprocessing 6.x `Effect` 子类 + `wrapEffect` 包装成 React 组件
  - 13-tap 横向各向异性高斯模糊 + 软亮度阈值门控 + 径向 halo
  - 默认 streak=#c2dcff、halo=#cceeff、intensity=0.6、threshold=0.7、stretch=0.02
  - 用 postprocessing 自动注入的 `inputBuffer` sampler2D（不显式声明 uTexture，与 6.x 约定一致）
- `components/fx/PostFX.tsx` 集成：`<LensStreak />` 放在 Bloom 之后、ChromaticAberration 之前
- 父目录 `.claude/launch.json` 的 xuexi-xiangmu 条目加 `--webpack` flag（Turbopack 在本机 OOM）
- 拿到 Home `/` 路由的一张 baseline 截图（preview_screenshot via webpack dev）
- 写 `docs/session-4-baseline-report.md`：现状描述 + 6 条差异清单 + 4 条「推荐第一轮调参」给 Session 5
- 写 `docs/session-5-spec.md`（280 行）：Phase 4 任务包，覆盖 WorkScene 玻璃方块网格 + voronoi hover 碎裂 + scroll dolly + WorkDetail 30k 粒子转场 + ScrollControls 详情滚动

**遇到的问题 / 决策**：
- **Turbopack OOM 重演**：preview_start 默认走 Turbopack，首次 R3F 编译把电脑卡死（Pages active 飙到 7GB）。**决策**：父目录 launch.json 加 `--webpack` flag，webpack 模式下首次编译 6.8s、Pages active 稳定在 2.6GB，HMR 工作（但本 session 没真正 HMR 一轮——一改 Bloom 内存就降到 free 22MB，立即 stop）。结论：webpack 模式**勉强能用但内存空间小**，OOM 仍在风险半径内。Session 5 进来仍要先关多余应用
- **背景 Codex Agent 派不出去**：用户允许我把 LensStreak GLSL + Phase 4 spec 派给独立 branch 的 background agent。但 `Agent` 工具启动后台 agent 即返回 "You've hit your limit · resets 8:40pm"——Anthropic API 5h 配额限制，无法启动后台 agent。**决策**：自己两份都写，单文件 TS 模板字符串实现 LensStreak（跟项目 home shader 风格一致），不分拆 .glsl 文件
- **postprocessing 6.x Effect base 集成路径**：原 spec（docs/session-4-tuning-tasks.md:101-148）建议手动 `<primitive object={effect}/>`，但 `@react-three/postprocessing` 3.0 提供 `wrapEffect` helper（参考 `Bloom.d.ts` / `Vignette.d.ts` 的实现路径），用 wrapEffect 更干净、类型推导更好。**用 wrapEffect 路径**
- **视觉调参没真正跑**：试改 Bloom intensity 1.2→1.8 + threshold 0.6→0.45 后立刻发现内存 free 22MB（危险水平），stop dev + **回退改动**——理由：没视觉验证的 commit 不专业，让 baseline-report 的「推荐第一轮」做为 Session 5 的纯文本工单
- **Session 4 spec 大改的部分**：原 `docs/session-4-tuning-tasks.md` 是 Session 3 末写给 Session 4 的，已完成的部分（LensStreak）算作落地，未完成的（3-5 轮调参 + 多视口 sanity + 路由切换 sanity）被推给 Session 5

**编译已验证**：
- ✅ `npx tsc --noEmit` clean（含 LensStreak 类型 + wrapEffect 泛型推导）
- ✅ `npm run build` 3.8s clean，7 个静态页全生成
- ✅ webpack dev 模式 R3F 渲染 / WebGL2 / Canvas 持久（dataset attribute 检查通过）

**运行时未验证（留 Session 5）**：
- 视觉调参循环（baseline-report 列了 4 条「推荐第一轮」起步）
- LensStreak 横向冷蓝条纹**是否真在画面上出现**（屏光亮度可能 < `threshold=0.7`，需要先调高 Bloom 或降 streak threshold）
- 多视口 sanity（1440 / 1920 / 768 / 375）
- 路由切换 Canvas 持久 sanity（5 路由依次点击）
- r3f-perf：FPS / drawcall

**下次 session 进来怎么继续**：
读 `docs/session-5-spec.md`，按 Task 1-5 走 Phase 4。OOM 教训已写入 spec 末「OOM 防范」节，**先关多余应用再 preview_start**。如想在 Phase 4 中间穿插一段 Home tuning，按 `docs/session-4-baseline-report.md` 的「推荐第一轮」表格做 1-2 轮（建议合并到 `[P5-...]` commit 流里，不开独立 phase）。

---

进度行（追加）：

- `2026-05-19` · Session 5 · Phase 4 完成 · WorkScene 网格 + voronoi hover + scroll dolly + 30k 粒子转场 + WorkDetail 详情页 + 4 MDX 文案（Codex 并行 3 worktree）

---

## Session 5 · 2026-05-19 · Phase 4：Work + WorkDetail + 粒子转场

**目标**：Phase 4 五个 task —— WorkScene 玻璃方块网格 + hover 碎裂 + scroll dolly + WorkDetail 30k 粒子碎化转场 + 详情页布局 + hero video。预算 90min 硬上限。

**结果**：✅ **代码层 5 个 task 全部完成 + commit + push**（`a14dcef` HEAD），tsc clean + build clean。**视觉验证仅 Task 1 通过截图**（5 cube magenta 边线深度排开 + 玻璃透射 + PostFX chromatic split 可见），Task 2-5 的运行时视觉因 preview 工具的 viewport/screenshot 怪行为没拍到清晰图，**视觉验证留 Session 6 开局**。

**做了**：
- **Codex 并行 3 worktree**（用户起的）：voronoi GLSL + dissolve GLSL + 4 个 MDX 文案。三条 branch 都干净 push，main 三次 merge --no-edit 零冲突。Codex 写完 ~30min，与 Claude T1 时间重叠，几乎零等待
- **Task 0 Foundation**（[P4-store] `a13cf93`）：store.ts 加 `scrollProgress: number` + `transition: { from, toSlug, fromWorldPos } | null` + setters；LenisProvider 加 `lenis.on('scroll', ({ progress }) => setScrollProgress(progress))` —— 之前 Phase 1 的 Lenis 完全封闭、不发布到 store
- **Task 1 WorkScene 基础**（[P4-work-grid] `20a3243`）：5 个 GlassCube（按 data/projects 5 个 slug）、MeshPhysicalMaterial（transmission 1, ior 1.4, attenuationColor #b4e0e3, clearcoat 1）、EdgesGeometry 磁紫边线、子组件 WorkEnvironment（HDRI + fog 15/45 + 2 个点光） / WorkBackground（4-sin noise 渐变 plane）/ WorkParticles（300d/120m 复用 homeParticle shader）。WorkScene.tsx 改成薄壳
- **Task 3 scroll dolly**（[P4-work-dolly] `7fe8ae4`）：WorkGlassCubes 外层 group ref，useFrame 写 `group.position.z = scrollProgress * 24`。app/work/page.tsx 改 min-h-[300vh] + 真实 projects 数据替换 4 占位卡 + pointer-events 隔层（section 外层 none + 内容 auto）
- **Task 2 hover voronoi**（[P4-work-hover] `583f8c5`）：包 Codex GLSL 进 `shaders/workGlassCube.ts` TS 模板 + makeUniforms 工厂；每 cube 用 `useState(hovered)` + `onPointerOver/Out`，hover=true 时切到 ShaderMaterial，uHoverAmount 用 `maath/easing damp(factor 0.15)` 0→1 平滑。drei `useEnvironment` 喂 equirect HDR 给 uEnvMap。**修一个 Phase 1 遗留 bug**：`.canvas-layer` 全局 `pointer-events: none` 阻断 cube 命中——WorkScene 加 `useCanvasPointerEvents` hook，mount 时改为 auto，unmount 还原
- **Task 4 粒子转场**（[P4-work-transition] `32e7ec6`）：SceneRouter 加 `<>{sceneNode}{transition && <WorkDetailParticles />}</>` overlay（跨路由切换不卸载）；WorkDetailParticles 30k 桌面 / 10k 移动，自写 BoxGeometry surface 采样（6 面 × 5k 点）替代 MeshSurfaceSampler 外部依赖，aFromPos 加 transition.fromWorldPos 偏移，aToPos 是 [0, 1, -2] ±2.0 plane 采点。WorkGlassCubes 加 onClick 派 GSAP timeline（0.6s in → router.push → 0.6s out）写 transitionProgress 到 store
- **Task 5 详情页**（[P4-work-detail] `a14dcef`）：WorkDetailScene 用本地 `/videos/work.mp4`（per-project remote pexels URL 受 CORS 阻 VideoTexture）做 hero plane at [0, 1, -2]（与 WorkDetailParticles HERO_PLANE_CENTER 对齐）+ 3 个 sub-cube；app/work/[slug]/page.tsx 服务端 fs/promises 读 mdx + 简易正则 frontmatter 解析 + 微型 markdown 渲染（## / - / paragraph）避免 `@next/mdx` 依赖。底部"Next case"链 getNextProject

**遇到的问题 / 决策**：
- **palette 字段名 spec 写错**：spec 引用 `palette.bgPurple` / `palette.glassTeal` 都不存在，实际是 `palette.bg.homeRoom` (#161616) / `palette.glass.cubeFresnel` (#b4e0e3)。Phase 4 spec 是 Session 4 末写的、当时没核对最新 palette 结构。本 session plan 文档里已记录这点
- **Lenis subscribe 假设错位**：spec 假设 "Lenis 已在 layout.tsx Phase 1 接通，只需新加订阅"。实际 Phase 1 LenisProvider 完全封闭、用 useEffect 内部 raf tick 但**不发布到任何外部**。本 session 在 Task 0 内补了
- **SceneRouter transition 槽假设错位**：spec 说 SceneRouter "已在 Phase 1 骨架预留转场逻辑位置"。实际只有 switch case 没任何 transition 痕迹（只有一行 `// Phase 4 will replace this` 注释）。本 session 加了 overlay 分支
- **`.canvas-layer` 全局 pointer-events: none**：Phase 1 globals.css 默认让 Canvas 透传所有事件给 DOM。Phase 4 cube 要 hover/click 必须能命中。WorkScene 加 hook 临时翻 auto
- **preview viewport / screenshot 怪行为**：Task 2 verify 时 preview_resize 后 R3F 没跟着 resize，screenshot 显示一小块场景压在左上角剩余画布全黑。试过 reload / dispatch 'resize' 事件都没修复。耗了 ~10min 没诊出根因。**决策**：T2/T4/T5 跳过视觉 verify、靠 tsc + build + 代码 review 兜底，留 Session 6 开局补
- **Codex 委托大成功**：3 个独立 worktree、~30min 出活、merge 0 冲突。Codex GLSL 严格按 spec 公式实现，dissolve.frag 只有 15 行、voronoi.vert 含完整 IQ 风格 hash3 + 27 邻居循环。MDX 中文文案高质量、无 AI 味、AT 风格。**单 session 主线 90min + 并行 30min = 总产出比纯 Claude 单线程多约 30%**
- **Per-project hero video CORS**：data/projects.ts 的 heroVideo.mp4 是 pexels 远程 URL，VideoTexture 跨域受限。**决策**：detail 页统一用本地 /videos/work.mp4 做通用 hero。Phase 5 / 6 如要走真实 per-project hero 需要本地下载 5 个 mp4

**OOM 走势**：
- 开局：Pages free 213MB（警戒，比 Session 4 开局 1GB 紧）
- T1 完成后 preview_screenshot：60MB（危险）→ 立即 preview_stop → 回 1.5GB
- T2 build 后：422MB（警戒）→ 短 preview verify 没视觉收益 → stop → 回 1.35GB
- T4 / T5 build 时：1.1GB → 1.18GB → 始终在安全区
- **本 session 没有真的 OOM 崩溃**，但内存压力始终高，preview 多开就是危险半径

**编译已验证**：
- ✅ `npx tsc --noEmit` clean（5 个 task 每个 commit 前都跑过）
- ✅ `npm run build` clean，7 个静态页 + /work/[slug] 动态路由
- ✅ webpack dev 启动 + /work 路由的 Canvas + WebGL2 + 1425×900 drawing buffer（Task 1 verify 通过）

**运行时未验证（留 Session 6 开局 10min sanity）**：
- Task 2 hover voronoi 视觉（理论上 cube hover 起碎裂 + RGB-split）
- Task 3 dolly 滚动（理论上 cube 阵 scroll * 24 朝相机）
- Task 4 转场（点 cube → 30k 粒子从 cube 面发射 → 路由切换 → 收束到 hero plane → 淡出）
- Task 5 hero 视频播放 + DOM 文案 + MDX 内容渲染
- 多视口 sanity（1440 / 768）
- r3f-perf FPS（≥ 55 目标） / drawcall（< 80 目标）

**下次 session 进来怎么继续**：
读 `docs/session-6-spec.md` —— Phase 5 主题（About + Contact + 完整 Nav + Audio + 移动端 fallback + GitHub README）。**Session 6 开局第一件事**：跑 10min 视觉 sanity 把 Session 5 推迟的 Task 2-5 视觉过一遍（保存 docs/screenshots/p4-task-{2,3,4a,4b,5}.jpg），有 bug 一条 `[P4-fix-N]` commit 修。然后进 Phase 5。

---
