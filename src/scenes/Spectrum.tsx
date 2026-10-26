import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Easing} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Atom, Bond, Card, DrawPath, Label, Spark, Spring, Stage, V} from '../components/primitives';
import {absorbance, Fingerprint, GENERIC_PEAKS, nuToX, spectrumPath, SpectrumAxes, type PlotBox} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOX: PlotBox = {x: 260, y: 250, w: 1400, h: 420};
const PANEL_Y = 822; // baris molekul mini di bawah grafik

const Region: React.FC<{from: number; to: number; color: string; p: number; label: string; sub?: string; labelY?: number}> = ({from, to, color, p, label, sub, labelY = 212}) => {
  if (p <= 0) return null;
  const x0 = nuToX(BOX, from);
  const x1 = nuToX(BOX, to);
  const h = BOX.h * p;
  return (
    <g opacity={p}>
      <rect x={x0} y={BOX.y + BOX.h - h} width={x1 - x0} height={h} fill={color} opacity={0.13} />
      <line x1={x0} y1={BOX.y} x2={x0} y2={BOX.y + BOX.h} stroke={color} strokeOpacity={0.5} strokeDasharray="6 8" />
      <line x1={x1} y1={BOX.y} x2={x1} y2={BOX.y + BOX.h} stroke={color} strokeOpacity={0.5} strokeDasharray="6 8" />
      <Label x={(x0 + x1) / 2} y={labelY} size={30} color={color} weight={700}>
        {label}
      </Label>
      {sub ? (
        <Label x={(x0 + x1) / 2} y={labelY + 34} size={22} color={C.muted}>
          {sub}
        </Label>
      ) : null}
    </g>
  );
};

/** Molekul mini yang memperlihatkan gerak apa yang "menghasilkan" pita di atasnya. */
const MiniStretch: React.FC<{x: number; t: number; f: number; a: string; b: string; order?: number; amp: number; p: number; label: string; color: string}> = ({x, t, f, a, b, order = 1, amp, p, label, color}) => {
  if (p <= 0.001) return null;
  const d = amp * Math.sin(2 * Math.PI * f * t);
  const x1 = x - 48;
  const x2 = x + 40 + d;
  return (
    <g opacity={p}>
      {order === 1 ? <Spring x1={x1} y1={PANEL_Y} x2={x2} y2={PANEL_Y} coils={6} amp={11} width={5} /> : <Bond x1={x1} y1={PANEL_Y} x2={x2} y2={PANEL_Y} order={order} width={9} />}
      <Atom x={x1} y={PANEL_Y} el={a} r={28} glow={0.6} />
      <Atom x={x2} y={PANEL_Y} el={b} r={b === 'H' ? 18 : 26} glow={0.6} />
      <Label x={x} y={PANEL_Y + 48} size={21} color={color} weight={600}>
        {label}
      </Label>
    </g>
  );
};

const MiniBend: React.FC<{x: number; t: number; p: number}> = ({x, t, p}) => {
  if (p <= 0.001) return null;
  const pts: [number, number][] = [0, 1, 2, 3, 4].map((i) => {
    const bx = x - 120 + i * 60;
    const by = PANEL_Y + (i % 2 ? -16 : 16) + 12 * Math.sin(2 * Math.PI * 0.8 * t + i * 1.4) + 6 * Math.sin(2 * Math.PI * 1.3 * t + i);
    return [bx + 5 * Math.sin(2 * Math.PI * 0.6 * t + i * 2), by];
  });
  return (
    <g opacity={p}>
      {pts.slice(1).map((q, i) => (
        <Bond key={i} x1={pts[i][0]} y1={pts[i][1]} x2={q[0]} y2={q[1]} width={8} />
      ))}
      {pts.map((q, i) => (
        <Atom key={i} x={q[0]} y={q[1]} el="C" r={15} label={null} glow={0.5} />
      ))}
      <Label x={x} y={PANEL_Y + 48} size={21} color={C.violet} weight={600}>
        tekuk & getaran kerangka
      </Label>
    </g>
  );
};

