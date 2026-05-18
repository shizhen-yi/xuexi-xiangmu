# Session 3 — Codex 委托任务包（Phase 3 验证 + 调参）

Phase 3 的代码 Claude Opus 已经在 commit `8bfa094` 全部写完 push 了。但本机起 dev server 验证时被 OOM（Turbopack + R3F dev + MCP preview 三件套吃内存）。这份 spec 把后续「跑、验、修、调」交给独立 session（推荐 Codex 或新开 Claude Sonnet session，避开 Opus 5h 配额）。

3 个 task 串行跑，每个完成 commit 一次 push：
- **Task 1**：最小可见验证（编译干净 / Canvas 渲染 / console clean）
- **Task 2**：bug 修复（只在 Task 1 暴露问题时执行）
- **Task 3**：视觉调参（对照 activetheory.net 真站微调 3-5 个数）

---

## 共享前置说明（每个 task prompt 开头都贴这一段）

```
你是高级前端工程师，协作 Next.js 16 + Three.js + React Three Fiber 的学习项目。

项目位置：/Users/Admin/claude code/xuexi-xiangmu/
GitHub：https://github.com/shizhen-yi/xuexi-xiangmu
基底 commit：8bfa094（Phase 3 HomeScene 走廊 + PostFX 代码完成但未本地验证）

进度脉络：
- Phase 1（commit befd162）：脚手架 + 5 路由 + 持久 Canvas + zustand store
- Phase 2（commit a33bf74）：lib/palette.ts（31 色分组）+ lib/sceneParams.ts（5 场景相机参数）+ data/projects.ts（5 案例）+ scripts/fetch-assets.ts（HDRI + wall normal/rough 已下载，视频 hero/work.mp4 已用 Pexels CDN 单独 curl 补齐）
- Phase 3（commit 8bfa094）：本 task 要验证的对象

技术约束：
- Next.js 16（Turbopack 默认，不是 webpack）+ React 19 + TypeScript strict
- 写代码前必读 node_modules/next/dist/docs/ 里相关章节，Next 16 与训练数据可能有破坏性差异
- Three.js 0.184，import 用 `import * as THREE from 'three'` 或具名
- 不要引入新依赖，需要的都装了：three / @react-three/fiber / @react-three/drei / @react-three/postprocessing / gsap / lenis / howler / zustand / leva / maath / r3f-perf
- 路径别名：`@/` → 项目根
- shader 用 TS 模板字符串（不引 GLSL bundler），范式见 components/scenes/home/shaders/*.ts
- 文件末尾保留 1 个空行，2-space 缩进

Phase 3 改动的文件清单（13 个）：
新增：
  components/fx/PostFX.tsx
  components/scenes/home/HomeAlleyWalls.tsx
  components/scenes/home/HomeBackScreen.tsx
  components/scenes/home/HomeColumns.tsx
  components/scenes/home/HomeEnvironment.tsx
  components/scenes/home/HomeFloor.tsx
  components/scenes/home/HomeParticles.tsx
  components/scenes/home/shaders/homeAlley.ts
  components/scenes/home/shaders/homeColumn.ts
  components/scenes/home/shaders/homeLogo.ts
  components/scenes/home/shaders/homeParticle.ts
修改：
  components/scenes/HomeScene.tsx     # 改成 import 6 子组件的薄壳
  components/webgl/WebGLProvider.tsx  # gl prop 加 toneMapping/outputColorSpace + 挂 <PostFX/>

Phase 3 规划与设计：~/.claude/plans/xuexi-xiangmu-activetheory-net-splendid-wind.md
进度日记：progress.md（Session 3 节，有未验证清单）
```

---

## Task 1 · 最小可见验证（必跑）

