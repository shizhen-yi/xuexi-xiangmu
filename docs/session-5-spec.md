# Session 5 — Phase 4：WorkScene 玻璃方块网格 + WorkDetail 粒子碎化转场

Phase 3 已经 commit + push 完毕（HomeScene 走廊 hero、PostFX 全栈含 LensStreak、相关 shader 全在）。本 session 进入 Phase 4 —— `/work` 路由的玻璃方块案例栏 + `/work/[slug]` 详情页 + 两者之间的招牌粒子碎化转场。

预计 2.5-3h。每个 task 一条独立 commit。

> **背景文档**：
> - `~/.claude/plans/https-activetheory-net-floating-turing.md` — 项目总纲（Phase 4 节 + Work/WorkDetail 详细方案 + 关键文件清单）
> - `progress.md` — 跨 session 流水
> - `docs/session-4-tuning-tasks.md` — 上 session 模板（结构参考）

---

## 开局 checklist

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git log --oneline -10           # 最新应该是 [P3-close] + [P3-lens] + [P3-tune]*N
cat progress.md                  # 读 Session 4 末尾
# 跳读这份 + plan file 的 Phase 4 节 + Work/WorkDetail 详细方案
preview_start name=xuexi-xiangmu # launch.json 已用 --webpack（Session 4 改的）
```

如电脑紧张：先 `pkill -f "next-server\|next dev"` 清残留，再起。OOM 风险见末节。

---

## Task 1 — WorkScene 基础几何（45 min）

把 `components/scenes/WorkScene.tsx` 从 Phase 1 占位重写成 4-6 个玻璃方块网格。

**目录结构**（mirror `home/`）：
```
components/scenes/work/
├── WorkGlassCubes.tsx        # 4-6 个 cube 网格
├── WorkBackground.tsx        # 全屏背板（渐变 + slow noise）
├── WorkEnvironment.tsx       # fog + ambient + HDRI 复用 home 的 studio_1k
├── WorkParticles.tsx         # ~3k 飘浮粒子（复用 home 粒子 shader 减量）
└── shaders/
    ├── workBackground.ts     # 渐变 + simplex noise（TS 模板字符串）
    └── workGlassCube.ts      # voronoi 碎裂 hover shader（Task 2）
```
顶层 `components/scenes/WorkScene.tsx` 改成薄壳，import 子组件 + light。

**GlassCube 网格**：
- 4-6 个，按 `data/projects.ts` 的 projects 数组生成
- 布局参考：z 间距 -4 ~ -20（朝向相机深度），x 左右交错 ±3，y 微抖（-0.3, 0, +0.3）
- 每个 cube 关联 `data/projects[i].slug`，便于 Task 4 转场拿数据

**MeshPhysicalMaterial 参数**（按 plan 总纲）：
```ts
transmission: 1
thickness: 0.5
roughness: 0.1
ior: 1.4
clearcoat: 1
attenuationColor: palette.glassTeal  // #b4e0e3，已在 lib/palette.ts
attenuationDistance: 1.5
envMapIntensity: 1.2
```
BoxGeometry `[1, 1, 1]` 起步，后续 hover 状态再调。

**Edge 描线**：
- `EdgesGeometry(boxGeom, 15)` + `LineSegments` + `LineBasicMaterial({ color: palette.magenta })`
- magenta = `#d600ff`，已在 lib/palette.ts

**WorkBackground**：
- 全屏 plane（用 `<ScreenQuad>` from drei 或 `position={[0,0,-10]} scale={[40, 25, 1]}`）
- shader：垂直渐变 (`palette.bgPurple` -> `palette.bg`) + 慢速 simplex noise (uv 0.5)
- 复用 `lib/palette.ts`，不要新建颜色

**WorkParticles**：
- 复制 `components/scenes/home/HomeParticles.tsx` 改 detectCount = mobile 150 / desktop 300
- shader 直接 import 现成的 `homeParticle.ts` —— 不要为环境粒子再写一个

**相机参数**：`lib/sceneParams.ts` 的 `work` 段已校准（position [0,0,2], lookAt [0,0,-4], fov 35），**不动**。SceneRouter 已经按 pathname 路由场景，本 task 不碰路由。

