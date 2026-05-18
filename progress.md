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