```
[贴共享前置说明]

任务：把 commit 8bfa094 的代码在本机跑起来，确认 Phase 3 的最小可见性 — 编译干净、Canvas 渲染、console clean、5 路由切换 Canvas 持久。**只验证，不动代码**。如有问题进 Task 2。

步骤：

1. 起 dev server（推荐用 Claude Preview MCP 的 preview_start，避免 raw shell 卡住）：
   .claude/launch.json 已配 `xuexi-xiangmu` 配置（port 3100），直接：
   `preview_start name=xuexi-xiangmu`
   或者 raw：`cd /Users/Admin/claude\ code/xuexi-xiangmu && npm run dev -- -p 3100 > /tmp/p3-dev.log 2>&1 &`

2. 等待 Turbopack 首次编译（Phase 3 有 11 个新文件 + 2 个 modified，首编可能要 30-60s）。`preview_logs` 看到「Compiled / successfully」或 raw 时 `tail -f /tmp/p3-dev.log | grep -E "Compiled|Error"`。

3. 拿截图：`preview_screenshot serverId=<id>`。期望看到：
   - 黑底 + 远端中央 magenta 屏光（Bloom 让它有光晕外溢）
   - 走廊两侧灰雾墙带磁紫 fresnel 边
   - 地板有反射（屏光在地上拉出竖直光束）
   - 6 根柱子分布在两侧（顶部紫亮、底部暗）
   - 漂浮粒子（淡紫 / 蓝紫 / 青绿三色混合）
   - 四角 Vignette 收暗

4. 拉 console：`preview_console_logs level=error` 应该是空的；`level=warn` 容许 r3f-perf 之类的提示，但**不应**看到：
   - `THREE.WebGLProgram: shader error`
   - `WebGL: INVALID_OPERATION: uniformXXX: ...`
   - `Material uniform 'uX' is not used by shader`
   - VideoTexture autoplay 拒绝（Chrome 通常 OK，Safari 可能要点一下页面）
   - 任何 React `Cannot read properties of null`

5. 跨路由切换持久性：`preview_eval` 拿 `document.querySelector('[data-canvas-root] canvas')` 的引用，跳 /work 再跳回 /，验证 canvas DOM 节点是同一个实例（plan file Phase 1 验证步骤）。

6. r3f-perf：URL 加 `?debug=1` 打开（CameraRig 之前应该已经接了 leva 之类的 dev 工具，不确定可跳过）。看 FPS / drawcall / triangle。期望桌面 ≥55fps、drawcall < 80。

输出：

- 写一份「Task 1 验证报告」到 docs/session-3-task-1-report.md（新文件），包含：
  - 编译是否成功（贴 Turbopack 输出最后 5 行）
  - 截图描述（哪些视觉元素出现了 / 哪些缺失）
  - console error/warn 全文
  - canvas 持久性检查结果
  - FPS / drawcall 数字（若有）
  - 结论：「✅ Task 1 通过，跳过 Task 2 直接进 Task 3」 OR 「❌ Task 1 暴露问题清单，进 Task 2 修以下：...」

- 把这份报告 commit + push：`[P3-verify] task-1 report`，**不动 Phase 3 代码**。

只验证不改代码。任何问题列进报告，由 Task 2 处理。
```

---

## Task 2 · Bug 修复（条件性 — Task 1 暴露问题时跑）

