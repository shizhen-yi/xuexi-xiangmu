# Session 6 — Phase 5：About + Contact + 完整 Nav + Audio + 移动端 fallback + 发布

Phase 4 已经 commit + push 完毕（`a14dcef`）。Work 网格 / hover 碎裂 / scroll dolly / 30k 粒子转场 / WorkDetail 详情页 / hero video 全在代码里。**视觉运行时验证留 Session 6 开局**（preview_screenshot / 工具在 Session 5 末段抽风没拍到清晰图）。

本 session 进入 Phase 5 —— `/about`、`/contact` 路由的场景 + 完整左上汉堡 + 右侧滑出全屏菜单 + 首次手势后淡入 ambient.ogg + 移动端 fallback poster + GitHub README 中英双语。

预计 2.5-3h。每个 task 一条独立 commit。Codex 可派部分见末节。

> **背景文档**：
> - `~/.claude/plans/https-activetheory-net-floating-turing.md` — 项目总纲（Phase 5 节 + About/Contact/Nav/Audio 详细方案）
> - `docs/session-5-spec.md` — 上 session spec（结构参考）
> - `progress.md` — Session 5 节有未验证清单（开局先过一遍）

---

## 开局 sanity check（10 min，第一件事）

Session 5 末段 preview 工具抽风，Task 2-5 视觉没拍清。先用 10min 把它们过一遍，发现 bug 一条 `[P4-fix-N]` commit 修。**不修就别进 Phase 5**。

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git log --oneline -10              # 最新应该是 a14dcef
cat progress.md | tail -100        # Session 5 节末「运行时未验证」清单
vm_stat | grep "Pages free"        # 开 preview 前看基线
# 让用户关多余应用
preview_start name=xuexi-xiangmu   # webpack 模式
preview_resize width=1440 height=900
```

按这个清单 check（每条出问题就修，再过下一条）：

1. **`/work` 5 个 cube 渲染**：preview_screenshot 看到 5 个 magenta 边线玻璃方块，与 Session 4 baseline.jpg 对比构图 ✓ Session 5 已验证
2. **hover voronoi**：preview_eval 模拟鼠标 moveTo cube 屏幕位置 → dispatchEvent('pointermove') → screenshot 看是否 cube 起碎裂 + RGB-split
   - 如完全无反应：可能 (a) onPointerOver 没触发（canvas-layer pointer-events 没翻 auto，检查 WorkScene useCanvasPointerEvents hook 是否在 mount）或 (b) ShaderMaterial 没切换（检查 hovered state 是否真的 true）
3. **scroll dolly**：preview_eval `window.scrollTo(0, 1500)` → screenshot → 看 cube 阵是否朝相机移近
   - 如 cube 完全没动：检查 `useStore.getState().scrollProgress` 是否非 0；Lenis 是否在订阅 scroll
4. **粒子转场**：preview_eval 模拟 click 中间 cube → 等 1.5s → 看 pathname 是否切到 `/work/<slug>` + 看 transition 期间有没有粒子
   - 如点了没反应：检查 onClick 是否触发（先 console.log 验）；GSAP timeline 是否 init；transitionProgress 是否在 store 里走 0→1
   - 如粒子不可见：检查 fromWorldPos 是否对（用 console.log 打印 cube worldPos）；30k 粒子是否过多导致 drawcall 爆掉
5. **详情页 hero video + MDX**：进 `/work/signal-garden` 看 hero plane 视频是否播放 + DOM 文案是否渲染中文 MDX
   - 如视频黑屏：检查 `/videos/work.mp4` 是否在 public/videos/ 本地
   - 如 MDX 不渲染：检查 frontmatter 正则 + body parse 逻辑

完成 10min sanity 后开 Phase 5。如 OOM 风险高（free < 300MB）就先 preview_stop + commit 当前 fix + 重启 preview 再继续。

---

## Task 1 — AboutScene（35 min）

`/about` 路由的场景：SDF logo plane + 漂浮线框 lab + DOM 团队介绍叠层。

**目录结构**（mirror `home/` + `work/`）：
```
components/scenes/about/
├── AboutLogo.tsx              # SDF logo plane（chromatic fresnel）
├── AboutLabLogo.tsx           # 漂浮线框 lab（wireframe geometry）
├── AboutEnvironment.tsx       # ambient + 弱 fog + 不要 HDRI（场景偏暗）
└── shaders/
    ├── aboutLogo.ts           # SDF logo + chromatic split GLSL
    └── aboutLabLogo.ts        # wireframe pulse GLSL
