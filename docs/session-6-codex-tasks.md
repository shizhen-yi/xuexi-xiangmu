# Session 6 — Codex 委托任务包（6 份，分两波）

每个 task 一段 self-contained prompt，可直接复制喂给 Codex（在一个 git worktree 里跑）。任务之间无依赖，可并行。

> **背景**：本项目是 Next.js 16 + R3F + Three.js 0.184 的 activetheory.net 复刻品（学习项目）。Shader 用 TS 模板字符串风格（不走 glslify / .vert/.frag 文件），避开 webpack/turbopack 配置。Palette 走 `palette.<scene>.<name>` 点路径（详见 `lib/palette.ts`）。
>
> **现有 shader 样板**：参考 `components/scenes/home/shaders/homeAlley.ts` 或 `components/scenes/work/shaders/workGlassCube.ts`（Codex 上一轮产出，公认风格基准）。
>
> **重要约束**：
> - 不装新 npm 依赖
> - 不改 `lib/palette.ts`（如需新颜色，从现有 `palette.*` 字段选）
> - 每个 task 结束 `git add` + commit + `git push -u origin <branch>` 即结束。不需要 merge 到 main（主线 Claude 干）

---

## 第一波（session 一开始就 dispatch，4 个 worktree 并行）

### Worktree 1 — `codex/about-logo-shader`

**分支**：`codex/about-logo-shader`
**预计**：5-8 min
**目标文件**：`components/scenes/about/shaders/aboutLogo.ts`（新建）

写一个 R3F `ShaderMaterial` 用的 TS 模板字符串 shader 模块，匹配现有 `components/scenes/home/shaders/homeAlley.ts` 的导出结构（export `vertexShader`, `fragmentShader`, `Uniforms` type, `makeUniforms()` factory）。

**用途**：贴在 plane `[3, 1.5]` 几何上做 AT-LAB 的 logo。

**实现细节**：
- **Vertex**：标准 modelViewProjection + pass `vUv`, `vWorldPos`, `vNormal`, `vViewDir`
- **Fragment**：
  - 在 UV 空间 hardcode 一个 SDF 函数，画 "AT-LAB" 4 个字母（用 box SDF + 旋转 + 组合即可，不需要真实字体；糙点没关系，能看出 4 个块状字符就行）
  - logo 内部用 `palette.home.screen`（magenta #d600ff）实色
  - logo 外部 alpha 0，但 SDF 边缘 0-3px 做 chromatic fresnel：按 `fresnel = pow(1 - dot(N, V), 2.5)` 拆 RGB 三通道，分别偏移 SDF 取色（R 偏 +0.003、G 不偏、B 偏 -0.003 在 UV 空间），形成边缘 RGB-split
  - 透明 fragment 直接 `discard`
- **Uniforms**：
  - `uTime: float`（时间，让 logo 微微脉冲 sin 0.1 强度）
  - `uOpacity: float`（默认 1）
- **导出**：
  ```ts
  export const vertexShader = /* glsl */ `...`;
  export const fragmentShader = /* glsl */ `...`;
  export type AboutLogoUniforms = { uTime: { value: number }; uOpacity: { value: number } };
  export function makeUniforms(overrides?: Partial<AboutLogoUniforms>): AboutLogoUniforms;
  ```

**验证**：本地 `npx tsc --noEmit` exit 0（worktree 内）

**收尾**：
```bash
git add components/scenes/about/shaders/aboutLogo.ts
git commit -m "[codex] aboutLogo shader — SDF AT-LAB + chromatic fresnel"
git push -u origin codex/about-logo-shader
```

---

### Worktree 2 — `codex/lab-logo-shader`

**分支**：`codex/lab-logo-shader`
**预计**：5-8 min
**目标文件**：`components/scenes/about/shaders/aboutLabLogo.ts`（新建）

写一个 R3F `ShaderMaterial` 用的 TS 模板字符串 shader 模块，结构同上。**用途**：贴在 wireframe 几何体（`<icosahedronGeometry args={[1, 1]}/>` + `<lineSegments>` 模式）上，做 "漂浮 lab cube" 效果。

