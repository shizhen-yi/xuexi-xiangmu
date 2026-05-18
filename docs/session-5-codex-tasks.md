# Session 5 — Codex 并行任务包

Phase 4 Claude 主线 90min，配 3 个 Codex worktree 并行跑 GLSL + MDX。每份 prompt 自包含、不依赖本对话上下文。

---

## 启动 3 个 worktree

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git worktree add ../xuexi-xiangmu-codex-voronoi  -b codex/voronoi-shader
git worktree add ../xuexi-xiangmu-codex-dissolve -b codex/dissolve-shader
git worktree add ../xuexi-xiangmu-codex-mdx      -b codex/work-details-mdx
```

进各 worktree，把对应 prompt 喂给 Codex CLI 跑。完成后每个 worktree 自己 `git push -u origin <branch>`，Claude 主线 fetch + merge。

---

## Codex Prompt 1 — voronoi shader（hover 态碎裂折射）

工作目录：`../xuexi-xiangmu-codex-voronoi`（codex/voronoi-shader branch）

```
你是 GLSL 专家。在当前 worktree 写 2 个文件，然后 commit + push。

任务：WorkGlassCubeShader 的 hover 态 GLSL（vert + frag）

输出文件（只创建这两个）：
- shaders/work/voronoi.vert
- shaders/work/voronoi.frag

严禁：
- import Three.js 或任何 JS
- 修改任何已存在文件
- 写非 .vert / .frag 文件
- 装 npm 包
- 写 README

============================================================
VERTEX SHADER (shaders/work/voronoi.vert)
============================================================

Three.js 自动注入的 uniforms / attributes 不要重新声明（modelMatrix, viewMatrix, projectionMatrix, normalMatrix, cameraPosition, position, normal, uv）。

新增声明：

  uniform float uTime;
  uniform float uHoverAmount;  // 0-1

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

内联一个 IQ 风格 3D voronoi（hash 函数 + 27 个邻居单元，返回最近距离 0-1）。约 25 行。参考实现：

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
  }

  float voronoi(vec3 x) {
    vec3 ip = floor(x);
    vec3 fp = fract(x);
    float minDist = 1.0;
    for (int k = -1; k <= 1; k++)
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec3 g = vec3(float(i), float(j), float(k));
      vec3 o = hash3(ip + g);
      vec3 r = g + o - fp;
      float d = dot(r, r);
      minDist = min(minDist, d);
    }
    return sqrt(minDist);
  }

main() 行为：
  1. float v = voronoi(position * 4.0 + uTime * 0.5);
  2. vec3 displaced = position + normal * v * 0.25 * uHoverAmount;
  3. vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  4. vNormal = normalize(normalMatrix * normal);
  5. vViewDir = normalize(cameraPosition - worldPos.xyz);
  6. vUv = uv;
  7. gl_Position = projectionMatrix * viewMatrix * worldPos;

============================================================
FRAGMENT SHADER (shaders/work/voronoi.frag)
============================================================

precision highp float;

uniform sampler2D uEnvMap;    // equirectangular HDR
uniform vec3 uTint;            // default vec3(0.706, 0.878, 0.890) = #b4e0e3
uniform float uHoverAmount;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

equirect uv helper：

  vec2 equirectUv(vec3 d) {
    return vec2(atan(d.z, d.x) / 6.2831853 + 0.5,
                asin(clamp(d.y, -1.0, 1.0)) / 3.1415926 + 0.5);
  }

main() 行为：
  1. vec3 N = normalize(vNormal); vec3 V = normalize(vViewDir);
  2. vec3 R = reflect(-V, N);
  3. float off = 0.04 * uHoverAmount;
  4. vec2 uvR = equirectUv(R + vec3(off, 0.0, 0.0));
  5. vec2 uvG = equirectUv(R);
  6. vec2 uvB = equirectUv(R - vec3(off, 0.0, 0.0));
  7. vec3 chroma = vec3(texture2D(uEnvMap, uvR).r,
                        texture2D(uEnvMap, uvG).g,
                        texture2D(uEnvMap, uvB).b);
  8. float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  9. vec3 col = mix(chroma, uTint, 0.2) + uTint * fres * 0.4;
  10. gl_FragColor = vec4(col, 1.0);

============================================================
完成后
============================================================

  mkdir -p shaders/work
  git add shaders/work/voronoi.vert shaders/work/voronoi.frag
  git commit -m "[P4-codex-voronoi] WorkGlassCube hover voronoi + RGB-split"
  git push -u origin codex/voronoi-shader

不要做其他事。
```

---

## Codex Prompt 2 — dissolve shader（粒子碎化转场）

工作目录：`../xuexi-xiangmu-codex-dissolve`（codex/dissolve-shader branch）

```
你是 GLSL 专家。在当前 worktree 写 2 个文件，然后 commit + push。

任务：WorkDetailParticles 粒子碎化转场的 GLSL（vert + frag）

输出文件（只创建这两个）：
- shaders/workDetail/dissolve.vert
- shaders/workDetail/dissolve.frag

严禁：
- import Three.js 或任何 JS
- 修改任何已存在文件
- 写非 .vert / .frag 文件
- 装 npm 包
- 写 README

============================================================
VERTEX SHADER (shaders/workDetail/dissolve.vert)
============================================================

Three.js 自动注入的不重声明（viewMatrix, projectionMatrix, position）。注意：position 仍然存在但我们不用它，用 aFromPos / aToPos 自己控制。

