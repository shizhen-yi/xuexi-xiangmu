'use client';

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { palette } from '@/lib/palette';
import { useStore } from '@/lib/store';

const LAYER_COUNT = 6;
const STEPS = 30;

type Point = {
  x: number;
  y: number;
};

type MandalaShape =
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'polygon'; points: string };

type MandalaLayer = {
  radius: number;
  shapes: MandalaShape[];
};

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function polarPoint(radius: number, degrees: number): Point {
  const angle = toRad(degrees - 90);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
): string {
  return Array.from({ length: sides }, (_, i) => {
    const p = polarPoint(radius, rotation + (360 / sides) * i);
    return `${(cx + p.x).toFixed(2)},${(cy + p.y).toFixed(2)}`;
  }).join(' ');
}

function buildMandalaLayers(): MandalaLayer[] {
  return Array.from({ length: LAYER_COUNT }, (_, layerIndex) => {
    const ringRadius = 8 + layerIndex * 14;
    const shapeRadius = 5 + layerIndex * 1.35;
    const shapes = Array.from({ length: 6 }, (_, itemIndex): MandalaShape => {
      const angle = itemIndex * 60 + layerIndex * 30;
      const { x, y } = polarPoint(ringRadius, angle);

      if (layerIndex % 3 === 2) {
        return { kind: 'circle', cx: x, cy: y, r: shapeRadius * 0.6 };
      }

      const sides = layerIndex % 2 === 0 ? 3 : 6;
      return {
        kind: 'polygon',
        points: polygonPoints(x, y, shapeRadius, sides, angle + (sides === 3 ? 30 : 0)),
      };
    });

    return { radius: ringRadius, shapes };
  });
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function LoadingMandala(): JSX.Element | null {
  const progress = useStore((s) => s.loadProgress);
  const [done, setDone] = useState(false);
  const layers = useMemo(buildMandalaLayers, []);
  const displayProgress = clamp01(progress);

  useEffect(() => {
    if (progress < 1) return;

    const t = setTimeout(() => setDone(true), 600);
    return () => clearTimeout(t);
  }, [progress]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      if (useStore.getState().loadProgress > 0) return;

      const start = Date.now();
      interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 6000;
        const p = Math.min(elapsed, 1);
        useStore.getState().setLoadProgress(p);
        if (p >= 1 && interval) clearInterval(interval);
      }, 100);
    }, 1500);

    return () => {
      clearTimeout(t);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black transition-opacity duration-[600ms] ease-out"
      style={{ opacity: progress >= 1 ? 0 : 1, pointerEvents: done ? 'none' : 'auto' }}
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        <svg
          viewBox="-100 -100 200 200"
          className="h-[180px] w-[180px] overflow-visible"
          role="img"
          aria-hidden="true"
        >
          <circle
            cx="0"
            cy="0"
            r="88"
            fill="none"
            stroke={palette.legacy.greenElectric}
            strokeOpacity="0.12"
            strokeWidth="0.75"
          />

          {layers.map((layer, layerIndex) => {
            const unlocked = displayProgress > layerIndex / LAYER_COUNT;
            const layerProgress = clamp01(displayProgress * LAYER_COUNT - layerIndex);
            const direction = layerIndex % 2 === 0 ? 1 : -1;
            const rotation = direction * layerProgress * (36 + layerIndex * 12);
            const scale = 0.68 + layerProgress * 0.32;
            const stroke = layerIndex % 2 === 0 ? palette.legacy.greenElectric : palette.pureWhite;

            return (
              <g
                key={layer.radius}
                style={{
                  opacity: unlocked ? 1 : 0,
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transformBox: 'view-box',
                  transformOrigin: 'center',
                  transition: 'opacity 800ms ease-out, transform 800ms ease-out',
                }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={layer.radius}
                  fill="none"
                  stroke={stroke}
                  strokeOpacity={layerIndex % 2 === 0 ? 0.24 : 0.16}
                  strokeWidth="0.55"
                />

                {layer.shapes.map((shape, shapeIndex) => {
                  const shapeKey = `${layerIndex}-${shapeIndex}`;
                  const shapeOpacity = layerIndex % 2 === 0 ? 0.95 : 0.82;
                  const strokeWidth = layerIndex < 2 ? 1.05 : 0.8;

                  if (shape.kind === 'circle') {
                    return (
                      <circle
                        key={shapeKey}
                        cx={shape.cx}
                        cy={shape.cy}
                        r={shape.r}
                        fill={palette.legacy.greenElectric}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        opacity={shapeOpacity}
                      />
                    );
                  }

                  return (
                    <polygon
                      key={shapeKey}
                      points={shape.points}
                      fill="rgba(0, 0, 0, 0)"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      opacity={shapeOpacity}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        <div
          className="font-mono text-xs uppercase text-[var(--accent-green)]"
          style={{
            fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace',
            letterSpacing: '0.32em',
          }}
        >
          {Math.round(displayProgress * STEPS)}/{STEPS}
        </div>
      </div>
    </div>
  );
}
