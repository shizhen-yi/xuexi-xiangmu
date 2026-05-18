# Session 2 — Codex 委托任务包

Plan file 把 Session 2「数据资产层」整体交给 Codex 跑。本文是给 Codex 用的完整 prompt 集合，可以单独喂（推荐，让 Codex 并行 4 个任务）或合并成一个长 prompt（注意截断风险）。

每个任务都是**输入输出可完整描述、不依赖周围代码**的独立单元，符合 plan 里「适合委托」的判据。

---

## 共享前置说明（每个 prompt 开头都贴这一段）

```
你是高级前端工程师，正在协作一个 Next.js 16 + Three.js + React Three Fiber 的学习项目。

项目位置：/Users/Admin/claude code/xuexi-xiangmu/
项目目标：1:1 复刻 activetheory.net 的视觉与交互（学习用 demo）
已完成 Phase 1：脚手架 + 全局持久 Canvas + 5 条路由 + zustand store + 占位场景
当前是 Phase 2：把数据/配色/资产层全部补齐，为 Phase 3 的 HomeScene 大型几何建模做准备

技术约束：
- Next.js 16（Turbopack 默认）+ React 19 + TypeScript strict
- Three.js 0.184，import 用 `import * as THREE from 'three'`
- 不要引入新依赖，所有需要的都已经装了：three / @react-three/fiber / @react-three/drei / @react-three/postprocessing / gsap / lenis / howler / zustand / leva / maath
- 路径别名：`@/` → 项目根目录（tsconfig.json 已配）
- 不要修改不在任务里指定的文件
- 文件末尾保留 1 个空行，2-space 缩进

参考资料：Active Theory 公开的 UIL（UI Layer）配置 JSON 把他们的整个场景图、相机、shader、后处理参数全部裸奔了。下载：

  curl -sL "https://activetheory.net/assets/data/uil.1778129964370.json" -o /tmp/at-uil.json

这个 JSON 有 2593 个键，关键命名规律：
- `CAMERA_Element_<N>_<SceneName><Property>` — 每场景的相机参数（position/lookAt/fov/moveXY/wobbleStrength/lerpSpeed/...）
- `<ShaderName>/<ShaderName>/<MeshKey>/<UniformName>` — shader 的 uniform 值
- `INPUT_<EffectName>_<Property>` — 后处理参数（HydraBloom、HydraLensStreak 等）
- `MESH_<...>` — 网格变换
- `L_Element_<N>_<SceneName><Property>` — 灯光 color/intensity
- `SHADOW_<...>` — 阴影

主要场景名：home / Home / home_scene / homeScene · Work / work_page · WorkDetail · About · Contact / ContactUs · Footer
隐藏 demo 场景（本项目跳过）：CleanRoom · TreeScene · JellyfishDemo · ParticleTest
```

---

## Task 1 · 校对补全 `lib/palette.ts`

```
[贴共享前置说明]

任务：重新生成 /Users/Admin/claude code/xuexi-xiangmu/lib/palette.ts。

现有版本（请先读 lib/palette.ts）是 Claude 手动归类的 31 个唯一 hex 值，归类粒度太粗。
请用 Python 或 Node 扫一遍 /tmp/at-uil.json，按 hex 值的实际使用上下文（shader 名 + uniform 名 + 场景名）重新组织。

要求：
1. 保留并改进现有的 `palette` 常量（as const + readonly 字段）。新增字段命名按用途分组：
   - `home.*`（HomeAlleyShader, HomeFloorShader, HomeColumnShader, HomeScreenLight, HomeLogoShader 等的 uniform 颜色）
   - `work.*`（WorkGlassCubeShader, WorkSceneBackground, WorkItemShader, WorkProjectPlane 等）
   - `particles.*`（CoreParticlesShader 的 uColor/uColorB/uColorC 三停色，外加 HomeParticleShader, WorkPageParticleShader）
   - `glass.*`（GlassCubeShader, GlassShaderPBR, WorkGlassShader 的 fresnel/phong 色）
   - `post.*`（INPUT_HydraBloom_*, INPUT_HydraLensStreak_*）
   - `lights.*`（L_Element_<N>_<Scene>color 灯光颜色）
   - `pbr.*`（PBR, ATPBR, RoomPBR 的 uTint）
   - `bg.*`（背景/灰阶）
2. 每个字段后写注释说明出自 AT UIL 的哪个 key（取最有代表性的 1 个）
3. 保留并扩展 `hex(key)` helper：除了原有的扁平 key 路径，也支持 `'home.screen'` 这样的点号路径
4. 顶部新增 JSDoc 注释说明 source = activetheory.net/assets/data/uil.1778129964370.json，统计：N 个 unique colors，从 M 个 shader 引用收集
5. 文件末尾 export `paletteRaw: Record<string, string>` 把所有 hex 用原始 UIL key 当索引的扁平 map（debug 用）

不要：
- 不要导入 Three.js（lib/palette.ts 必须能在 server component 安全 import）
- 不要在这个文件加任何函数式逻辑（除了 hex helper）

输出：完整重写后的 lib/palette.ts 内容，覆盖原文件。
```