**实现细节**：
- **Vertex**：标准 MVP；按 `uTime` 做 y 轴 sin 浮动 0.3 振幅 + 自转 0.2 rad/s；pass `vWorldPos`, `vNormal`
- **Fragment**：
  - 线框颜色：`palette.particles.coreA`（#c64dff）
  - 边缘 emissive glow：按 fresnel 强化亮度（边缘 1.8 倍亮，正面 0.6 倍）
  - 附加 sin 脉冲：整体亮度 `mix(0.7, 1.3, sin(uTime * 1.5) * 0.5 + 0.5)`
  - 无 transparency（线框本身有 air gap）
- **Uniforms**：
  - `uTime: float`
  - `uColor: vec3`（默认 #c64dff）
- **导出**：同 Worktree 1 的命名约定，type 名 `AboutLabLogoUniforms`

**验证**：`npx tsc --noEmit` exit 0

**收尾**：
```bash
git add components/scenes/about/shaders/aboutLabLogo.ts
git commit -m "[codex] aboutLabLogo shader — wireframe lab pulse + fresnel"
git push -u origin codex/lab-logo-shader
```

---

### Worktree 3 — `codex/about-team-data`

**分支**：`codex/about-team-data`
**预计**：3-5 min
**目标文件**：`data/about-team.ts`（新建）

写 6 个虚构 "学习项目 LAB" 团队成员数据。**风格**：AT 风格、不浮夸、role 偏技术 / 创意 / 商业混合、bio 不要 AI 味（不要"我们专注于…赋能"那种话术），更像独立 studio 真实简介。

**数据结构**：
```ts
export type TeamMember = {
  readonly slug: string;            // 'lin-yi'（拼音 kebab）
  readonly name: string;            // 中文名（虚构）
  readonly role: string;            // 中文 role，10 字内
  readonly bio: string;             // 中文 bio，60-80 字
  readonly avatar: string;          // picsum URL，seed=slug，200x200
};

export const team = [/* 6 个 */] as const satisfies readonly TeamMember[];
```

**6 个成员**：自由发挥，但建议 role 分布：1 Creative Director / 1 Tech Lead / 1 Shader Engineer / 1 Producer / 1 Designer / 1 Research。bio 写得有具体动作（"过去 8 年做实时图形"、"从 Hydra 引擎 reverse engineering 出发研究 WebGL2 管线"），避免空话。

**头像 URL 模板**：`https://picsum.photos/seed/<slug>/200/200`

**验证**：`npx tsc --noEmit` exit 0（data 文件类型自洽）

**收尾**：
```bash
git add data/about-team.ts
git commit -m "[codex] about-team data — 6 fictional team members"
git push -u origin codex/about-team-data
```

---

### Worktree 4 — `codex/readme-bilingual`

**分支**：`codex/readme-bilingual`
**预计**：8-10 min
**目标文件**：`README.md`（覆盖现有）

重写项目根 README.md 为**中英双语**结构，包含：

#### 章节
1. **标题 + 一句话简介**（中英）：项目是 activetheory.net 的 1:1 学习复刻，用 Next.js 16 + R3F 替代 AT 闭源 Hydra 引擎
2. **预览图**：占位 `docs/screenshots/p5-home.jpg` 等（4 张：home / work / work-detail / about；主线 Claude session 末会补图，Codex 先留 markdown 引用）
3. **Features / 功能**（中英对照）：
   - 5 routes（Home / Work / WorkDetail / About / Contact）
   - Persistent Canvas across route changes
   - 列出所有 custom shader（按文件清单，见下表）
   - PostFX 栈（Bloom + LensStreak + ChromaticAberration + Vignette）
   - 30k particle dissolve transition（Work → WorkDetail）
   - Ambient audio + first-gesture unlock
   - Mobile fallback poster
4. **Shader 表**（markdown table）：

| 文件 | 用途 | Phase |
|---|---|---|
| `components/scenes/home/shaders/homeAlley.ts` | 走廊墙面：扫描线 + fresnel + 远端 magenta 渐亮 | P3 |
| `components/scenes/home/shaders/homeColumn.ts` | 走廊柱：垂直渐变 + rim light + sin 脉冲 | P3 |
| `components/scenes/home/shaders/homeLogo.ts` | 背墙视频 logo：VideoTexture + RGB-shift | P3 |
| `components/scenes/home/shaders/homeParticle.ts` | 走廊飘浮粒子：curl-noise + 3-stop gradient | P3 |
| `components/fx/LensStreakEffect.ts` | postprocessing Effect：13-tap 横向高斯模糊 + halo | P3 |
| `components/scenes/work/shaders/workGlassCube.ts` | Work 玻璃方块 hover voronoi 碎裂 + RGB chromatic | P4 |
| `components/scenes/work/shaders/workBackground.ts` | Work 背景：4-sin noise 渐变 plane | P4 |
| `components/scenes/workDetail/shaders/dissolve.ts` | 30k 粒子 dissolve 转场（Work → Detail） | P4 |
| `components/scenes/about/shaders/aboutLogo.ts` | About SDF logo + chromatic fresnel edge | P5 |
| `components/scenes/about/shaders/aboutLabLogo.ts` | About 漂浮 wireframe lab cube + pulse | P5 |