新增声明：

  attribute vec3 aFromPos;   // 粒子起始世界坐标（cube 表面采点）
  attribute vec3 aToPos;     // 粒子目标世界坐标（detail hero plane 采点）
  attribute float aSeed;     // 0-1
  attribute float aLife;     // 0-1
  uniform float uTime;
  uniform float uProgress;   // 0-1 全局转场进度
  uniform float uPxRatio;
  uniform vec3 uColorA;      // #c64dff
  uniform vec3 uColorB;      // #422ea3
  uniform vec3 uColorC;      // #84c8c3

  varying float vProgress;
  varying vec3 vColor;

内联简化 3D curl noise（用 3 个 sin/cos 不同频率叠加，不要 perlin/simplex）：

  vec3 curlNoise(vec3 p) {
    return vec3(
      sin(p.y * 1.7 + p.z * 0.9) - cos(p.z * 2.3),
      sin(p.z * 1.3 + p.x * 1.1) - cos(p.x * 2.1),
      sin(p.x * 0.7 + p.y * 1.9) - cos(p.y * 2.5)
    );
  }

main() 行为：
  1. float p = smoothstep(0.0, 1.0, uProgress);
  2. vec3 base = mix(aFromPos, aToPos, p);
  3. vec3 curl = curlNoise(base * 0.5 + uTime * 0.3 + aSeed * 6.283);
  4. float disturb = 1.0 - abs(uProgress - 0.5) * 2.0;  // 中段最大
  5. vec3 pos = base + curl * disturb * 0.8;
  6. gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
  7. gl_PointSize = (2.0 + sin(aSeed * 6.283) * 1.0) * uPxRatio;
  8. vProgress = uProgress;
  9. vColor = aSeed < 0.33 ? uColorA : (aSeed < 0.66 ? uColorB : uColorC);

============================================================
FRAGMENT SHADER (shaders/workDetail/dissolve.frag)
============================================================

precision highp float;

varying float vProgress;
varying vec3 vColor;

main() 行为：
  1. float d = length(gl_PointCoord - 0.5);
  2. if (d > 0.5) discard;
  3. float alpha = smoothstep(0.5, 0.0, d) * 0.9;
  4. alpha *= 1.0 - smoothstep(0.85, 1.0, vProgress);  // 末段淡出
  5. gl_FragColor = vec4(vColor, alpha);

============================================================
完成后
============================================================

  mkdir -p shaders/workDetail
  git add shaders/workDetail/dissolve.vert shaders/workDetail/dissolve.frag
  git commit -m "[P4-codex-dissolve] WorkDetail particle dissolve GLSL"
  git push -u origin codex/dissolve-shader

不要做其他事。
```

---

## Codex Prompt 3 — 4 个 work detail MDX

工作目录：`../xuexi-xiangmu-codex-mdx`（codex/work-details-mdx branch）

```
你是中文文案撰稿。在当前 worktree 写 4 个 .mdx 文件，然后 commit + push。

任务：4 个项目详情页虚构文案

输出文件（4 个）：
- data/work-details/signal-garden.mdx
- data/work-details/neon-index.mdx
- data/work-details/echo-vault.mdx
- data/work-details/midnight-grid.mdx

（共 5 个 slug，跳过 liquid-origin）

严禁：
- 改任何已存在文件（包括 data/projects.ts）
- 用 emoji
- 用 AI 套话（"全方位"、"赋能"、"打造"、"全面"、"赋能"、"立体化"）
- 真实公司名（编虚构客户）
- 写第 5 个

每个文件结构：

---
title: 项目名（中文，3-6 字）
client: 客户名（虚构英文）
year: 2024 或 2025
role: "Creative Direction · WebGL · Sound Design"
---

## 项目背景

约 80 字。讲虚构客户的问题 / 野心，AT 风格抽象但具体。

## 解法

约 100 字。讲 WebGL / Three.js / shader / GSAP 等技术怎么解。

## 亮点

- 约 15 字 bullet 1
- 约 15 字 bullet 2
- 约 15 字 bullet 3

风格参考：activetheory.net 案例页，简洁、抽象、技术 + 美学并重、避免营销腔。

============================================================
完成后
============================================================

  mkdir -p data/work-details
  git add data/work-details/*.mdx
  git commit -m "[P4-codex-mdx] 4 work detail MDX placeholders"
  git push -u origin codex/work-details-mdx

不要做其他事。
```

---

## Merge 流程（Claude 主线在 T1 后跑）

```bash
cd "/Users/Admin/claude code/xuexi-xiangmu"
git fetch origin
git merge origin/codex/voronoi-shader  --no-edit
git merge origin/codex/dissolve-shader --no-edit
git merge origin/codex/work-details-mdx --no-edit
```

Codex 只写新文件、不改已有文件，冲突几率近 0。

## 收口（session 末尾）

```bash
git worktree remove ../xuexi-xiangmu-codex-voronoi
git worktree remove ../xuexi-xiangmu-codex-dissolve
git worktree remove ../xuexi-xiangmu-codex-mdx
git branch -d codex/voronoi-shader codex/dissolve-shader codex/work-details-mdx
git push origin --delete codex/voronoi-shader codex/dissolve-shader codex/work-details-mdx
```

## Fallback（不用 worktree）

不想 worktree → 把上面 3 份 prompt 直接喂网页版 Codex / ChatGPT，输出复制到对应路径（main branch 上直接 add + commit）。Claude 主线流程不变。
