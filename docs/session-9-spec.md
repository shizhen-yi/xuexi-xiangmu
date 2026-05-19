# Session 9 — Phase 6 收口：视觉 sanity + 功能验证 + v0.1 tag

接 Session 7/8（HEAD `08a9de3`）。HomeScene 4-stage 叙事已 commit，7 个 codex worktree 已清理，progress.md 已补全。

**本 session 目标**：做到现在为止从未做过的事——把积累了 4 个 session 的运行时视觉全部验证一遍，修掉 bug，然后给项目打 v0.1 tag。不开新 feature，不改架构。

预计 2h。每个 task 独立 commit。

---

## 开局 sanity 顺序

先关多余应用（目标 free > 400MB），再 preview_start。不要开 Turbopack。

```bash
vm_stat | grep "Pages free"
# 关浏览器 / 其他占内存的应用
cd "/Users/Admin/claude code/xuexi-xiangmu"
npm run dev -- --webpack -p 3100   # 或按 launch.json 配置
```

---

## Task 1 — Home 4-stage 视觉 sanity（40 min）

这是最高优先级。4 个 stage 的视觉从来没有截图确认过。

**验证清单**（每条截图 + 存 docs/screenshots/p6-stage-N.jpg）：

1. **Stage 1 Ring**（scroll 0%）：看到 iridescent torus ring + chromatic fresnel，粒子环绕
2. **Stage 2 Shower**（scroll ~33%）：5k 金/白粒子从上方降落，视觉是"瀑布/雨"感
3. **Stage 3 Workshop**（scroll ~66%）：线框穹顶 + 悬挂线 + 内部粒子，蓝调工业感
4. **Stage 4 Spiral**（scroll 100%）：12 条螺旋轨道 + 流动虚线光

**验证方法**：
```js
// preview_eval 各段 scroll 位置
window.scrollTo(0, 0)                          // stage 1
window.scrollTo(0, document.body.scrollHeight * 0.33)  // stage 2
window.scrollTo(0, document.body.scrollHeight * 0.66)  // stage 3
window.scrollTo(0, document.body.scrollHeight)          // stage 4
```

**常见问题预判**：
- stage 过渡不明显 → 检查 scroll progress 是否正确映射到 `[0,1,2,3]` 段
- FPS 掉到 30 以下 → 先降粒子数（particles 20k → 10k），PostFX bloom 再回调
- Workshop 穹顶不可见 → 检查 opacity / EdgesGeometry 是否正确

**Codex 可派**：无（视觉调参需要持续反馈）

Commit：`[P6-sanity] home 4-stage visual verified + fixes`（如有 bug 修）

---

## Task 2 — Work + WorkDetail 视觉 sanity（20 min）

Phase 4 Session 5 遗留，4 个 session 没做。

1. **`/work` 5 个 cube 渲染**：magenta 边线 glass cube，scroll dolly 推进
2. **hover voronoi**：preview_eval 模拟 pointermove 到 cube 位置 → 看 shader 碎裂
3. **粒子转场**：模拟 click cube → 等 1.5s → 看是否有粒子 + 路由跳转
4. **`/work/signal-garden` 详情页**：hero video 播放 + MDX 文案渲染

**如有 bug**：一条 `[P4-fix-N]` commit 修，不超过 2 个 fix。时间不够就跳过视觉调参，保证 tsc + build clean 即可。

Commit：`[P4-fix] work scene runtime bug fixes`（如有）

---

## Task 3 — Audio / Loading / Mobile fallback 功能确认（15 min）

三个组件都已接入 layout.tsx，但从未端到端验证。

1. **LoadingMandala**：preview_reload → 看首屏是否有 loading 动画 → 进度条走到 100% 后消失
2. **AudioToggle**：点击 → 看是否切换 icon → 听到 ambient.ogg 播放（ambient.ogg 已在 public/audio/）
3. **MobileFallback**：`preview_resize 375 812` → 看到 "请在桌面访问" poster，WebGL 不渲染

**如有 bug**：一条 `[P5-fix-N]` commit 修。Howler 首次手势解锁是最常见问题（需要真实 click 事件而非 preview_eval）。

Commit：`[P5-fix] loading/audio/mobile runtime fixes`（如有）

---

## Task 4 — 多视口 sanity（15 min）

```
preview_resize 1440 900  → Home + Work 路由各截图
preview_resize 1920 1080 → 同上（确认粒子密度不爆）
preview_resize 768 1024  → 平板 landscape（WebGL 还是 fallback？）
preview_resize 375 812   → mobile（MobileFallback 生效）
```

目标：1440 ≥ 55fps，768 ≥ 40fps，375 fallback 无 WebGL。

Commit：`[P6-viewport] multi-viewport fixes`（如有）

---

## Task 5 — v0.1 tag + postmortem（20 min）

最后一件事。

1. 确认 `npm run build` clean（tsc + build）
2. `git tag v0.1.0 -m "Phase 1-6: AT-style Home 4-stage + Work + WorkDetail + About + Contact"`
3. `git push origin v0.1.0`
4. 写 `docs/postmortem.md`（500-800 字，不需要太长）：
   - 复刻了哪些视觉：走廊 → 4-stage 叙事 / voronoi hover / 粒子转场 / PostFX 全栈
   - 与 AT 真站差距（3-5 条）
   - 9 个 session + 20+ codex worktree 协作模式学到什么
   - OOM 防范（最大教训）

Commit：`[P6-close] v0.1.0 — Phase 6 done, tag pushed`

---

## Session 9 结束后可选 Phase 7

- 性能优化（bundle 分析 / R3F adaptive pixel ratio）
- 替换虚构文案为真实案例
- 移动端 WebGL 适配（不要 fallback，真正做 mobile 版）
- `/lab` 隐藏路由（JellyfishDemo / TreeScene 等砍掉的 demo）

---

## Codex 边界

本 session **没有 Codex 任务**，全是视觉调试 + 截图 + 一次性 bug 修，需要持续视觉反馈，Codex 不适合。

---

## OOM 防范

1. 开 preview 前关多余应用，目标 free > 400MB
2. 每个 task 完成后 preview_stop → commit → preview_start（不要连跑）
3. webpack 模式（已在 launch.json 配置）
4. `vm_stat | grep "Pages free"` 每 10min check
