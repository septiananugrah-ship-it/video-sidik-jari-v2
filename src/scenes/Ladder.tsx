import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Card, Glow, Label, Spark, Stage, V} from '../components/primitives';
import {parabolaPath, type Well, wellX, wellY} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

export const WELL: Well = {cx: 960, base: 800, sx: 150, sy: 105};
export const LEVEL_COLORS = [C.gold, C.cyan, C.violet, C.mint, C.pink];

/** Tingkat energi v pada sumur. */
export const LevelLine: React.FC<{w: Well; v: number; p: number; color: string; glow?: number; label?: boolean; labelX?: number}> = ({w, v, p, color, glow = 0, label = true, labelX}) => {
  if (p <= 0) return null;
  const e = v + 0.5;
  const half = Math.sqrt(2 * e);
  const x0 = wellX(w, -half);
  const x1 = wellX(w, half);
  const y = wellY(w, e);
  const xm = (x0 + x1) / 2;
  return (
    <g opacity={p}>
      {glow > 0 ? <line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={18} strokeOpacity={0.25 * glow} strokeLinecap="round" /> : null}
      <line x1={mix(xm, x0, p)} y1={y} x2={mix(xm, x1, p)} y2={y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      {label ? (
        <Label x={labelX ?? x0 - 26} y={y} size={28} color={color} anchor="end" font="serif" italic>
          v = {v}
        </Label>
      ) : null}
    </g>
  );
};

export const Ladder: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const split = win(t, cue(0) - 0.3, cue(5) - 0.6, 0.8, 0.7);
  const divider = ramp(t, cue(0), cue(0) + 1.2, EASE_IN_OUT);
  const classic = ramp(t, cue(1), cue(1) + 0.8);
  const schro = ramp(t, cue(3) + 0.2, cue(3) + 1, BACK);
  const stairs = ramp(t, cue(4), cue(4) + 1);

  // klasik: bola meluncur mulus
  const cp = 0.5 + 0.42 * Math.sin(2 * Math.PI * 0.22 * (t - cue(1)));
  const ramp0 = {x: 170, y: 760};
  const ramp1 = {x: 790, y: 340};
  const bx = mix(ramp0.x, ramp1.x, cp);
  const by = mix(ramp0.y, ramp1.y, cp) - 26;

  // kuantum: bola melompat antar anak tangga
  const N = 5;
  const stepW = 130;
  const stepH = 84;
  const sx0 = 1090;
  const sy0 = 760;
  const qt = Math.max(0, t - cue(4) - 0.6);
  const seq = [0, 1, 2, 3, 4, 3, 2, 1];
  const idx = Math.floor(qt / 0.9) % seq.length;
  const from = seq[idx];
  const to = seq[(idx + 1) % seq.length];
  const hp = ramp(qt % 0.9, 0.55, 0.85, EASE_IN_OUT);
  const qx = mix(sx0 + from * stepW + stepW / 2, sx0 + to * stepW + stepW / 2, hp);
  const qy = mix(sy0 - from * stepH, sy0 - to * stepH, hp) - 26 - Math.sin(hp * Math.PI) * 50;

  // fase sumur kuantum
  const well = ramp(t, cue(5) - 0.6, cue(5) + 0.8, EASE_IN_OUT);
  const levelTimes = [wordOf(5, 'nol'), wordOf(5, 'satu'), wordOf(5, 'dua'), wordOf(5, 'tiga'), wordOf(5, 'seterusnya')];
  const brackets = ramp(t, cue(6) + 0.4, cue(6) + 1.6);
  const formula = ramp(t, cue(7), cue(7) + 0.8, BACK);
  const pulse = ramp(t, cue(8), cue(8) + 0.4) * (0.5 + 0.5 * Math.sin((t - cue(8)) * 6));

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== Layar terbelah ===== */}
        <g opacity={split}>
          <line x1={960} y1={200} x2={960} y2={mix(200, 820, divider)} stroke={C.faint} strokeWidth={2} />
          <Label x={480} y={210} size={30} color={C.muted} weight={600} spacing={6} opacity={divider}>
            KLASIK
          </Label>
          <Label x={1440} y={210} size={30} color={C.violet} weight={600} spacing={6} opacity={divider}>
            KUANTUM
          </Label>
          {/* tanjakan */}
          <g opacity={classic}>
            <path d={`M${ramp0.x},${ramp0.y} L${ramp1.x},${ramp1.y} L${ramp1.x},${ramp0.y} Z`} fill={C.cyan} opacity={0.08} />
            <line x1={ramp0.x} y1={ramp0.y} x2={ramp1.x} y2={ramp1.y} stroke={C.cyan} strokeWidth={5} filter="url(#glow)" />
            <Glow x={bx} y={by} r={60} color="gold" opacity={0.6} />
            <Spark x={bx} y={by} r={20} color={C.gold} />
            <rect x={870} y={340} width={20} height={420} rx={10} fill="#1a2140" />
            <rect x={870} y={760 - 420 * cp} width={20} height={420 * cp} rx={10} fill={C.cyan} />
            <Label x={880} y={790} size={22} color={C.muted} font="serif" italic>
              E
            </Label>
          </g>
          {/* tangga */}
          <g opacity={stairs}>
            {Array.from({length: N}, (_, i) => (
              <g key={i}>
                <rect x={sx0 + i * stepW} y={sy0 - i * stepH} width={stepW} height={(i + 1) * stepH - stepH + 6} fill={C.violet} opacity={0.1} />
                <line x1={sx0 + i * stepW} y1={sy0 - i * stepH} x2={sx0 + (i + 1) * stepW} y2={sy0 - i * stepH} stroke={C.violet} strokeWidth={5} filter="url(#glow)" />
                {i < N - 1 ? <line x1={sx0 + (i + 1) * stepW} y1={sy0 - i * stepH} x2={sx0 + (i + 1) * stepW} y2={sy0 - (i + 1) * stepH} stroke={C.violet} strokeWidth={3} opacity={0.6} /> : null}
              </g>
            ))}
            <Glow x={qx} y={qy} r={60} color="gold" opacity={0.6} />
            <Spark x={qx} y={qy} r={20} color={C.gold} />
            <rect x={1830} y={340} width={20} height={420} rx={10} fill="#1a2140" />
            {Array.from({length: N}, (_, i) => (
              <rect key={i} x={1830} y={760 - (i + 1) * 84 + 4} width={20} height={76} rx={6} fill={C.violet} opacity={Math.max(0, Math.min(1, mix(from, to, hp) + 1 - i))} />
            ))}
          </g>
        </g>

        {/* ===== Sumur dengan tingkat energi ===== */}
        <g opacity={well}>
          <path d={parabolaPath(WELL, 5.3)} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={4} />
          {levelTimes.map((lt, v) => (
            <LevelLine key={v} w={WELL} v={v} p={ramp(t, lt - 0.1, lt + 0.5)} color={LEVEL_COLORS[v]} glow={pulse} />
          ))}
          {[0, 1, 2, 3].map((v) => {
            const x = wellX(WELL, Math.sqrt(2 * (v + 1.5))) + 50;
            const y0 = wellY(WELL, v + 0.5);
            const y1 = wellY(WELL, v + 1.5);
            const p = ramp(t, cue(6) + 0.4 + v * 0.25, cue(6) + 0.9 + v * 0.25);
            return (
              <g key={v} opacity={p * brackets}>
                <line x1={x} y1={y0 - 4} x2={x} y2={y1 + 4} stroke={C.ink} strokeWidth={2.5} />
                <line x1={x - 8} y1={y0 - 4} x2={x + 8} y2={y0 - 4} stroke={C.ink} strokeWidth={2.5} />
                <line x1={x - 8} y1={y1 + 4} x2={x + 8} y2={y1 + 4} stroke={C.ink} strokeWidth={2.5} />
                <Label x={x + 18} y={(y0 + y1) / 2} size={28} anchor="start" font="serif" italic color={C.ink}>
                  hν
                </Label>
              </g>
            );
          })}
        </g>
      </Stage>

      <Card x={1440} y={360} opacity={split * schro} scale={0.8 + 0.2 * schro} accent={C.violet}>
        <div style={{fontSize: 58}}>
          <V>Ĥ</V>
          <V color={C.violet}>ψ</V> = <V color={C.gold}>E</V>
          <V color={C.violet}>ψ</V>
        </div>
        <div style={{fontSize: 22, color: C.muted, textAlign: 'center'}}>persamaan Schrödinger</div>
      </Card>

      <Card x={1700} y={250} opacity={well * formula} scale={0.85 + 0.15 * formula} accent={C.gold} anchor="right">
        <div style={{fontSize: 52}}>
          <V color={C.gold}>E</V>
          <sub style={{fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 30}}>v</sub> = (<V>v</V> + ½) <V>h</V>
          <V color={C.cyan}>ν</V>
        </div>
      </Card>
      <Card x={96} y={215} opacity={well * ramp(t, cue(8), cue(8) + 0.6, BACK)} accent={C.violet} anchor="left">
        <div style={{fontSize: 34, fontWeight: 600, color: C.violet}}>kuantisasi energi</div>
        <div style={{fontSize: 22, color: C.muted}}>energi hanya bernilai diskret</div>
      </Card>
    </AbsoluteFill>
  );
};
