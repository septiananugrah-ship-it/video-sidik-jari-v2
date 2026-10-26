import React from 'react';
import {mix, pathOf, rand, sample, smoothPath} from '../anim';
import {C, FONT} from '../theme';
import {DrawPath, Label} from './primitives';

/* ------------------------------------------------------------------ */
/* Sidik jari: cincin-cincin bergelombang yang tergambar progresif.     */
/* ------------------------------------------------------------------ */
const FP_RINGS = Array.from({length: 17}, (_, i) => {
  const r = 18 + i * 15;
  const pts: [number, number][] = [];
  const gapStart = rand(i * 3.3) * Math.PI * 2;
  const gapLen = i < 3 ? 0.4 : 0.35 + rand(i * 7.1) * 0.9;
  const steps = 120;
  for (let k = 0; k <= steps; k++) {
    const a = gapStart + gapLen + ((Math.PI * 2 - gapLen) * k) / steps;
    const wobble = 1 + 0.06 * Math.sin(a * 3 + i * 0.7) + 0.035 * Math.sin(a * 7 + i * 1.9);
    const rr = r * wobble;
    pts.push([Math.cos(a) * rr * 0.78, Math.sin(a) * rr * 1.0 - (i > 9 ? (i - 9) * 2.4 : 0)]);
  }
  return smoothPath(pts);
});