**验证**：浏览器进 `/work` 看到 4-6 个磁紫色边线玻璃方块漂浮、背板有渐变 + 噪点、~3k 粒子点缀。FPS ≥ 55，drawcall < 80。

Commit：`[P4-work-grid] WorkScene glass cube grid + bg + particles`

---

## Task 2 — Hover 态切 voronoi 碎裂 shader（40 min）

GlassCube 默认是 `MeshPhysicalMaterial`，hover 时切换到自定义 `ShaderMaterial`，沿法线 voronoi 位移顶点 + RGB-split 折射。

**实现**：
1. `WorkGlassCubes.tsx` 里每个 cube 用 `useState<boolean>(false)` 跟 hover 状态
2. `onPointerOver={() => setHovered(true)}` / `onPointerOut={() => setHovered(false)}`
3. material 三元：`{hovered ? <workGlassCubeMaterial/> : <meshPhysicalMaterial.../>}`
4. shader 文件：`components/scenes/work/shaders/workGlassCube.ts`（TS 模板字符串，跟 home shaders 一致）

**shader 内容**（vert + frag）：

vertex：
```glsl
uniform float uTime;
uniform float uHoverAmount; // 0-1, lerped externally
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

// voronoi 2D noise: returns distance to nearest cell point
float voronoi(vec3 p) { ... } // copy from shaders/chunks/curl.glsl style

void main() {
  vec3 pos = position;
  float v = voronoi(position * 4.0 + uTime * 0.5);
  pos += normal * v * 0.25 * uHoverAmount;
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
```

fragment（RGB-split fresnel）：
```glsl
uniform samplerCube uEnvMap;
uniform vec3 uTint;
uniform float uHoverAmount;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 reflectDir = reflect(-vViewDir, vNormal);
  float split = 0.04 * uHoverAmount;
  vec3 r = textureCube(uEnvMap, reflectDir + vec3(split, 0, 0)).rgb;
  vec3 g = textureCube(uEnvMap, reflectDir).rgb;
  vec3 b = textureCube(uEnvMap, reflectDir - vec3(split, 0, 0)).rgb;
  vec3 chroma = vec3(r.r, g.g, b.b);

  float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
  vec3 col = mix(chroma, uTint, 0.2) + uTint * fres * 0.4;

  gl_FragColor = vec4(col, 1.0);
}
```

`uHoverAmount` 用 maath `damp` 在 useFrame 里 0 ↔ 1 lerp（damp factor 0.15）。

**Codex 可派**：上面这两段 GLSL 文件本身（输入输出 spec 已完整），写完跑 `npm run build` 编译验证。**不可派**：R3F state + uHoverAmount lerp 集成。

**验证**：hover 任意方块 → 边线变锐、表面起 voronoi 碎块 + RGB chroma split；离开 → 平滑回归。

Commit：`[P4-work-hover] glass cube voronoi shatter on hover`

---

## Task 3 — 相机 dolly + 滚动 timeline（30 min）

`/work` 不分页，靠相机 dolly 在方块之间穿梭，绑滚动位置。

**做法**：
- 不用 GSAP ScrollTrigger（依赖多、装不必要），用 Lenis 滚动 progress + 直接修改 `sceneParams.work.position.z`
- 在 `components/scenes/WorkScene.tsx` 里 `useFrame` 拿到 `scroll = useStore(s => s.scrollProgress)` (0-1)
- `cameraTargetZ = lerp(2, -22, scroll)` —— 从 z=2 dolly 到 z=-22 穿过最后一个 cube
- 但 **不直接改 sceneParams**（不变性）—— 通过 `useStore.setState({ cameraOverrideZ: ... })` 或者在 WorkScene 内 mount 一个 `<group position={[0, 0, -scroll * 24]}>` 把 cubes 反向移动

**推荐方案**：把 cubes 包在一个 `<group>` 里，用 `useFrame` 改 `group.position.z = scroll * 24`。这样相机不动，cubes 朝相机移动 —— 视觉等价 dolly，但避免和 CameraRig 的 lerp 打架。

