# Session 4 — Phase 3 视觉调参 + LensStreak（给下一个 Claude session 用）

Phase 3 的代码 + 编译验证已经过：commit `8bfa094` 加上 docs，`npx tsc --noEmit` 干净、`npm run build` 3.2s clean、7 个静态页全生成。这意味着集成胶水（drei MeshReflectorMaterial、@react-three/postprocessing、useTexture 对象签名、VideoTexture SSR guard、ShaderMaterial 实例共享）都装配对了，但**运行时**视觉对不对、相机距离合不合适、Bloom 烈度是否过头，没人见过实物。

Session 4 把这些「需要反复跑 dev + 截图反馈」的活做掉。**不要委托给 Codex**（Codex 不会持续观察、调整、再观察），用一个 Claude session 完成。

预计 2-2.5h。完成后 Phase 3 关闭，Phase 4（WorkScene 网格）可启动。

---

## 开局 checklist

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git log --oneline -8
cat progress.md           # 读 Session 3 末尾
# 跳读这份 + ~/.claude/plans/xuexi-xiangmu-activetheory-net-splendid-wind.md
```

dev server 起法（preview_start 比 raw shell 安全，自带 OOM 恢复）：

```
preview_start name=xuexi-xiangmu      # .claude/launch.json 已配，port 3100
```

若电脑紧张：先 `pkill -f "next-server\|next dev"` 清残留，再起。

---

## Task 1 · 首屏视觉基线 + 真站对照

1. **起 dev**，等 `Compiled successfully` 后 `preview_screenshot`。
2. 用 `mcp__Claude_in_Chrome__navigate` 打开 https://activetheory.net/，等动画稳定后截一张。
3. 两张图存到 `/tmp/at-real-<date>.png`、`/tmp/ours-baseline-<date>.png`。
4. 在 `docs/session-4-baseline-report.md` 里**只写差异清单**（不写共同点），按视觉权重排（最显眼的写第一条）：
   - 走廊长度感（透视消失点位置）
   - 屏光亮度 / 光晕半径
   - 地板反射强度
   - 柱子可见度 / 位置
   - 粒子密度 / 颜色分布
   - 整体色调（暖/冷偏移）
5. **不动代码**，只产报告。报告里给每条差异预填一个「试改」建议（参数名 + 当前值 + 建议值）。

---

## Task 2 · 参数调优（3-5 轮，每轮一 commit）

按 Task 1 报告里的差异清单，按权重从高到低改。每轮的步骤：

1. 改 1-2 个参数（不要一次改 5 个，无法归因）
2. HMR 后 `preview_screenshot` 拿新图
3. 跟 Task 1 的 AT 真站图对比，决定接受 / 回退 / 继续微调
4. 接受 → `git commit -m "[P3-tune] round N: <what> <a→b>"`，下一轮
5. 回退 → `git restore` 该次改动，记一行进 baseline-report 末尾「试过 X：差/无效，放弃」

调参对照表（按命中频率排）：

| 改什么 | 改在哪 | 默认值 → 范围 |
|---|---|---|
| Bloom 烈度 | components/fx/PostFX.tsx | `intensity={1.2}` → 0.8-1.6 / `luminanceThreshold={0.6}` → 0.4-0.8 |
| 屏光面亮度 | components/scenes/home/HomeBackScreen.tsx | `opacity={0.45}` → 0.3-0.7 |
| ChromaticAberration | components/fx/PostFX.tsx | offset `[0.0008, 0.0012]` → 全减半 or 全加倍 |
| Vignette | components/fx/PostFX.tsx | `darkness={0.55}` → 0.4-0.7 / `offset={0.35}` → 0.3-0.5 |
| 地板反射模糊 / 强度 | components/scenes/home/HomeFloor.tsx | `mixStrength={0.6}` → 0.3-0.9 / `blur={[300,100]}` → [200,50]~[400,150] / `resolution={512}` 保持（perf） |
| 走廊长 | components/scenes/home/HomeAlleyWalls.tsx | `PlaneGeometry(40, 12)` 长 → 32-50 |
| 柱密度 | components/scenes/home/HomeColumns.tsx | `COLUMN_POSITIONS` z 值 → 改 3 → 4 根/侧或调间距 |
| 粒子数 | components/scenes/home/HomeParticles.tsx | `detectCount` desktop 800 → 500-1500 |
| 粒子漂速 | components/scenes/home/shaders/homeParticle.ts | y `uTime*0.05` → 0.03-0.1 |
| 走廊雾色/距离 | components/scenes/home/HomeEnvironment.tsx | `fog args [color, 25, 80]` 改 near/far |
| 视频屏 magenta tint | components/scenes/home/shaders/homeLogo.ts | `mix(rgb, rgb*uTint, 0.35)` → 0.2-0.6 |
| 相机参数 | lib/sceneParams.ts | **慎改**：position/lookAt/fov 是 AT UIL 抓的，先动 wobbleStrength 0.1 → 0.05-0.2 |

**不要改的**（除非有明确理由）：
- `lib/palette.ts` 颜色常量（Phase 2 已经按 AT UIL 校准过）
- `lib/sceneParams.ts` 的 position/lookAt/fov（同样直接来自 AT UIL）
- CameraRig / CursorTracker / SceneRouter（Phase 1-2 集成不要触碰）

每轮 commit message 格式：
```
[P3-tune] round N: <one-line summary>