5. **Stack / 技术栈**：Next.js 16.2 · React 19 · Three.js 0.184 · R3F + drei + postprocessing · GSAP · Lenis · zustand · Howler · maath · leva · r3f-perf
6. **Local dev**（中英）：
   ```bash
   npm install
   npm run dev -- -p 3100              # Turbopack（默认，16GB+ Mac 推荐）
   npm run dev -- --webpack -p 3100    # Webpack（8GB Mac 内存更稳）
   ```
7. **Project structure / 目录结构**：以树状图列重点目录（app/ / components/scenes/ / components/dom/ / components/fx/ / components/rig/ / components/webgl/ / shaders 嵌在 scenes 下 / lib/ / data/ / public/）
8. **Phase 进度表**（中英对照）：

| Phase | Session | 产出 |
|---|---|---|
| 1 | 1 | 5 routes + persistent Canvas + Lenis + zustand store |
| 2 | 2 | palette / sceneParams / projects / asset fetch script |
| 3 | 3-4 | HomeScene 走廊 + 4 shaders + PostFX + LensStreak |
| 4 | 5 | WorkScene 玻璃方块网格 + voronoi hover + scroll dolly + 30k particle dissolve + WorkDetail 详情页 |
| 5 | 6 | AboutScene + ContactScene + 完整 Nav + AudioToggle + 移动端 fallback + bilingual README |