---

## Task 2 · 校对补全 `lib/sceneParams.ts`

```
[贴共享前置说明]

任务：扩展 /Users/Admin/claude code/xuexi-xiangmu/lib/sceneParams.ts。

现有版本只覆盖了 position/lookAt/fov/moveXY/wobbleStrength/lerpSpeed 六个字段，AT UIL 里还有更多：
- groupPos: Vec3 — 相机组的相对偏移
- viewportFocus: Vec2 — 视口聚焦点
- lerpSpeed2: number — 次级 lerp 速度（lookAt 用，position 用 lerpSpeed）
- deltaRotate: number — 鼠标控制的旋转 delta
- cameraRotation: Vec3 — 显式 euler
- rotation: Vec3 — 自身旋转
- far / near: number — 投影裁切
- fov 已有，但场景间有差异（20/28/30/35）需校对

要求：
1. 重新设计 SceneParams 类型，所有字段可选（除了 position/lookAt/fov/lerpSpeed）。这样 CameraRig 可以按字段是否存在决定是否应用。
2. 扫描 /tmp/at-uil.json 所有 CAMERA_Element_*_<Scene>* 字段。对每个场景输出全部捕捉到的字段，原值不变。
3. 5 个目标场景：home, work, workDetail, about, contact
   - home：合并 `CAMERA_Element_1_Home*`、`CAMERA_Element_3_home_scene*`、`CAMERA_Element_1_homeScene*` 三组键（AT 自己用了 3 个不同 scene 名指代主页，取交集 + 主要相机参数）
   - work：`CAMERA_Element_2_Work*`、`CAMERA_Element_2_work_page*`
   - workDetail：`CAMERA_Element_1_WorkDetail*`、`CAMERA_Element_1_WorkDetailParticles*`
   - about：`CAMERA_Element_1_About*`
   - contact：`CAMERA_Element_1_Contact*`、`CAMERA_Element_1_ContactUs*`
4. 保留并扩展 SceneId 类型和 pathToSceneId 函数
5. 新增 export：
   - `cameraRawByScene: Record<SceneId, Record<string, unknown>>` — 每场景捕获到的所有原始字段，调试用
   - `sceneFromUilKey(key: string): SceneId | null` — 反向查找 helper

不要：
- 不要破坏现有 import（CameraRig.tsx 在 import 这个文件，保持 sceneParams.home.position 等字段路径不变）
- 不要在这里实例化 THREE.Vector3 — 这是数据文件，应当能在 server 安全 import

输出：完整重写后的 lib/sceneParams.ts 内容，覆盖原文件。
```

---

## Task 3 · 生成 `data/projects.ts`

```
[贴共享前置说明]

任务：从零创建 /Users/Admin/claude code/xuexi-xiangmu/data/projects.ts。

需求：4-6 个占位案例（学习项目，不需要真实业务素材）。每个案例包含：
- slug: string (kebab-case, URL 安全)
- title: string (1-3 词的英文 + 中文副标题可选)
- year: number
- client: string (占位，可以是虚构机构或致敬 AT 真实案例的客户名)
- tags: string[]  (3-5 个，如 'WebGL', 'GenAI', 'Brand Film', 'Real-time')
- accent: { primary: string; secondary: string }  (hex，从 palette 挑 2 色)
- summary: string (1 句话 60 字内)
- description: string (2-3 段，每段 80-150 字，叙述项目挑战/解法/亮点。可以中文)
- heroVideo: { mp4: string; poster: string } (用 Pexels 免授权链接占位；下面提供 4-5 个候选 URL)
- gallery: { src: string; alt: string }[]  (3-4 张图，用 Pexels 占位)

候选 Pexels 视频 (1080p loops, 公开免费)：
- https://videos.pexels.com/video-files/3018669/3018669-uhd_2560_1440_30fps.mp4 (粒子)
- https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_24fps.mp4 (霓虹隧道)
- https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4 (烟雾)
- https://videos.pexels.com/video-files/1409899/1409899-hd_1280_720_30fps.mp4 (城市夜景)
- https://videos.pexels.com/video-files/3045170/3045170-uhd_2560_1440_24fps.mp4 (液体)
（如果失效，自行从 https://www.pexels.com/videos/ 搜 "abstract" / "neon" / "particles" 拿替代链接）

要求：
1. 案例风格：偏向 AT 真站的案例画风（科技 / 品牌叙事 / 实验性互动）
2. accent 颜色必须从 lib/palette.ts 引用，不要硬编码 hex（先 import { palette } from '@/lib/palette'）
3. 导出：
   - `projects: readonly Project[]`
   - `Project` type
   - `getProjectBySlug(slug: string): Project | undefined`
   - `getNextProject(slug: string): Project` (循环列表)
4. 描述用中文，title 用英文，符合 AT 真站的国际化质感

不要：
- 不要复制 AT 真实案例的客户名（Google / Disney / HBO 等）— 用致敬名（如 "Lumen Group" 致敬 "Lunar Voice"）
- 不要导入 Three.js

输出：完整的 data/projects.ts 内容。
```