```
[贴共享前置说明]

任务：根据 docs/session-3-task-1-report.md 里列出的问题清单，最小化修补 Phase 3 代码让 Task 1 期望的视觉/console clean 状态达成。

修补优先级（按可能性高到低）：

1. **Shader 编译错误**：
   - `WebGLProgram: shader error` 通常在 console 第一行有「ERROR: 0:N: ...」的详细位置。改对应 .ts 文件的 GLSL 字符串。
   - 注意 vertex/fragment 之间 varying 名字/类型必须完全一致
   - precision qualifier：fragment shader 顶部应有 `precision highp float;`（已加）
   - Uniform 类型与 JS 端 makeUniforms 的 value 类型必须匹配（vec3 ↔ THREE.Color、vec2 ↔ THREE.Vector2、sampler2D ↔ Texture）

2. **useTexture 对象签名**：
   - HomeAlleyWalls.tsx 用了 `useTexture({ normalMap: '...', roughMap: '...' })` 对象签名（drei 9.x+ 支持）。如果版本不对，drei 可能只支持数组形式 `useTexture(['/path1', '/path2'])`。报错通常是 `Cannot read properties of undefined`。
   - 修法：改成数组形式：`const [normalMap, roughMap] = useTexture(['/textures/wall_normal_1k.jpg', '/textures/wall_roughness_1k.jpg'])`

3. **VideoTexture 跨域 / autoplay**：
   - hero.mp4 在 public/videos/（同源），不应有跨域问题
   - Chrome 桌面默认允许 muted+playsInline autoplay
   - 如果视频屏永远黑：检查 video.readyState 在 useEffect 里日志，或者 `useStore` 是否在 VideoTexture 创建后还卡在 loadProgress<1（HomeBackScreen 的 video 元素不应被 LoadingManager 跟踪）

4. **ShaderMaterial 实例共享**：
   - HomeColumns / HomeAlleyWalls 用 `<primitive object={material} attach="material" />` 让 6 柱 / 2 墙共享同一个 ShaderMaterial 实例。
   - 如果报「material is null」或共享失效，回退到每 mesh 单独 useMemo 一个 material（drawcall 不变但 GPU state 切换增多）。
   - 或者用 InstancedMesh 替代显式 6 柱（drawcall 1 但调试难）

5. **MeshReflectorMaterial perf 崩**：
   - 如果 FPS 掉到 30 以下，把 resolution 从 512 降到 256，blur 从 [300,100] 降到 [200,50]
   - 实在不行，临时退到 `<meshStandardMaterial color={hex('home.floorBase')} metalness={0.6} roughness={0.4}/>`，Phase 6 再补真反射

6. **HMR ShaderMaterial 不重编译**：
   - 编辑 shader .ts 文件后 Turbopack 热重载不触发新 shader 编译。修法：useMemo 依赖里加 `[vertexShader, fragmentShader]`（已加），重启 dev server 应该够。

修完做：
- `git add -A && git commit -m "[P3-fix] resolve task-1 issues: <逐条列>" -m "Co-Authored-By: ..."`
- 重跑 Task 1 的步骤 3-5 拿到 clean 截图 + 空 console，更新 docs/session-3-task-1-report.md 末尾加「✅ 修后状态」
- push

**不要**改动 plan file 里没要求的东西（CameraRig、SceneRouter、Phase 1 store 字段都不要动）。如果修补需要扩展 sceneParams 或 palette，明确写在 commit message 里。
```

---

## Task 3 · 视觉调参（必跑，前提是 Task 1/2 都过）