export const Spectrum: React.FC = () => {
  const {t, cue} = useScene();
  const axes = ramp(t, cue(0) - 0.3, cue(0) + 1.5, EASE_IN_OUT);
  const curve = ramp(t, cue(0) + 1.2, cue(1) + 1.5, EASE_IN_OUT);
  const energy = ramp(t, cue(1) + 0.3, cue(1) + 1.2);
  const xh = ramp(t, cue(2), cue(2) + 0.9, EASE_IN_OUT);
  const co = ramp(t, cue(3), cue(3) + 0.9, EASE_IN_OUT);
  const fp = ramp(t, cue(4), cue(4) + 1.1, EASE_IN_OUT);
  const pulse = ramp(t, cue(5), cue(5) + 0.6);

  const topShift = energy * (1 - ramp(t, cue(2) - 0.4, cue(2)));
  // kursor pemindai: dari 400 ke 4000 cm⁻¹ — osilator mini di bawahnya makin cepat ke kiri
  const scanP = ramp(t, cue(1) + 0.4, cue(2) - 0.6, Easing.inOut(Easing.quad));
  const scanOn = ramp(t, cue(1) + 0.1, cue(1) + 0.5) * (1 - ramp(t, cue(2) - 0.5, cue(2)));
  const scanNu = mix(500, 3900, scanP);
  // fase osilator = integral frekuensi (agar kecepatan berubah mulus tanpa lompatan)
  const scanPhase = (() => {
    const a = cue(1) + 0.4;
    const b = cue(2) - 0.6;
    const fOf = (nu: number) => nu / 1100; // Hz visual
    if (t <= a) return 2 * Math.PI * fOf(500) * t;
    const n = 60;
    let acc = 2 * Math.PI * fOf(500) * a;
    const tt = Math.min(t, b);
    for (let i = 0; i < n; i++) {
      const u0 = a + ((tt - a) * i) / n;
      const nu = mix(500, 3900, Easing.inOut(Easing.quad)(Math.min(1, (u0 - a) / (b - a))));
      acc += 2 * Math.PI * fOf(nu) * ((tt - a) / n);
    }
    if (t > b) acc += 2 * Math.PI * fOf(3900) * (t - b);
    return acc;
  })();
  const scanX = nuToX(BOX, scanNu);
  const scanD = 14 * Math.sin(scanPhase);
  const peakY = (nu: number) => BOX.y + BOX.h - Math.min(1.08, absorbance(GENERIC_PEAKS, nu)) * BOX.h * 0.88;

  return (
    <AbsoluteFill>
      <Stage>
        <SpectrumAxes box={BOX} p={axes} ticks={[4000, 3500, 3000, 2500, 2000, 1500, 1000, 500]} />
        <Region from={3700} to={2700} color={C.cyan} p={xh} label="X–H" sub="O–H, C–H" />
        <Region from={1820} to={1640} color={C.gold} p={co} label="C=O" sub="karbonil" labelY={168} />
        <Region from={1500} to={400} color={C.violet} p={fp} label="wilayah sidik jari" sub="< 1500 cm⁻¹" />
        <g opacity={fp * 0.5}>
          <clipPath id="fpclip">
            <rect x={nuToX(BOX, 1500)} y={BOX.y} width={nuToX(BOX, 400) - nuToX(BOX, 1500)} height={BOX.h} />
          </clipPath>
          <g clipPath="url(#fpclip)">
            <Fingerprint x={nuToX(BOX, 950)} y={BOX.y + BOX.h * 0.55} scale={1.1} p={fp} color={C.violet} width={2} glow={false} opacity={0.5} />
          </g>
        </g>
        <DrawPath d={spectrumPath(BOX, GENERIC_PEAKS)} p={curve} stroke={C.ink} width={4} len={6000} />
        <g opacity={co}>
          <circle cx={nuToX(BOX, 1715)} cy={peakY(1715)} r={14 + 4 * Math.sin(t * 6)} fill="none" stroke={C.gold} strokeWidth={4} filter="url(#glow)" />
        </g>
        <g opacity={pulse}>
          {[1460, 1280, 1170, 1050, 880, 760].map((nu, i) => (
            <circle key={nu} cx={nuToX(BOX, nu)} cy={peakY(nu)} r={9} fill={C.violet} opacity={0.5 + 0.5 * Math.sin(t * 5 + i)} filter="url(#glow)" />
          ))}
        </g>
        {/* kursor pemindai + osilator yang kecepatannya mengikuti bilangan gelombang */}
        {scanOn > 0.001 ? (
          <g opacity={scanOn}>
            <rect x={scanX - 22} y={BOX.y} width={44} height={BOX.h} fill={C.gold} opacity={0.07} />
            <line x1={scanX} y1={BOX.y - 6} x2={scanX} y2={BOX.y + BOX.h + 6} stroke={C.gold} strokeWidth={2.5} strokeDasharray="6 6" />
            <Spark x={scanX} y={BOX.y + BOX.h - Math.min(1.08, absorbance(GENERIC_PEAKS, scanNu)) * BOX.h * 0.88} r={9} color={C.gold} />
            <Spring x1={scanX - 50} y1={PANEL_Y} x2={scanX + 38 + scanD} y2={PANEL_Y} coils={6} amp={9} width={4} />
            <Atom x={scanX - 50} y={PANEL_Y} el="C" r={22} glow={0.6} />
            <Atom x={scanX + 38 + scanD} y={PANEL_Y} el="H" r={15} glow={0.6} />
            <Label x={scanX} y={PANEL_Y + 48} size={22} color={C.gold} weight={700} font="mono">
              {`${Math.round(scanNu / 10) * 10} cm⁻¹ · ${scanNu > 2500 ? 'cepat' : scanNu > 1300 ? 'sedang' : 'lambat'}`}
            </Label>
          </g>
        ) : null}
        {/* apa yang bergetar di tiap wilayah */}
        <MiniStretch x={nuToX(BOX, 3150)} t={t} f={3.2} a="C" b="H" amp={12} p={xh} label="regangan C–H · tercepat" color={C.cyan} />
        <MiniStretch x={nuToX(BOX, 1730)} t={t} f={1.8} a="C" b="O" order={2} amp={9} p={co} label="regangan C=O" color={C.gold} />
        <MiniBend x={nuToX(BOX, 900)} t={t} p={fp} />
        {/* energi */}
        <g opacity={topShift}>
          <Arrow x1={1200} y1={215} x2={420} y2={215} color="gold" width={5} />
          <Label x={810} y={180} size={28} color={C.gold} weight={600}>
            energi lebih tinggi · getaran lebih cepat
          </Label>
        </g>
      </Stage>
      <Card x={1650} y={168} opacity={topShift} accent={C.gold} anchor="right">
        <div style={{fontSize: 40}}>
          <V color={C.gold}>ν̃</V> = 1/<V>λ</V> ∝ <V>E</V>
        </div>
      </Card>
      <Card x={nuToX(BOX, 950)} y={140} opacity={pulse} scale={0.85 + 0.15 * ramp(t, cue(5), cue(5) + 0.6, BACK)} accent={C.violet}>
        <div style={{fontSize: 26}}>
          pola <span style={{color: C.violet, fontWeight: 600}}>khas</span> tiap senyawa
        </div>
      </Card>
    </AbsoluteFill>
  );
};
