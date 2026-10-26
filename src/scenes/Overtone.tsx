import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, sample, smoothPath, win} from '../anim';
import {Arrow, Card, DrawPath, Label, Stage, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Sumur energi: harmonik (tangga sama rata) berubah menjadi Morse (tangga makin rapat).
const DE = 4.2; // energi disosiasi (satuan hν)
const XE = 1 / (4 * DE); // konstanta anharmonisitas
const A = 0.92;
const R0 = 1.7;
const O = {x: 170, y: 770};
const SX = 760 / 5.2;
const SY = 92;
const px = (r: number) => O.x + (r - 0.8) * SX;
const py = (e: number) => O.y - e * SY;
const morse = (r: number) => DE * (1 - Math.exp(-A * (r - R0))) ** 2;
const harm = (r: number) => DE * A * A * (r - R0) ** 2;
const levelE = (v: number, p: number) => mix(v + 0.5, v + 0.5 - XE * (v + 0.5) ** 2, p);
const COLORS = [C.gold, C.cyan, C.violet, C.mint, C.pink];

/** Titik balik kiri/kanan pada energi e untuk kurva campuran. */
const turning = (e: number, p: number): [number, number] => {
  const f = (r: number) => mix(harm(r), morse(r), p) - e;
  const solve = (lo: number, hi: number) => {
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2;
      if (Math.sign(f(m)) === Math.sign(f(lo))) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };
  return [solve(0.8, R0), solve(R0, 6)];
};

// Spektrum mini (bilangan gelombang 2000–9500 cm⁻¹)
const SP = {x: 1080, y: 330, w: 680, h: 300};
const nx = (nu: number) => SP.x + ((nu - 2000) / 7500) * SP.w;
const PEAKS: [number, number, number][] = [
  [2886, 1, 40],
  [5668, 0.2, 40],
  [8347, 0.08, 40],
];

export const Overtone: React.FC = () => {
  const {t, cue} = useScene();
  const intro = ramp(t, -0.3, 0.8);
  const morph = ramp(t, cue(1) + 0.3, cue(1) + 2.2, EASE_IN_OUT);
  const gaps = win(t, cue(1) + 2, cue(2) + 0.2, 0.5, 0.5);
  const arrows = [ramp(t, cue(2) - 0.2, cue(2) + 0.5), ramp(t, cue(2) + 1.2, cue(2) + 1.9), ramp(t, cue(2) + 2.4, cue(2) + 3.1)];
  const spec = win(t, cue(2) + 0.2, cue(4) - 0.3, 0.6, 0.6);
  const multiples = ramp(t, cue(3) + 1.2, cue(3) + 2);
  const boltz = ramp(t, cue(4) + 0.2, cue(4) + 1);
  const fund = ramp(t, cue(6), cue(6) + 0.6);

  const curve = smoothPath(
    sample((r) => mix(harm(r), morse(r), morph), 0.95, 6, 200)
      .filter(([, e]) => e <= 5.2)
      .map(([r, e]) => [px(r), py(e)]),
  );

  const y0 = py(levelE(0, morph));
  const arrowX = [px(R0) - 40, px(R0) + 10, px(R0) + 60];
  const labels = ['fundamental', 'overtone 1', 'overtone 2'];

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={intro}>
          <line x1={O.x} y1={O.y} x2={O.x + 780} y2={O.y} stroke={C.faint} strokeWidth={2} />
          <path d={curve} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={4} />
          <line x1={px(2.6)} y1={py(DE)} x2={px(6)} y2={py(DE)} stroke={C.muted} strokeWidth={2} strokeDasharray="8 8" opacity={morph} />
          {[0, 1, 2, 3, 4].map((v) => {
            const e = levelE(v, morph);
            const [r1, r2] = turning(e, morph);
            const fundGlow = v <= 1 ? fund : 0;
            return (
              <g key={v}>
                {fundGlow > 0 ? <line x1={px(r1)} y1={py(e)} x2={px(r2)} y2={py(e)} stroke={COLORS[v]} strokeWidth={16} strokeOpacity={0.25 * fundGlow} /> : null}
                <line x1={px(r1)} y1={py(e)} x2={px(r2)} y2={py(e)} stroke={COLORS[v]} strokeWidth={4} strokeLinecap="round" />
                <Label x={px(r1) - 18} y={py(e)} size={24} color={COLORS[v]} anchor="end" font="serif" italic>
                  v = {v}
                </Label>
              </g>
            );
          })}
          {/* jarak antartingkat makin kecil */}
          <g opacity={gaps}>
            {[0, 1, 2, 3].map((v) => {
              const ya = py(levelE(v, morph));
              const yb = py(levelE(v + 1, morph));
              const x = px(turning(levelE(v + 1, morph), morph)[1]) + 30;
              return (
                <g key={v}>
                  <line x1={x} y1={ya - 3} x2={x} y2={yb + 3} stroke={C.gold} strokeWidth={3} />
                  <line x1={x - 7} y1={ya - 3} x2={x + 7} y2={ya - 3} stroke={C.gold} strokeWidth={3} />
                  <line x1={x - 7} y1={yb + 3} x2={x + 7} y2={yb + 3} stroke={C.gold} strokeWidth={3} />
                </g>
              );
            })}
            <Label x={px(4.2)} y={py(2.2)} size={26} color={C.gold} weight={600}>
              makin rapat ↑
            </Label>
          </g>
          {/* lompatan dari v = 0 */}
          {arrows.map((p, i) => (
            <g key={i} opacity={p * (1 - boltz * (i ? 0.6 : 0))}>
              <Arrow
                x1={arrowX[i]}
                y1={y0 - 4}
                x2={arrowX[i]}
                y2={mix(y0, py(levelE(i + 1, morph)) + 10, p)}
                color={(['gold', 'cyan', 'violet'] as const)[i]}
                width={[7, 4, 2.5][i]}
                dash={i === 2 ? '6 6' : undefined}
              />
            </g>
          ))}
          {/* molekul berkumpul di v = 0 (Boltzmann) */}
          <g opacity={boltz}>
            {Array.from({length: 46}, (_, k) => {
              const [r1, r2] = turning(levelE(0, morph), morph);
              const x = px(mix(r1 + 0.08, r2 - 0.08, rand(k * 3.1))) + Math.sin(t * 3 + k) * 4;
              return <circle key={k} cx={x} cy={y0 - 9 - (k % 3) * 9} r={5} fill={C.gold} opacity={0.9} />;
            })}
            <Label x={px(R0)} y={y0 + 34} size={22} color={C.gold} weight={600}>
              hampir semua molekul
            </Label>
          </g>
        </g>

        {/* spektrum fundamental & overtone */}
        <g opacity={spec}>
          <line x1={SP.x} y1={SP.y + SP.h} x2={SP.x + SP.w} y2={SP.y + SP.h} stroke={C.muted} strokeWidth={2} />
          {[3000, 5000, 7000, 9000].map((nu) => (
            <Label key={nu} x={nx(nu)} y={SP.y + SP.h + 28} size={20} color={C.muted} font="mono">
              {nu}
            </Label>
          ))}
          <Label x={SP.x + SP.w / 2} y={SP.y + SP.h + 62} size={22} color={C.muted}>
            bilangan gelombang H–Cl (cm⁻¹)
          </Label>
          <DrawPath
            d={smoothPath(
              sample((nu) => PEAKS.reduce((a, [c, h, w]) => a + h * Math.exp(-(((nu - c) / w) ** 2)), 0), 2000, 9500, 500).map(([nu, a]) => [nx(nu), SP.y + SP.h - a * SP.h * 0.9]),
            )}
            p={ramp(t, cue(2) + 0.2, cue(3) + 0.6, EASE_IN_OUT)}
            stroke={C.ink}
            width={3.5}
            len={3000}
          />
          {PEAKS.map(([c, h], i) => (
            <g key={i} opacity={arrows[i]}>
              <circle cx={nx(c)} cy={SP.y + SP.h - h * SP.h * 0.9} r={11} fill="none" stroke={COLORS[i]} strokeWidth={3} />
              <Label x={nx(c)} y={SP.y + SP.h - h * SP.h * 0.9 - 34} size={22} color={COLORS[i]} weight={600}>
                {labels[i]}
              </Label>
              <Label x={nx(c)} y={SP.y + SP.h - h * SP.h * 0.9 - 62} size={20} color={C.muted} font="mono">
                {c}
              </Label>
            </g>
          ))}
          <g opacity={multiples}>
            {[2, 3].map((m) => (
              <g key={m}>
                <line x1={nx(2886 * m)} y1={SP.y + 40} x2={nx(2886 * m)} y2={SP.y + SP.h} stroke={C.muted} strokeWidth={2} strokeDasharray="6 8" />
                <Label x={nx(2886 * m) + 8} y={SP.y + 26} size={20} color={C.muted} font="mono" anchor="start">
                  {m}× = {2886 * m}
                </Label>
              </g>
            ))}
          </g>
        </g>
      </Stage>

      {/* Boltzmann */}
      <Card x={1420} y={330} opacity={boltz} scale={0.9 + 0.1 * boltz} accent={C.gold}>
        <div style={{fontSize: 28, color: C.muted, textAlign: 'center'}}>distribusi Boltzmann</div>
        <div style={{fontSize: 46, textAlign: 'center', marginTop: 4}}>
          <V>N</V>
          <sub style={{fontSize: 24}}>1</sub>/<V>N</V>
          <sub style={{fontSize: 24}}>0</sub> = <V>e</V>
          <sup style={{fontSize: 26}}>
            −<V>hν</V>/<V>kT</V>
          </sup>
        </div>
      </Card>
      <div
        style={{
          position: 'absolute',
          left: 1420,
          top: 560,
          transform: 'translate(-50%, -50%)',
          opacity: ramp(t, cue(5) + 1.2, cue(5) + 2) * boltz,
          fontFamily: FONT.mono,
          fontSize: 28,
          color: C.ink,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 560,
        }}
      >
        <Bar label="kT (25 °C)" value="≈ 207 cm⁻¹" frac={207 / 2886} color={C.cyan} p={ramp(t, cue(5) + 1.5, cue(5) + 2.4)} />
        <Bar label="hν H–Cl" value="2886 cm⁻¹" frac={1} color={C.gold} p={ramp(t, cue(5) + 2.4, cue(5) + 3.3)} />
        <div style={{fontFamily: FONT.sans, fontSize: 28, color: C.gold, opacity: ramp(t, cue(5) + 4, cue(5) + 4.8), textAlign: 'center'}}>
          hanya ±1 dari sejuta molekul di v = 1
        </div>
      </div>
      <Card x={1420} y={770} opacity={fund} scale={0.85 + 0.15 * ramp(t, cue(6), cue(6) + 0.6, BACK)} accent={C.gold}>
        <div style={{fontSize: 30}}>
          pita fundamental <span style={{color: C.gold, fontWeight: 600}}>0 → 1</span> = paling kuat
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const Bar: React.FC<{label: string; value: string; frac: number; color: string; p: number}> = ({label, value, frac, color, p}) => (
  <div style={{opacity: p}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: C.muted}}>
      <span>{label}</span>
      <span style={{color}}>{value}</span>
    </div>
    <div style={{height: 14, borderRadius: 7, background: '#1a2140', marginTop: 6}}>
      <div style={{height: 14, borderRadius: 7, width: `${100 * Math.max(0.02, frac) * p}%`, background: color, boxShadow: `0 0 12px ${color}`}} />
    </div>
  </div>
);
