# Session 9 — Codex 并行任务

两份独立 prompt，都不依赖视觉验证，可以与本 session 的 Task 1（home 4-stage sanity）并行。

起 worktree：

```bash
cd "/Users/Admin/claude code"
git -C xuexi-xiangmu worktree add ../xuexi-xiangmu-codex-readme   -b codex/readme-update-v2
git -C xuexi-xiangmu worktree add ../xuexi-xiangmu-codex-postmortem -b codex/postmortem
```

两个终端分别 `cd` 进去 → `codex` → 粘对应 prompt。

---

## Task A — README.md 状态更新

**worktree**: `xuexi-xiangmu-codex-readme`
**branch**: `codex/readme-update-v2`
**预计**: 15-20 min

### prompt

```
你在 xuexi-xiangmu 项目的一个 codex worktree 里。目标：把 README.md 的进度表 + Shader 清单 + Phase log 更新到真实状态（当前 main HEAD 是 9f80f05）。其它部分不改。

## Ground truth 来源（必读）

1. `git log --oneline -40` — 看 Phase 5 / Phase 6 实际 commit
2. `progress.md` 末尾 Session 6/7/8 两节 — 详细做了什么
3. `ls components/scenes/home/` + `ls components/scenes/home/shaders/` — 新增的 HomeStage / shader 文件
4. `ls components/dom/` — 新增的 LoadingMandala / AudioToggle / MobileFallback / Nav
5. `ls components/scenes/about/ contact/ work/` — Phase 4-5 已落地的组件
6. `lib/store.ts` — 看新加的 state 字段

不要凭空写，所有声明都要能在代码里找到。

## 要改的部分

### 1. Progress 表（README.md 中 ## Progress / 进度 节）

把 Phase 5 / Phase 6 状态从 "Planned / 计划中" 改成真实状态：

- Phase 5: `Done / 已完成` — 内容：AboutScene (SDF logo + wireframe lab + team) / ContactScene (粒子 + 双语表单) / 汉堡菜单 (GSAP slide-out) / AudioToggle (Howler ambient) / MobileFallback (poster) / 双语 README
- Phase 6: `In progress / 进行中` — 内容：HomeScene 重建为 4-stage 滚动叙事 (ring → shower → workshop → spiral) / LoadingMandala / 多视口 sanity 进行中 / v0.1 tag 待发布

### 2. Implemented Shaders 表

现有表只到 Phase 4。补全 Phase 5 / Phase 6 的 shader：
- `homeRing` — iridescent torus ring（Stage 1）
- `homeTrails`（如有独立 shader 文件）
- `homeGoldParticles`（如有）
- `aboutLogo` — SDF + chromatic fresnel
- `aboutLabLogo` — wireframe pulse
- HomeStage 4 个组件如有独立 shader 也列出

逐个 grep `components/scenes/**/shaders/*.ts` 确认存在的文件名再写。**不要列不存在的文件**。

### 3. Phase log（如 README 末尾有）

补上 Phase 5 / Phase 6 的描述行。

### 4. 不改的

- Stack 节
- License
- 项目介绍开篇（中英双语）
- 任何已有的截图引用

## 输出

1. 修改 README.md
2. 跑 `git diff README.md` 确认没误删
3. `git add README.md && git commit -m "[codex] README v2 — Phase 5/6 status + shader inventory update"`
4. `git push -u origin codex/readme-update-v2`
5. 在终端输出："✅ Task A done, branch codex/readme-update-v2 pushed"

完成后停下，不要 merge，不要碰其它文件。
```

---

## Task B — docs/postmortem.md 项目复盘

**worktree**: `xuexi-xiangmu-codex-postmortem`
**branch**: `codex/postmortem`
**预计**: 20-25 min

### prompt

```
你在 xuexi-xiangmu 项目的一个 codex worktree 里。目标：写 `docs/postmortem.md`（500-800 字中文），作为 v0.1.0 tag 的项目复盘。文件不存在，新建。

## Ground truth 来源（必读，每条都要读）

1. `progress.md` 全文 — 8 个 session 的完整流水
2. `git log --oneline` 全部 — Phase 1-6 commit 历史
3. `README.md` — 项目对外说法
4. `~/.claude/plans/https-activetheory-net-floating-turing.md` — 原始项目总纲（Phase 1-6 规划）
5. `docs/session-{2,4,5,6,9}*.md` — 各 session spec
6. `ls components/scenes/ components/fx/ components/dom/` — 落地组件清单

## 必须涵盖的 4 节（顺序固定，每节 100-200 字）

### 1. 复刻了哪些视觉（不要凭空）

按真实 commit 写。例：
- Phase 3: 走廊 hero（双墙 + 6 柱 + MeshReflectorMaterial 地板 + 视频屏 + 800 粒子 + Bloom/CA/Vignette/LensStreak）
- Phase 4: Work 玻璃方块网格 + voronoi hover 碎裂 + scroll dolly + 30k 粒子 dissolve 转场 + WorkDetail（hero video + MDX）
- Phase 5: About (SDF logo + wireframe lab) / Contact (粒子 + 表单) / 汉堡 GSAP 菜单 / Howler ambient / MobileFallback poster
- Phase 6（进行中）：HomeScene 重做 — 4-stage scroll narrative (ring/shower/workshop/spiral) + LoadingMandala + PostFX boost & 回调

### 2. 与 AT 真站差距（3-5 条具体的）

例：
- AT Hydra 引擎的 SDF 字体我们用静态 plane 模拟，文字内容是 hardcode
- AT 的"鼠标变形 voronoi"我们简化成 cube hover 才触发
- 路由切换粒子转场我们 30k，AT 真站约 80k（性能取舍）
- 4 stage 之间的相机切换我们用 scroll position，AT 用 GSAP scrub timeline 更平滑
- mobile 用 fallback poster，AT 是真做了简化 WebGL mobile 版

差距要诚实，**不要列我们做得比 AT 好的事**，那是炫耀不是复盘。

### 3. 9 个 session + 20+ codex worktree 协作模式学到什么

从 progress.md 抽：
- 哪一个 session Codex 委派成功（例：Session 5 的 voronoi + dissolve + MDX 三 worktree 30min 出活、merge 零冲突）
- 哪一次判断失误（例：Session 3 把"验证 + bug + 调参"打包给 Codex 被用户拨正——Codex 不善 iterate）
- Codex 适合的活的判据（独立 GLSL / 数据转换 / 文档；不适合：集成胶水 / 视觉调参 / bug 修）
- worktree 隔离起到什么作用（多个 Claude session 配额耗尽时进度不受影响）

### 4. OOM 防范学到什么（最大教训）

从 progress.md 抽：
- Turbopack 在 R3F + MCP preview 下首次编译会爆电脑（Pages active 7GB+），换 webpack 模式（launch.json --webpack）
- preview_start 是杀手；每个 task 完成后 stop → commit → restart
- 警戒线：Pages free < 400MB 危险，< 100MB 必须 stop preview
- macOS swap > 2GB 时整机卡死，不只是浏览器卡

## 不要写的

- 不要写"我们感谢 AT 团队"之类的客套
- 不要写"未来路线图"——那是 spec 不是复盘
- 不要列 commit hash（postmortem 是给人看的，不是给 git 看的）
- 不要超过 800 字

## 输出

1. 写 `docs/postmortem.md`
2. `git add docs/postmortem.md && git commit -m "[codex] v0.1.0 postmortem"`
3. `git push -u origin codex/postmortem`
4. 输出："✅ Task B done, branch codex/postmortem pushed"

完成后停下，不要碰其它文件。
```

---

## 完成后的 merge 顺序（Claude 来做）

两份都 push 完后，我会：

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git fetch
git merge --no-ff origin/codex/readme-update-v2 -m "Merge codex/readme-update-v2"
git merge --no-ff origin/codex/postmortem -m "Merge codex/postmortem"
git push
git worktree remove ../xuexi-xiangmu-codex-readme
git worktree remove ../xuexi-xiangmu-codex-postmortem
```

merge 前我会 `git diff origin/codex/<branch> main -- README.md docs/postmortem.md` 抽检一遍。