9. **Reference / 参考**：
   - [activetheory.net](https://activetheory.net) — 视觉来源
   - [AT UIL JSON](https://activetheory.net/assets/data/uil.1778129964370.json) — 49 颜色 + 5 场景相机参数（提到 `lib/palette.ts` + `lib/sceneParams.ts`）
10. **License**：MIT (学习项目 / study purposes only)

#### 语言风格
- 中英文段落交替（英文先 → 中文紧跟一段）
- 不要 AI 味套话（避免 "delve / leverage / robust / cutting-edge"）
- 表格沿用上面格式

**验证**：本地预览 markdown 渲染正常即可（`gh markdown-preview` or 任何 viewer）

**收尾**：
```bash
git add README.md
git commit -m "[codex] README bilingual — features, shader table, phase log"
git push -u origin codex/readme-bilingual
```

---

## 第二波（主线 Claude 跑完 Phase 4 sanity + AboutScene 集成后 dispatch）

### Worktree 5 — `codex/ambient-audio-script`

**分支**：`codex/ambient-audio-script`
**预计**：5 min
**目标文件**：
- `scripts/generate-ambient.sh`（新建）
- `public/audio/ambient.ogg`（生成）

写一个 bash 脚本，用 `ffmpeg` 合成一段 30s 环境音 OGG 文件到 `public/audio/ambient.ogg`，用于 AudioToggle 的 ambient loop。

**声音设计**：
- 30s 时长
- low-pass pink noise（200Hz 滚降）+ 一个 80Hz sine drone + 一个 220Hz sine drone（互相 detune 几 cent 制造缓慢 beating）
- 0-2s 淡入、28-30s 淡出（实现无缝 loop）
- 整体音量很轻（-20dBFS 左右 RMS），不打扰主体验
- 单声道即可（mono → ffmpeg `-ac 1`）
- 编码 `libvorbis` quality 4（约 1.5-2MB）

**ffmpeg 命令骨架**（脚本里写完整版本）：
```bash
#!/usr/bin/env bash
set -euo pipefail
mkdir -p public/audio
ffmpeg -y \
  -f lavfi -i "anoisesrc=color=pink:duration=30:amplitude=0.06" \
  -f lavfi -i "sine=frequency=80:duration=30" \
  -f lavfi -i "sine=frequency=220.5:duration=30" \
  -filter_complex "
    [0:a]lowpass=f=200,volume=0.6[noise];
    [1:a]volume=0.18[drone1];
    [2:a]volume=0.15[drone2];
    [noise][drone1][drone2]amix=inputs=3:normalize=0,
    afade=t=in:st=0:d=2,afade=t=out:st=28:d=2,
    aresample=44100
  " \
  -ac 1 -c:a libvorbis -q:a 4 \
  public/audio/ambient.ogg
echo "Generated public/audio/ambient.ogg ($(du -h public/audio/ambient.ogg | cut -f1))"
```

**前置检查**：脚本开头检测 `command -v ffmpeg` 不存在就 `echo "需要安装 ffmpeg: brew install ffmpeg"; exit 1`

**Codex 在 worktree 里**：先跑脚本生成 ogg，确认能播放（`afplay public/audio/ambient.ogg`），commit 脚本 + 二进制 ogg

**验证**：`ls -la public/audio/ambient.ogg` 看大小 1-3MB 区间

**收尾**：
```bash
git add scripts/generate-ambient.sh public/audio/ambient.ogg
git commit -m "[codex] ambient audio script + 30s loop OGG"
git push -u origin codex/ambient-audio-script
```

---

### Worktree 6 — `codex/mobile-fallback`

**分支**：`codex/mobile-fallback`
**预计**：8 min
**目标文件**：
- `components/dom/MobileFallback.tsx`（新建）
- `public/poster-mobile.jpg`（生成 / 下载）

#### 6a — MobileFallback 组件

`components/dom/MobileFallback.tsx`：

```tsx
'use client';

import { useEffect, useState } from 'react';

/**
 * Detects mobile / small viewport and renders a static poster instead of WebGL.
 * Logic:
 *   - viewport width < 768 OR (max-touch-points > 0 AND no fine pointer) → mobile
 *   - Listen to matchMedia change to re-evaluate on rotate / resize
 *   - Returns null on desktop (let WebGL render)
 *   - On SSR returns null too (avoid hydration mismatch); detect runs on mount
 */
export function MobileFallback() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const widthMobile = window.matchMedia('(max-width: 767px)').matches;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(widthMobile || coarse);
    };
    check();
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white pointer-events-auto"
      style={{
        backgroundImage: 'url(/poster-mobile.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative text-center px-8 max-w-xs">
        <p className="text-xs uppercase tracking-[0.4em] text-[#d600ff] mb-4">
          学习项目 / xuexi-xiangmu
        </p>
        <h1 className="text-2xl font-medium leading-tight mb-3">
          请在桌面访问
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          View on desktop · 这是一个 WebGL 学习 demo，需要更大屏幕和更强的图形性能。
        </p>
      </div>
    </div>
  );
}
```

#### 6b — poster 图片

下载或生成 `public/poster-mobile.jpg`（1080×1920 竖屏，~200KB），主题是 magenta 走廊 + 深色背景。

**推荐方式**（任选其一）：
- `curl -L "https://picsum.photos/seed/xuexi-poster/1080/1920" -o public/poster-mobile.jpg`（最快）
- 或 pollinations.ai: `curl -L "https://image.pollinations.ai/prompt/magenta%20neon%20corridor%20webgl%20cyberpunk%20dark?width=1080&height=1920" -o public/poster-mobile.jpg`（更切题但慢）

#### 不接入 layout
**只写组件 + 下载图**，不要改 `app/layout.tsx`（主线 Claude 接入，避免冲突）

#### 验证
- 文件大小 100KB-500KB
- `npx tsc --noEmit` 在 worktree 通过

**收尾**：
```bash
git add components/dom/MobileFallback.tsx public/poster-mobile.jpg
git commit -m "[codex] MobileFallback component + poster image"
git push -u origin codex/mobile-fallback
```

---

## Codex 总体注意事项

1. **不改 `lib/palette.ts`**（主线 Claude 不希望 merge 时冲突）
2. **不装新 npm 依赖**
3. **不改 `app/layout.tsx` / `package.json` / `tsconfig.json` / `next.config.ts`**（主线集成层文件）
4. **不删现有文件**
5. **每个 worktree 只 commit 自己 task 的文件**，不要顺手清其它
6. **commit message 前缀 `[codex]`** 便于主线 merge 时识别
7. **push 后 worktree 留着**，等主线 merge 完成由用户 / Claude 清理

完。