```

`AboutLogo`：plane [3, 1.5]，自定义 ShaderMaterial。frag 用一个简单的 SDF（box 或 circle 组合）画出"学习项目"或 "AT-LAB" 文字 —— 不要走 dynamic text shaping，直接 hardcode SDF function。chromatic 边缘按 fresnel 偏移 RGB 通道。

`AboutLabLogo`：`<wireframeGeometry>` 包一个 IcosahedronGeometry 或 TorusKnotGeometry，shader 给 line 加 emissive + sin 脉冲。

**相机**：sceneParams.about 已校准（position [0,0,6] / fov 30 / wobbleStrength 0.06），不动。

**DOM 叠层**（app/about/page.tsx）：
- 顶部 "学习项目 LAB" 大字
- 中段 200 字虚构 agency 介绍（中文，AT 风格）
- 底部团队 3-4 个虚构成员（名字 + role + 头像 placeholder）

**Codex 可派**：aboutLogo.ts + aboutLabLogo.ts 的 GLSL（输入 uniforms + SDF 函数完整 spec），写完 git push。

**验证**：进 `/about` 看 logo + lab + DOM 叠层；FPS ≥ 55；preview_screenshot 留底。

Commit：`[P5-about] AboutScene logo + lab + team DOM`

---

## Task 2 — ContactScene（25 min）

`/contact` 路由：极简单粒子场 + DOM 表单。

**目录**：
```
components/scenes/contact/
├── ContactParticles.tsx       # 500-1k 稀疏粒子，慢漂
└── ContactEnvironment.tsx     # 几乎无光，黑底
```

ContactParticles：复用 `home/shaders/homeParticle` 模板（已 export），detectCount 桌面 500 / 移动 200。position 分布密集在屏幕中下方，y 范围 0-3。

**DOM 表单**（app/contact/page.tsx）：
- 一个简单的表单（name / email / message）不接后端，submit 走 `alert('Demo only')`
- "学习项目" submit 按钮 hover 时触发玻璃碎裂动画（复用 WorkGlassCubeShader 的 voronoi）—— 但这是 DOM 按钮不是 WebGL；做 CSS clip-path animation 模拟即可，不进 Canvas

**验证**：进 `/contact` 看粒子 + 表单；提交按钮 hover 有微动效。

Commit：`[P5-contact] ContactScene particles + form`

---

## Task 3 — 完整 Nav：汉堡 + 右侧滑出菜单（30 min）

当前 `components/dom/Nav.tsx` 是简版（横排 HOME/WORK/ABOUT/CONTACT）。Phase 5 升级为：
- 左上**汉堡按钮**（3 横线，hover magenta）
- 点击 → 右侧滑出**全屏菜单**（GSAP timeline，0.6s ease-out）
  - 大字号 HOME / WORK / ABOUT / CONTACT 链接（垂直堆叠）
  - 背景毛玻璃（`backdrop-filter: blur(20px) + background: rgba(0,0,0,0.7)`）
  - 关闭按钮（X 在右上）
- 当前路由的链接显示 magenta `#d600ff`
- 路由切换后菜单自动关（useEffect 依赖 pathname）

**GSAP timeline**（菜单内部状态）：
```ts
const tl = useRef<gsap.core.Timeline>();
useLayoutEffect(() => {
  tl.current = gsap.timeline({ paused: true })
    .to(menuRef.current, { x: 0, duration: 0.6, ease: 'power3.out' })
    .from('.menu-item', { x: 30, opacity: 0, stagger: 0.06 }, '-=0.3');
}, []);
const toggle = (open: boolean) => open ? tl.current?.play() : tl.current?.reverse();
```

**hover 时也加 magenta underline 动画** 用 CSS 即可，不必 GSAP。

**Codex 可派**：无（DOM + GSAP 集成）