Before: <param=value>
After:  <param=value>
Reason: <对比 AT 后的判断>

Co-Authored-By: ...
```

3-5 轮后视觉接近就停。**不要刷新还在追完美**——这是 demo 不是给客户。

---

## Task 3 · LensStreak Effect（postprocessing Effect 子类）

plan file 里 LensStreak 是 Phase 3 末尾收尾。AT 的 `HydraLensStreakEffect` 配色：
- streak: `#c2dcff`（横向条纹色）
- halo: `#cceeff`（halo 色）

实现思路（postprocessing 6.x Effect API）：

```ts
// components/fx/LensStreakEffect.ts
import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Color } from 'three';

const fragmentShader = /* glsl */ `
  uniform vec3 uStreakColor;
  uniform vec3 uHaloColor;
  uniform float uIntensity;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // 横向 1D 高斯模糊，只对高亮像素采样
    vec3 streak = vec3(0.0);
    float total = 0.0;
    for (float i = -6.0; i <= 6.0; i += 1.0) {
      vec2 offset = vec2(i * 0.02, 0.0);
      vec3 s = texture2D(inputBuffer, uv + offset).rgb;
      float lum = dot(s, vec3(0.299, 0.587, 0.114));
      float w = exp(-i*i*0.08) * smoothstep(0.7, 1.0, lum);
      streak += s * w;
      total += w;
    }
    streak = (streak / max(total, 0.001)) * uStreakColor * uIntensity;

    // halo: 径向贡献
    vec2 c = vec2(0.5);
    float halo = pow(1.0 - distance(uv, c) * 2.0, 3.0) *
                 smoothstep(0.7, 1.0, dot(inputColor.rgb, vec3(0.333)));

    outputColor = vec4(
      inputColor.rgb + streak + uHaloColor * halo * uIntensity * 0.3,
      inputColor.a
    );
  }
`;

export class LensStreakEffect extends Effect {
  constructor({ streakColor = '#c2dcff', haloColor = '#cceeff', intensity = 0.6 } = {}) {
    super('LensStreakEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uStreakColor', new Uniform(new Color(streakColor))],
        ['uHaloColor', new Uniform(new Color(haloColor))],
        ['uIntensity', new Uniform(intensity)],
      ]),
    });
  }
}
```

然后在 `components/fx/PostFX.tsx` 把 TODO 注释换成 `<primitive object={lensStreakEffect}/>`（useMemo 创建实例）。位置：**Bloom 之后、ChromaticAberration 之前**——让 streak 先染色，再被 CA 偏移。

完成后 screenshot 看 magenta 屏光是否长出横向冷蓝条纹。强度通过 intensity prop 0.4-0.9 微调。

commit：`[P3-lens] LensStreakEffect (#c2dcff streak + #cceeff halo)`。

---

## Task 4 · 多视口 / 路由切换 sanity

1. `preview_resize preset=mobile` → 截图，粒子应自动降到 300（HomeParticles 的 `detectCount`）。视觉允许难看，只要不崩。
2. `preview_resize preset=desktop` → 切回。
3. `preview_eval window.history.pushState({}, '', '/work')` 看 Canvas 持久（同 `<canvas>` DOM 实例），切回 `/` Home 应**瞬时**显示（HDRI/textures/video 都被 drei 缓存了）。
4. 不通过就回到 Task 2 处理。

---

## 关 Phase 3

全部 task 跑完后：

1. 更新 `progress.md` Session 3 节末尾：把「未本地验证」相关条目划掉，新增 Session 4 节流水
2. 终态 commit：`[P3-close] Phase 3 done, ready for Phase 4`（空 commit 或带最后一处微调）
3. push

下次 session 起 Phase 4：WorkScene 玻璃方块网格。WorkDetail 的粒子转场是 Phase 4 末尾。

---

## 兜底

- dev server 起不来 / build 报错：先 `git log --oneline -5` 看是不是被自己改坏，必要时 `git reset --hard <last-known-good-sha>`（当前已知好的：`d88f469`、`8bfa094`）
- 电脑卡：关 Chrome 大部分 tab、停掉别的 dev server。最差情况只跑 `next build` 而不是 `next dev`，对每次代码改动构建一次拿 dist 看（慢但稳）
- LensStreak 写不通：跳过、留 TODO 注释、进 Phase 4，回头再补（不阻塞主线）