```
[贴共享前置说明]

任务：把 Phase 3 的 HomeScene 视觉对照 activetheory.net 真站微调到「神似」（不要求像素完全一样，毕竟 AT 是闭源 Hydra 引擎）。

参考流程：

1. 截两张图并排比对：
   - 真站：用 chrome MCP `mcp__Claude_in_Chrome__navigate` 打开 https://activetheory.net/，等动画稳定后 `screenshot`
   - 我们的：preview_start + preview_screenshot
   - 把两张图都存到 /tmp/，文件名加日期戳

2. 调参对照表（按视觉权重排序）：

   | 现象 | 改什么 | 改在哪 |
   |---|---|---|
   | Bloom 过强 / 过弱 | `luminanceThreshold` 0.5-0.8、`intensity` 0.8-1.5 | components/fx/PostFX.tsx |
   | 屏光面太亮 / 没光晕 | 屏光面 opacity 0.3-0.6 或 emissiveIntensity（如果改成 emissive material） | components/scenes/home/HomeBackScreen.tsx |
   | 走廊太短 / 太长 | wall planeGeometry args[0]（长度）、wall position.z | components/scenes/home/HomeAlleyWalls.tsx |
   | 柱子太密 / 太稀 | COLUMN_POSITIONS 数组改 z 值或加柱 | components/scenes/home/HomeColumns.tsx |
   | 地板反射模糊度 | MeshReflectorMaterial 的 blur / mixStrength / resolution | components/scenes/home/HomeFloor.tsx |
   | 粒子太多 / 太少 / 飘速 | detectCount 返回值 / homeParticle.ts 里 sin 振幅和频率 | components/scenes/home/HomeParticles.tsx + shaders/homeParticle.ts |
   | 走廊雾色偏冷 / 偏暖 | fog args 第一参（color） + alleyMist 颜色 | components/scenes/home/HomeEnvironment.tsx + lib/palette.ts |
   | 视频屏太显视频内容 | homeLogo.ts 的 `mix(rgb, rgb*uTint, 0.35)` 比例提到 0.5-0.7 | components/scenes/home/shaders/homeLogo.ts |
   | ChromaticAberration 过强 | offset 从 [0.0008, 0.0012] 降到 [0.0004, 0.0006] | components/fx/PostFX.tsx |
   | Vignette 过暗 / 过浅 | darkness 0.4-0.7、offset 0.3-0.5 | components/fx/PostFX.tsx |

3. 每改一组参数：
   - HMR 后 `preview_screenshot` 看效果
   - 满意了用 `preview_eval` 触发 `window.location.reload()` 确认 cold start 也 OK
   - 不满意继续调

4. 限定调参轮数 3-5 轮（避免无止境）。每轮记一行进 `docs/session-3-task-3-tuning-log.md`：「轮 N：改了 X 从 a 到 b，原因 ...」

5. 完成后：
   - 拍最终的 /tmp/at-real.png + /tmp/ours-final.png 一并提交（或贴到 commit message 里只描述）
   - commit `[P3-tune] visual fine-tuning against activetheory.net`（如果有改动）+ push
   - 或者 `[P3-verify] visuals already aligned, no tuning needed`（empty commit）

约束：
- **不要新增 shader / 新增几何**（那些是 Phase 4-6 的活）
- **不要动 lib/sceneParams.ts、lib/palette.ts**（那是 Phase 2 的 source of truth，要改的话提一个独立 PR 说明理由）
- 改动总行数应该 < 60 行（视觉调参本质是改常量）
```

---

## 验证完后的产出

跑完三个 task 后，main 分支应该有这些新 commit（顺序）：

```
[P3-verify] task-1 report           # Task 1 验证报告
[P3-fix] resolve task-1 issues: ... # Task 2 修补（仅 Task 1 报问题时）
[P3-tune] visual fine-tuning ...    # Task 3 调参
```

加上现有的：

```
[P3-home] HomeScene corridor geometry + 4 shaders + PostFX stack    # 8bfa094 已 push
```

Phase 3 才算关闭。Phase 4（WorkScene 网格 + 玻璃方块）才能开始。

---

## 退路 / 兜底

如果 Task 1 报严重问题（编译都过不去、Canvas 完全黑屏）并且 Task 2 修补尝试 ≥2 轮还不成：

- **Plan A**：回滚 PostFX 单独提交一次（先验证场景几何，再叠后处理）：
  ```
  git revert --no-commit 8bfa094
  git checkout 8bfa094 -- components/scenes/HomeScene.tsx components/scenes/home/ components/webgl/WebGLProvider.tsx
  # 手动把 WebGLProvider.tsx 的 <PostFX/> 注释掉
  git commit -m "[P3-revert-postfx] split corridor + postfx for incremental verify"
  ```
- **Plan B**：保留 P3 代码、在 progress.md 写明阻塞、把状态留给下一个 Opus session 处理（Codex 善后能力比 Opus 弱，不强求）

不要 force-push 或 reset --hard。