---

## Task 4 · 资产下载脚本 `scripts/fetch-assets.ts`

```
[贴共享前置说明]

任务：从零创建 /Users/Admin/claude code/xuexi-xiangmu/scripts/fetch-assets.ts，并在 package.json 加 npm script `assets:fetch`。

需求：一个独立的 Node 脚本，运行 `npm run assets:fetch` 后把所有外部素材下载到 public/ 下。

要下载的：
1. **HDRI**（1 张 Polyhaven 1K 工作室照明）→ public/hdri/studio_small_09_1k.hdr
   - Polyhaven 公开 API：https://api.polyhaven.com/files/studio_small_09
   - 取 .hdr 1k 链接（response.hdr['1k'].hdr.url）
2. **法线 + 粗糙度纹理**（1 套 PBR）→ public/textures/{walls_normal,walls_roughness}.webp
   - 用 Polyhaven 的 wall_textures asset，取 nor_gl_1k + rough_1k 通道，转 webp（如果只能拿 jpg/png 直接保存原格式即可，命名相应 .jpg/.png）
3. **视频**（2 段 1080p Pexels loop，引用 Task 3 候选 URL 的前两条）→ public/videos/{hero,work}.mp4
4. **音频**（1 段 ambient loop）→ public/audio/ambient.ogg
   - 用 freesound.org 或 archive.org 公开的 CC0 ambient loop。或者临时占位：从 https://cdn.pixabay.com/ 上选一个 ambient 音轨（pixabay 也是免授权）
   - 失败兜底：脚本检测到下载失败时写一个 stub 1 秒静音 OGG（用 ffmpeg 生成；如果没 ffmpeg，写一个 0 字节占位 + 打印警告）

要求：
1. 用 Node 18+ 原生 fetch（不引入新依赖）
2. 用 fs/promises 的 mkdir + writeFile
3. 用 stream pipeline 把响应直接写盘，不要 buffer 大文件到内存
4. 失败时不要 panic：打印警告并继续下一个
5. 跑完输出一个 summary 表（每行：路径 / 状态 / 大小）
6. 如果文件已存在且大小 > 0 则跳过（幂等）
7. 在 package.json scripts 加：
   ```json
   "assets:fetch": "tsx scripts/fetch-assets.ts"
   ```
   如果 tsx 未装，先 `npm install -D tsx`（这一个 dev dep 例外允许加）

不要：
- 不要把素材 commit 进 git — 在 .gitignore 加 `/public/hdri/*`、`/public/videos/*`、`/public/audio/*`（保留 `public/hdri/.gitkeep`、`public/videos/.gitkeep`、`public/audio/.gitkeep` 以维持目录）
- 不要在脚本里硬编码 cookie / API key（Pexels / Polyhaven / Pixabay 公开端点都不需要 key）

输出：
- /Users/Admin/claude code/xuexi-xiangmu/scripts/fetch-assets.ts (完整内容)
- package.json 的 scripts 字段补丁（diff 形式）
- .gitignore 的追加行（diff 形式）
- 三个 .gitkeep 文件路径
```

---

## 整合后给 Codex 的运行流程

如果 Codex CLI 支持多文件并行：

```bash
codex run task-1-palette.md &
codex run task-2-scene-params.md &
codex run task-3-projects.md &
codex run task-4-assets.md &
wait
```

如果用 Web 版 Codex 或 ChatGPT：4 个 prompt 各开一个对话窗，独立跑，4 份产出粘回项目对应文件路径。

如果让 Claude 整合 Codex 产出：在 Session 2 开头让 Claude 读 4 份产出文件，做一次 type check (`npx tsc --noEmit`)，跑 `npm run assets:fetch` 验证脚本，跑 `npm run dev -- -p 3100` 看页面是否仍渲染。任一处 type 错让 Claude 修，不要回 Codex（来回成本高）。

## Session 2 完成的验收标准

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run assets:fetch` 跑完，public/ 下有 hdri/videos/audio 文件（或脚本明确报哪个失败，且失败不影响 dev 启动）
- [ ] `npm run dev` 起来后访问 /、/work 不报错（视频/HDRI 此时还没被任何场景引用，只是文件就位）
- [ ] `lib/palette.ts` export 的 keys 多于 Phase 1 的 31 个扁平 key
- [ ] `lib/sceneParams.ts` 的 `sceneParams.home` 至少多了 groupPos 或 viewportFocus 字段
- [ ] `data/projects.ts` export 4-6 个 Project，types 严格
- [ ] commit 一条：`[P2-data] palette/sceneParams expansion + projects + asset fetch script`
