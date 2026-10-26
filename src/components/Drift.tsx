import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, H, W} from '../theme';

const rnd = (k: number) => {
  const s = Math.sin(k * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const P = Array.from({length: 64}, (_, i) => ({
  x: rnd(i + 0.1) * W,
  y: rnd(i + 0.7) * H,
  r: 1.2 + rnd(i + 1.3) ** 2 * 3.2,
  v: 6 + rnd(i + 2.9) * 18, // kecepatan naik (px/detik)
  sw: 10 + rnd(i + 4.1) * 30, // ayunan ke samping (px)
  f: 0.08 + rnd(i + 5.3) * 0.25,
  ph: rnd(i + 6.7) * Math.PI * 2,
  col: rnd(i + 8.2) < 0.55 ? C.gold : rnd(i + 9.1) < 0.6 ? C.cyan : C.violet,
}));

/** Partikel cahaya yang melayang naik pelan di seluruh film (berkelip, berayun) — gerak hidup di setiap adegan. */
export const Drift: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {P.map((p, i) => {
          const y = ((((p.y - t * p.v) % (H + 80)) + H + 80) % (H + 80)) - 40;
          const x = p.x + p.sw * Math.sin(t * p.f * 2 * Math.PI + p.ph);
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.8 + p.f * 4) + p.ph * 3));
          const edge = Math.max(0, Math.min(1, (y + 40) / 160, (H + 40 - y) / 160));
          return (
            <g key={i} opacity={edge * tw * 0.55}>
              <circle cx={x} cy={y} r={p.r * 3.2} fill={p.col} opacity={0.12} />
              <circle cx={x} cy={y} r={p.r} fill={p.col} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
