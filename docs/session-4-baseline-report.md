# Session 4 Baseline Report — Home 场景视觉现状

## 拍摄条件

- 浏览器：preview MCP（Chrome 内核），viewport 1440x900
- 路由：`/`
- 启动：`npm run dev --webpack -p 3100`（webpack 模式，因 Turbopack 在本机持续触发 OOM）
- HEAD: `5e8d231` ([P3-lens] LensStreakEffect)
- 时间：Session 4

## 整体判断

走廊几何 + PostFX 代码全部跑通，**不存在编译错误 / WebGL 报错**。但视觉与 AT 真站的差距比较大。AT 真站这次没拿成截图（preview_eval navigate 走 SPA 风险大，Session 4 OOM 后不再折腾），凭对 plan file 描述 + AT 主页常识对比。

## 看到的（baseline ✓）

1. 走廊几何在跑：双墙朝消失点会聚、6 柱可见、墙脚见地板边缘
2. HomeBackScreen 的 magenta 屏光（#d600ff）显示在远端，能看到视频内容（hero.mp4 文字风格）
3. fog 把背景上方拉黑，深度过渡明确
4. 浏览器侧无 GLSL 编译错误（只有 `THREE.Clock deprecated`，无害）
5. canvas 用 WebGL2 上下文，宽高 = viewport

## 差异清单（按视觉权重 / 影响力排）

| # | 差异 | 影响 | 试改 |
|---|---|---|---|
| 1 | **粒子完全看不到** | 大 | 桌面 800 粒子应可见 magenta 点。怀疑 a) PointSize 太小，PointSize 公式 / DPR 感知问题 b) curl noise 把粒子推到 fog 外 c) AdditiveBlending 被 PostFX 后处理黑色背景吃掉 |
| 2 | **Bloom 光晕不明显** | 大 | magenta 屏光应有放射状光晕。当前 Bloom `intensity=1.2, threshold=0.6, radius=0.85`。建议 `intensity` → 1.6-2.0、`threshold` → 0.45-0.55 |
| 3 | **地板反射看不到** | 中 | MeshReflectorMaterial 应反射屏光 + 柱根。可能 `mirror=0.55` 偏弱、`mixStrength=0.6` 偏弱，或者 fog near=25 把反射糊掉了 |
| 4 | **LensStreak 看不到横向蓝条** | 中 | 这是 Phase 3 末尾新加的（commit 5e8d231）。屏光亮度 < `threshold=0.7` 时 streak 不触发。建议 LensStreak `threshold` → 0.5、`intensity` → 0.8 |
| 5 | **走廊整体偏暗、对比度低** | 中 | Vignette `darkness=0.55` 偏强；fog near=25 偏近、把中景纳入雾里 |
| 6 | **整体色调偏冷紫** | 小 | 没有 AT 的暖色 spot light。但 palette/sceneParams 已校准过，先不动 |

## 推荐第一轮调参（不动代码先 spec，避免冲动）

| 改什么 | 改在哪 | 当前值 → 目标 | 预期效果 |
|---|---|---|---|
| **Bloom 烈度** | `components/fx/PostFX.tsx:24-25` | `intensity=1.2 / threshold=0.6` → `intensity=1.8 / threshold=0.45` | 屏光放射光晕显眼 |
| **粒子 PointSize 范围** | `components/scenes/home/HomeParticles.tsx:32` | aSize `[1.3, 2.9]` → `[2.5, 5.5]` | 粒子可见 |
| **LensStreak 阈值/强度** | `components/fx/PostFX.tsx:32-38` | `threshold=0.7 / intensity=0.6` → `threshold=0.5 / intensity=0.85` | 横向冷蓝条出现 |
| **Floor mirror/mixStrength** | `components/scenes/home/HomeFloor.tsx:20,28` | `mixStrength=0.6 / mirror=0.55` → `mixStrength=0.8 / mirror=0.75` | 反射可见 |

## 不做的（Session 4 已超时 + OOM 风险）

- 走廊几何尺寸（geometry [40,12]）— 不动，结构是对的
- 相机参数（position/lookAt/fov）— AT UIL 抓的值，不动
- palette 颜色 — Phase 2 已校准
- 粒子 detectCount（800 desktop）— 数量看起来够，问题在大小不在数量

## 调参跑了哪几轮（Session 4 实际）

由于 OOM 限制 + 5h 配额 + 时间预算（用户限本 session 1h），**Session 4 没跑完调参循环**。仅做了 LensStreak 实现 + Phase 4 spec + 这份 baseline report。

实际跑的轮次（见下方追加）：

---

## 已跑的调参轮次

（每轮 commit 后追加；当前为空，留给 Session 5 继续）

---

## Session 5 调参起步

进入 Session 5 直接按本报告的「推荐第一轮」表起步。先改 1-2 个参数（不要一次改 4 个，无法归因），preview_screenshot 对比 baseline，记 round-1.jpg → commit `[P5-tune] round 1: ...` → 下一轮。

每轮 OOM 防范：commit + push（webpack 模式比 Turbopack 稳，但仍要小心）。