**验证**：5 路由都点一遍 → 菜单都能打开关闭；路由切换 Canvas 持久（`document.querySelector('canvas').dataset.markerId` 不变）。

Commit：`[P5-nav] hamburger + slide-out menu`

---

## Task 4 — Audio toggle + ambient loop（20 min）

AT 站首次用户点击后开始播 ambient.ogg。我们用 **Howler.js**（已在 deps）。

`components/dom/AudioToggle.tsx`：
- 固定在右上角（汉堡左侧），icon 是音量喇叭 / 静音两态
- 首次点击 = unlock AudioContext + play ambient loop（0 → 0.3 fade in over 1.5s）
- 后续点击 = mute/unmute
- 状态写 zustand `audioOn`（store 已有这字段）

**ambient.ogg 资产**：还没下载。`scripts/fetch-assets.mjs` 早写过抓 Pexels 视频；这次手动找一个 Freesound / Soundstripe CC0 ambient loop（1-2MB OGG），扔到 `public/audio/ambient.ogg`。或者：暂时用一个静音的 0.5s ogg 占位、Phase 6 真发布再换。

**Howler 单例**：在 AudioToggle 内 useEffect 创建 Howl 实例 + ref 保存。组件 unmount 时 stop。

**Codex 可派**：无（外部 API + 状态机）

**验证**：点 toggle 听到声音；切路由声音继续；refresh 后默认静音（store 不持久化）。

Commit：`[P5-audio] Howler ambient toggle + autoplay unlock`

---

## Task 5 — 移动端 fallback（25 min）

mobile（< 768px）首屏 WebGL 渲染会卡 / 耗电严重 / 部分 iOS Safari 不支持 WebGL2 高级特性。AT 站直接 `unsupported.html` 静态 poster 兜底。

**实现**：
1. 在 `app/layout.tsx` 检测 viewport：用 `usePathname` + window.matchMedia('(max-width: 767px)') 判断
2. mobile：
   - `<WebGLProvider>` 不挂（或挂但隐藏 canvas）
   - 显示一个 fixed full-screen `<div>` 含 poster jpg（背景 + "请在桌面访问 / View on desktop" 文字）
   - 仍允许 DOM nav 工作（导航到 /work 等仍渲染 DOM 内容，只是没 WebGL）
3. desktop：正常 WebGL

**poster**：一张 1080×1920 jpg（mobile 竖屏）放 public/。可用 Session 4 的 home baseline screenshot 改一下加文字。

**`prefers-reduced-motion`**：respect 用户偏好（store.reducedMotion 已有字段，CameraRig 也已 respect）。粒子组件目前没 respect —— 这次顺手加一个：reducedMotion=true 时 particles 数量 / 2 或直接不渲染。

**Codex 可派**：无（浏览器 API + 条件 mount）

**验证**：preview_resize 375x812 → 看到 mobile poster；preview_resize 1440x900 → 看到 WebGL；reduced-motion media query toggle 时粒子稀疏。

Commit：`[P5-mobile] mobile poster fallback + reduced-motion guard`

---

## Task 6 — GitHub README 中英双语 + 截图（30 min）

最后一步，把项目对外。README 结构：