export const Fingerprint: React.FC<{
  x: number;
  y: number;
  scale?: number;
  p: number;
  color?: string;
  opacity?: number;
  width?: number;
  glow?: boolean;
  rotate?: number;
}> = ({x, y, scale = 1, p, color = C.gold, opacity = 1, width = 3, glow = true, rotate = -12}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
    {FP_RINGS.map((d, i) => {
      const local = Math.max(0, Math.min(1, p * 1.6 - (i / FP_RINGS.length) * 0.6));
      return <DrawPath key={i} d={d} p={local} stroke={color} width={width / scale} glow={glow && i % 3 === 0} opacity={0.55 + 0.45 * (1 - i / FP_RINGS.length)} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ */
/* Lembar plastik 3D (HTML + CSS 3D).                                  */
/* ------------------------------------------------------------------ */
export const Sheet: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  t: number;
  tint: string;
  rotY?: number;
  rotX?: number;
  opacity?: number;
  scale?: number;
  seed?: number;
}> = ({x, y, w = 380, h = 470, t, tint, rotY = 0, rotX = 0, opacity = 1, scale = 1, seed = 0}) => {
  const sheen = ((t * 0.18 + seed * 0.37) % 1.6) - 0.3;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        perspective: 1400,
        opacity,
        scale: String(scale),
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 22,
          transform: `rotateY(${rotY + 9 * Math.sin(t * 0.45 + seed)}deg) rotateX(${rotX + 5 * Math.sin(t * 0.33 + seed * 2)}deg) rotateZ(${2 * Math.sin(t * 0.27 + seed)}deg)`,
          background: `linear-gradient(150deg, ${tint}40 0%, rgba(255,255,255,0.07) 38%, ${tint}22 70%, rgba(255,255,255,0.12) 100%)`,
          border: '1.5px solid rgba(255,255,255,0.38)',
          boxShadow: `0 40px 90px rgba(0,0,0,0.55), inset 0 0 60px ${tint}22, 0 0 50px ${tint}22`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, transparent ${(sheen - 0.15) * 100}%, rgba(255,255,255,0.32) ${sheen * 100}%, transparent ${(sheen + 0.12) * 100}%)`,
          }}
        />
        <div style={{position: 'absolute', left: 18, top: 18, right: 18, bottom: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)'}} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Spektrum IR skematis (absorbansi, puncak ke atas).                  */
/* ------------------------------------------------------------------ */
export type Peak = [center: number, height: number, width: number];

export const absorbance = (peaks: Peak[], nu: number) =>
  peaks.reduce((s, [c, h, w]) => s + h / (1 + ((nu - c) / w) ** 2) * 0.55 + h * Math.exp(-(((nu - c) / w) ** 2) * 0.7) * 0.45, 0);

export const PE_PEAKS: Peak[] = [
  [2915, 1.0, 22],
  [2848, 0.82, 16],
  [1472, 0.42, 8],
  [1462, 0.36, 8],
  [730, 0.28, 5],
  [719, 0.34, 5],
];

export const PET_PEAKS: Peak[] = [
  [3430, 0.05, 120],
  [2965, 0.06, 30],
  [1715, 1.0, 14],
  [1505, 0.08, 6],
  [1410, 0.22, 8],
  [1340, 0.2, 8],
  [1240, 0.92, 20],
  [1095, 0.72, 14],
  [1018, 0.32, 8],
  [872, 0.18, 6],
  [725, 0.55, 9],
];

export const GENERIC_PEAKS: Peak[] = [
  [3350, 0.42, 160],
  [2960, 0.52, 22],
  [2875, 0.3, 18],
  [1715, 0.95, 14],
  [1460, 0.38, 12],
  [1375, 0.3, 9],
  [1280, 0.42, 14],
  [1170, 0.55, 16],
  [1050, 0.36, 12],
  [960, 0.22, 8],
  [880, 0.26, 7],
  [760, 0.3, 9],
  [620, 0.18, 8],
];

export type PlotBox = {x: number; y: number; w: number; h: number; nuMax?: number; nuMin?: number};

export const nuToX = (box: PlotBox, nu: number) => {
  const max = box.nuMax ?? 4000;
  const min = box.nuMin ?? 400;
  return box.x + ((max - nu) / (max - min)) * box.w;
};

export const spectrumPath = (box: PlotBox, peaks: Peak[], scaleY = 0.88, n = 700) => {
  const max = box.nuMax ?? 4000;
  const min = box.nuMin ?? 400;
  const pts = sample((nu) => absorbance(peaks, nu), max, min, n).map(
    ([nu, a]) => [nuToX(box, nu), box.y + box.h - Math.min(1.08, a) * box.h * scaleY] as [number, number],
  );
  return pathOf(pts);
};

export const SpectrumAxes: React.FC<{
  box: PlotBox;
  p: number;
  ticks?: number[];
  label?: string;
  yLabel?: string;
  color?: string;
}> = ({box, p, ticks = [4000, 3000, 2000, 1500, 1000, 500], label = 'bilangan gelombang (cm⁻¹)', yLabel = 'serapan', color = C.muted}) => {
  if (p <= 0) return null;
  const {x, y, w, h} = box;
  return (
    <g opacity={p}>
      <line x1={x} y1={y + h} x2={x + w * p} y2={y + h} stroke={color} strokeWidth={2} />
      <line x1={x} y1={y + h} x2={x} y2={y + h - h * p} stroke={color} strokeWidth={2} />
      {ticks.map((nu) => {
        const tx = nuToX(box, nu);
        if (tx > x + w * p + 1) return null;
        return (
          <g key={nu}>
            <line x1={tx} y1={y + h} x2={tx} y2={y + h + 10} stroke={color} strokeWidth={2} />
            <Label x={tx} y={y + h + 30} size={20} color={color} font="mono">
              {nu}
            </Label>
          </g>
        );
      })}
      {label ? (
        <Label x={x + w / 2} y={y + h + 64} size={22} color={color}>
          {label}
        </Label>
      ) : null}
      {yLabel ? (
        <text
          x={x - 22}
          y={y + h / 2}
          transform={`rotate(-90 ${x - 22} ${y + h / 2})`}
          textAnchor="middle"
          fontFamily={FONT.sans}
          fontSize={22}
          fill={color}
        >
          {yLabel}
        </text>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Foton: paket gelombang sinus dengan selubung Gauss.                 */
/* ------------------------------------------------------------------ */
export const PhotonPacket: React.FC<{
  x: number;
  y: number;
  wavelength: number;
  color: string;
  amp?: number;
  len?: number;
  opacity?: number;
  phase?: number;
  angle?: number;
}> = ({x, y, wavelength, color, amp = 28, len = 300, opacity = 1, phase = 0, angle = 0}) => {
  if (opacity <= 0) return null;
  const pts = sample(
    (u) => amp * Math.exp(-((u / (len * 0.32)) ** 2)) * Math.sin((2 * Math.PI * u) / wavelength + phase),
    -len / 2,
    len / 2,
    160,
  );
  const d = smoothPath(pts);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={10} opacity={0.25} filter="url(#glow-strong)" />
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={1.3} opacity={0.7} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Osilator harmonik kuantum.                                          */
/* ------------------------------------------------------------------ */
const FACT = [1, 1, 2, 6, 24, 120];
export const hermite = (n: number, x: number) => {
  switch (n) {
    case 0:
      return 1;
    case 1:
      return 2 * x;
    case 2:
      return 4 * x * x - 2;
    case 3:
      return 8 * x ** 3 - 12 * x;
    case 4:
      return 16 * x ** 4 - 48 * x * x + 12;
    default:
      return 32 * x ** 5 - 160 * x ** 3 + 120 * x;
  }
};
export const psi = (n: number, x: number) => hermite(n, x) * Math.exp(-(x * x) / 2) / Math.sqrt(2 ** n * FACT[n] * Math.sqrt(Math.PI));

/** Sistem koordinat sumur: xi (satuan tak berdimensi) dan energi (satuan hν). */
export type Well = {cx: number; base: number; sx: number; sy: number};
export const wellX = (w: Well, xi: number) => w.cx + xi * w.sx;
export const wellY = (w: Well, e: number) => w.base - e * w.sy;

export const parabolaPath = (w: Well, eMax: number) => {
  const xm = Math.sqrt(2 * eMax);
  return smoothPath(sample((xi) => 0.5 * xi * xi, -xm, xm, 80).map(([xi, e]) => [wellX(w, xi), wellY(w, e)]));
};

export const psiPath = (w: Well, n: number, amp: number, squared = 0) => {
  const range = Math.sqrt(2 * (n + 0.5)) + 1.1;
  return smoothPath(
    sample((xi) => mix(psi(n, xi), psi(n, xi) ** 2 * 1.6, squared), -range, range, 140).map(([xi, v]) => [
      wellX(w, xi),
      wellY(w, n + 0.5) - v * amp,
    ]),
  );
};

/** Sampel acak dari |ψ_n|² (rejection sampling deterministik). */
export const samplePsi2 = (n: number, seed: number) => {
  for (let k = 0; k < 40; k++) {
    const xi = (rand(seed * 1.17 + k * 3.31) - 0.5) * 8;
    const u = rand(seed * 2.71 + k * 5.13) * 0.62;
    if (psi(n, xi) ** 2 > u) return xi;
  }
  return 0;
};