**scrollProgress 数据源**：`useStore` 里加 `scrollProgress: number` (0-1)，Lenis `on('scroll')` 写入。Lenis 已在 `app/layout.tsx` Phase 1 接通，这里只需在 WorkScene 挂载时新加订阅。

**验证**：在 `/work` 滚动鼠标 → cubes 朝你逼近 → 滚到底所有 cube 已在相机后方。

Commit：`[P4-work-dolly] scroll-driven cube group dolly`

---

## Task 4 — WorkDetail 粒子碎化转场（60 min，本 session 最难）

**触发**：用户点击 `/work` 的某个 cube → 派发 `useStore.setState({ transition: { from: 'work', toSlug: clickedSlug, progress: 0 } })`。

**SceneRouter 状态机**（已在 `components/webgl/SceneRouter.tsx` Phase 1 骨架，此处补足转场逻辑）：
1. progress 0 → 0.5：粒子从被点 cube 表面 30k 采样、按 GSAP 时间线向外扩散（1.2s）
2. progress 0.5：`router.push('/work/' + toSlug)` —— Next 16 用 `useRouter` from `next/navigation`（cacheComponents=true 路由保持 Canvas 不卸载，详见 `node_modules/next/dist/docs/`）
3. progress 0.5 → 1.0：粒子向 detail hero plane 收束、淡化为 texture
4. progress = 1：清空 transition 状态，正常渲染 detail scene

**粒子实现**（`components/scenes/workDetail/WorkDetailParticles.tsx`）：
- 30000 粒子，BufferAttribute(position, normal, life, seed)
- 初始 position 从 BoxGeometry surface 随机采点（用 `MeshSurfaceSampler` from `three/examples/jsm/math/MeshSurfaceSampler.js`）
- shader：`shaders/workDetail/dissolve.{ts}` —— vert 用 life lerp `mix(startPos, endPos, life)` + curl noise 扰动；frag 软圆 alpha
- end position：detail hero plane 中心附近的 plane sample 点
- AdditiveBlending、depthWrite=false（跟 home particles 一致）

**GSAP timeline**：
```ts
const tl = gsap.timeline({
  onUpdate: () => useStore.setState({ transitionProgress: tl.progress() }),
  onComplete: () => useStore.setState({ transition: null, transitionProgress: 0 }),
});
tl.to({ p: 0 }, { p: 0.5, duration: 0.6, ease: 'power2.in' });
tl.call(() => router.push('/work/' + slug));
tl.to({ p: 0.5 }, { p: 1.0, duration: 0.6, ease: 'power2.out' });
```

**Codex 可派**：dissolve.{vert,frag} GLSL spec 已完整（输入 attributes/uniforms + 输出公式），写完用 `npm run build` 验证编译。**不可派**：SceneRouter 状态机 + GSAP timeline + router.push 时序。

**验证**：在 `/work` 点击任意 cube → 看到 cube 表面分裂为 30k 粒子 → 1.2s 内进入 `/work/[slug]` → 粒子重组为 hero plane → 详情页正常显示。

Commit：`[P4-work-transition] particle dissolve route transition`

---

## Task 5 — WorkDetail 详情滚动（30 min）

`/work/[slug]` 的详情页布局：hero plane + DOM 叠层文案 + 2-3 个 sub-cube 装饰。

**ScrollControls**：drei 的 `<ScrollControls pages={3} damping={0.25}>` 包住 detail scene 内容，scroll 状态用 `useScroll()` 读。

**布局**（DOM 叠层在 app/work/[slug]/page.tsx）：
- 顶部 hero plane 显示项目缩略图（`data/projects[slug].heroVideo.poster` 或 mp4）
- 中段 DOM 滚动叙事（title / client / year / tags / description from `data/projects`）
- 底部 2-3 个 sub-cube（小号 GlassCube 装饰，hover 静态）

**hero video**：复用 `home/HomeBackScreen` 的 VideoTexture 模式，加载 `projects[slug].heroVideo.mp4`。这两个 mp4 已经在 Phase 3 下载到 `public/videos/` 但被 .gitignore 屏蔽 —— Session 5 需要确认本地存在，否则重跑 `scripts/fetch-assets.mjs`。

