# v0.1.0 项目复盘

## 1. 复刻了哪些视觉

Phase 3 先做走廊 hero：双墙、6 柱、MeshReflectorMaterial 地板、视频屏、800 粒子和 Bloom/CA/Vignette/LensStreak。Phase 4 落地 Work：玻璃方块网格、voronoi hover 碎裂、scroll dolly、30k 粒子 dissolve 转场、WorkDetail hero video 和 MDX。Phase 5 补 About 的 SDF logo 与 wireframe lab、Contact 粒子表单、GSAP 汉堡菜单、Howler ambient、MobileFallback poster。Phase 6 进行中，HomeScene 重做为 ring/shower/workshop/spiral 四段滚动叙事，并加入 LoadingMandala 与 PostFX boost/回调。

## 2. 与 AT 真站差距

差距集中在引擎与密度。AT 的 Hydra SDF 字体系统，我们用静态 plane 和 hardcode SDF 近似；鼠标变形 voronoi 在真站是全局语言，这里只在 cube hover 触发；WorkDetail 转场是 30k 粒子，低于真站级别密度；四段 Home 主要按 scroll position 切换，不如 GSAP scrub timeline 平滑；移动端只给 poster fallback，没有做简化 WebGL mobile 版。

## 3. 协作模式学到什么

9 个 session 和 20+ worktree 证明：Codex 适合边界清楚、输入输出完整的活。Session 5 最成功，voronoi、dissolve、MDX 三个 worktree 约 30 分钟出活，merge 零冲突。Session 3 的误判也清楚：把“验证 + bug + 调参”打包给 Codex，被用户拨正。独立 GLSL、数据转换、文档适合委派；集成胶水、视觉调参、运行时 bug 修不适合。worktree 隔离让配额耗尽时进度不被单点卡住。

## 4. OOM 防范学到什么

最大教训是 preview 比代码更危险。Turbopack 在 R3F + MCP preview 下首次编译会爆电脑，Pages active 曾到 7GB+；改 webpack 模式后才可控。preview_start 是杀手，每个 task 后都要 stop、commit、restart。Pages free < 400MB 是危险区，< 100MB 必须停 preview。macOS swap > 2GB 后卡死的是整机，不只是浏览器。结论：先保命，再验证，再提交。