```markdown
# 学习项目 / xuexi-xiangmu

A 1:1 study of [activetheory.net](https://activetheory.net) — rebuilt with
Next.js 16 + React Three Fiber instead of AT's closed-source Hydra engine.

复刻 activetheory.net 的纯学习项目。用 Next.js 16 + React Three Fiber 拼出 AT
闭源 Hydra 引擎的视觉与交互管线。

[预览 / Preview](https://...)  · [Source maps](docs/screenshots/)

## Features / 功能

- 5 routes / 5 条路由：Home / Work / WorkDetail / About / Contact
- Persistent Canvas across route changes / Canvas 持久跨路由
- Custom shaders / 自定义 shader（按文件列表）：
  - HomeAlley / HomeColumn / HomeLogo / HomeParticle
  - WorkGlassCube (voronoi hover) / WorkBackground
  - WorkDetailParticles (dissolve transition)
  - AboutLogo / AboutLabLogo
- PostFX：Bloom + LensStreak + ChromaticAberration + Vignette
- ...

## Stack

Next.js 16.2 · React 19 · Three.js 0.184 · R3F + drei + postprocessing ·
GSAP · Lenis · zustand · Howler · maath · leva · r3f-perf

## Local dev

\`\`\`bash
npm install
npm run dev -- -p 3100
\`\`\`

Webpack mode (lower memory than Turbopack — recommended on 8-16GB Mac):
\`\`\`bash
npm run dev -- --webpack -p 3100
\`\`\`

## Project structure / 目录结构

[树状目录列表，重点 components/scenes / shaders / lib]

## Phase log

- Phase 1 (Session 1): 5 routes + persistent Canvas
- Phase 2 (Session 2): palette / sceneParams / projects / asset fetch script
- Phase 3 (Sessions 3-4): HomeScene corridor + 4 shaders + PostFX + LensStreak
- Phase 4 (Session 5): WorkScene grid + voronoi hover + scroll dolly + 30k particle dissolve + WorkDetail
- Phase 5 (Session 6): About + Contact + Nav + Audio + mobile fallback + this README

## Reference / 参考

- [activetheory.net](https://activetheory.net) — source of truth for visual targets
- [AT UIL JSON](https://activetheory.net/assets/data/uil.1778129964370.json) — 49 colors + scene params extracted to `lib/palette.ts` and `lib/sceneParams.ts`

## License

MIT (学习项目 / study purposes only)
```

加 4 张截图：home / work / work-detail / about（放 docs/screenshots/，README 用相对路径 reference）。

**Codex 可派**：README 英文部分 + 项目结构树（输入：现有目录 → 输出：markdown 树状图）

**验证**：GitHub repo 主页 README 渲染正确；图床链接通；中英文都对齐。

Commit：`[P5-readme] bilingual README + 4 hero screenshots`

---

## Verification（每 task 后）

- `npx tsc --noEmit` exit 0
- `npm run build` clean
- preview_screenshot 留底 `docs/screenshots/p5-task-N.jpg`
- 5 路由切换 Canvas 持久（dataset.markerId 检查）
- FPS ≥ 50（mobile 可降到 30）
- mobile poster 在 375 viewport 显示
- audio toggle 工作

---

## Codex 边界

**可派 Codex**：
1. `shaders/about/aboutLogo.{vert,frag}` GLSL（Task 1，SDF + chromatic）
2. `shaders/about/aboutLabLogo.{vert,frag}` GLSL（Task 1，wireframe pulse）
3. README 英文段落 + 项目目录树（Task 6）

**不可派 Codex**：
1. Nav 汉堡 + GSAP timeline 集成
2. AudioToggle Howler 单例
3. mobile fallback 条件 mount 逻辑
4. SDF 字体设计（视觉调）

---

## OOM 防范

Session 5 教训：内存压力始终在 60MB-1.5GB 跳，preview 是杀手。本 session：

1. 开 dev 前关多余应用，目标 free > 500MB
2. 每个 task → preview_stop → commit → fetch → preview_start 下一个
3. 不开多个 preview 实例
4. `vm_stat | grep "Pages free"` 每 5min check
5. webpack 模式默认（`.claude/launch.json` 已配）

---

## 关 Phase 5（也是关项目）

6 个 task 跑完后：
1. 更新 `progress.md` 加 Session 6 节
2. 终态 commit：`[P5-close] Phase 5 done, project ready to ship`
3. `git push`
4. 写一篇 1500 字的项目复盘到 `docs/postmortem.md`（learning project，所以复盘很关键）：
   - 用了哪些 shader / 哪些 fx
   - 与 AT 真站差距清单
   - 5 个 Claude session + 3 个 Codex worktree 协作模式回顾
   - 单机 8-16GB 跑 R3F dev 的 OOM 防范学到的
5. （可选）写一篇博客 / Twitter 总结发出去

项目至此完工。下一步可选：

- **Phase 6 性能调优**（mobile fps、bundle 分析）
- **Phase 7 真实文案**（替换中文虚构案例为真实业务 / 朋友项目）
- **Phase 8 移动端 WebGL 适配**（如果不想 fallback）
- **Phase 9 拓展 demo**（重新加入砍掉的 JellyfishDemo / TreeScene / CleanRoom 作为 `/lab` 隐藏路由）