**验证**：进 `/work/signal-garden` → hero 显示视频 → 滚动 → DOM 文案有 ScrollControls 平滑过渡 → 底部 sub-cube 出现。

Commit：`[P4-work-detail] WorkDetail scroll layout + hero video`

---

## Verification（每个 task 后都要过）

- `npx tsc --noEmit` 必须 exit 0
- `npm run build` clean，所有 route 静态/动态映射正确
- 每个 task 后 `preview_screenshot` 留底 `docs/screenshots/p4-task-N.jpg`
- 点击 Home nav → `/work` → 玻璃方块网格能渲染（drawcall < 80）
- hover 任意方块 → 见 voronoi 碎裂 + RGB-split
- 点击方块触发粒子转场，1.2s 内进入 `/work/[slug]`
- 详情页能滚动，hero plane 显示项目缩略图
- FPS ≥ 55（r3f-perf via `?debug=1`）

---

## Codex 边界

**可派 Codex（输入输出可完整 spec、不依赖周围代码）**：
1. `shaders/work/glassCube.{vert,frag}` 内容（Task 2，voronoi 碎裂 GLSL）
2. `shaders/workDetail/dissolve.{vert,frag}` 内容（Task 4，dissolve GLSL）
3. `shaders/work/workBackground.ts` 内容（Task 1，渐变 + simplex noise）
4. EdgesGeometry helper（如要抽成 util）
5. `data/projects.ts` 文案润色（如有需求）

**不可派 Codex（依赖 R3F state / 路由时序 / 视觉判断）**：
1. SceneRouter 状态机修改
2. GSAP timeline 集成
3. Lenis scroll 订阅 + group dolly 集成
4. ScrollControls 数据流
5. 视觉调参（同 Session 4，Codex 无视觉反馈通道）

调 Codex 时**精确给清单**，参考 `docs/session-2-codex-tasks.md` 的 prompt 模板。

---

## OOM 防范

Session 4 的教训（已写入 progress.md）：Turbopack + R3F dev + MCP preview 在 8GB-16GB Mac 上会 OOM。本 session 继承的防范：

1. 父目录 `.claude/launch.json` 的 xuexi-xiangmu 条目已加 `--webpack` flag（Session 4 改的）—— webpack 内存压力比 Turbopack 小
2. 开 dev 前关 Chrome 多余 tab + Slack/Logseq/Telegram
3. 每个 task 完成 → 立刻 commit + push（OOM 重启不丢工作）
4. 视觉调参类活如果再触发 OOM，**留下次 session**（不要硬扛，Session 4 已经这么做了）
5. r3f-perf 监控（`?debug=1`）替代频繁 screenshot

---

## 兜底

- **dev 起不来**：先 `pkill -f "next-server\|next dev"`，再 preview_start；30s 内还不起就走纯代码路径（Task 1-2 可纯靠 npm run build 验证编译）
- **Codex 任务失败 / 不可用**：直接抄 spec 自己写（本 spec 的 GLSL 公式已完整）
- **粒子转场卡顿**：先降到 15k 粒子，跑通再回 30k；用 `?debug=1` 看 drawcall 是不是爆了
- **hover shader 类型报错**：检查 EnvMap 类型 `THREE.CubeTexture` vs `THREE.Texture`（用 HDR equirect 时是后者，用 PMREMGenerator 后是 envMap）
- **SceneRouter 转场卡死在 progress=0.5**：用 `useStore.subscribe` debug，常见是 GSAP timeline 在 unmount 后还在跑 → 加 cleanup

---

## 关 Phase 4

5 个 task 跑完后：

1. 更新 `progress.md` Session 4 节末（如有未验证条目）划掉、新增 Session 5 节
2. 终态 commit：`[P4-close] Phase 4 done, ready for Phase 5`
3. `git push`
4. 写 `docs/session-6-spec.md`（Phase 5 — About + Contact + Nav + Audio + 移动端 fallback + GitHub README）
   - 参考本 spec 结构，控制 200-300 行

下次 session 起 Phase 5：完整 5 路由 + 导航 + 音频 + 移动端 + 发布。
