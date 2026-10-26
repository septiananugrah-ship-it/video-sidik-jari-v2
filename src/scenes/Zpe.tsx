import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, cyc, EASE_IN_OUT, ramp, rand, win} from '../anim';
import {Atom, Card, Glow, Label, Spring, Stage, V} from '../components/primitives';
import {parabolaPath, psiPath, type Well, wellX, wellY} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';
import {LEVEL_COLORS, LevelLine} from './Ladder';

const W: Well = {cx: 720, base: 760, sx: 175, sy: 175};

export const Zpe: React.FC = () => {
  const {t, cue} = useScene();
  const intro = ramp(t, -0.6, cue(0) + 1, EASE_IN_OUT);
  const bracket = ramp(t, cue(1) + 0.3, cue(1) + 1.2);
  const zpeCard = ramp(t, cue(2), cue(2) + 0.7, BACK);
  const thermo = win(t, cue(3), cue(4) - 0.2, 0.6, 0.5);
  const heis = ramp(t, cue(4) + 0.2, cue(4) + 1, BACK);
  const ghost = win(t, cue(5), cue(7) - 0.2, 0.5, 0.6);
  const xmark = ramp(t, cue(6), cue(6) + 0.4, BACK);
  const shake = xmark > 0 && xmark < 1 ? Math.sin(t * 60) * 8 * (1 - xmark) : 0;
  const sig = ramp(t, cue(7) - 0.2, cue(7) + 1);

  const y0 = wellY(W, 0.5);
  const yb = wellY(W, 0);
  const bx = wellX(W, 2.05);

  // getaran titik nol: atom kecil yang tetap bergoyang
  const jit = 10 * Math.sin(t * 2 * Math.PI * 1.6) + 4 * Math.sin(t * 2 * Math.PI * 3.1 + 1);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={intro} transform={`translate(${W.cx} ${W.base}) scale(${0.85 + 0.15 * intro}) translate(${-W.cx} ${-W.base})`}>
          <path d={parabolaPath(W, 2.4)} fill="none" stroke={C.ink} strokeOpacity={0.6} strokeWidth={4} />
          <line x1={wellX(W, -2.2)} y1={yb} x2={wellX(W, 2.2)} y2={yb} stroke={C.muted} strokeWidth={2} strokeDasharray="8 10" />
          <Label x={wellX(W, -2.25)} y={yb} size={24} color={C.muted} anchor="end">
            dasar mangkuk (E = 0)
          </Label>
          <LevelLine w={W} v={0} p={1} color={LEVEL_COLORS[0]} glow={sig * (0.6 + 0.4 * Math.sin(t * 4))} />
          <LevelLine w={W} v={1} p={1} color={LEVEL_COLORS[1]} />

          {/* tanda tangan kuantum: |ψ0|² */}
          <g opacity={sig}>
            <path d={`${psiPath(W, 0, 120, 1)} Z`} fill={C.gold} opacity={0.2} />
            <path d={psiPath(W, 0, 120, 1)} fill="none" stroke={C.gold} strokeWidth={4} filter="url(#glow)" />
            <Glow x={W.cx} y={y0 - 30} r={160} color="gold" opacity={0.3 + 0.15 * Math.sin(t * 3)} />
          </g>

          {/* kurung ½hν */}
          <g opacity={bracket}>
            <line x1={bx} y1={yb} x2={bx} y2={yb - (yb - y0) * bracket} stroke={C.gold} strokeWidth={4} />
            <line x1={bx - 10} y1={yb} x2={bx + 10} y2={yb} stroke={C.gold} strokeWidth={4} />
            <line x1={bx - 10} y1={y0} x2={bx + 10} y2={y0} stroke={C.gold} strokeWidth={4} />
            <Label x={bx + 24} y={(yb + y0) / 2} size={36} color={C.gold} anchor="start" font="serif" italic weight={600}>
              ½ hν
            </Label>
          </g>

          {/* bola diam di dasar: tidak diizinkan */}
          <g opacity={ghost} transform={`translate(${shake} 0)`}>
            <circle cx={W.cx} cy={yb - 22} r={22} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="6 6" />
            <Label x={W.cx - 150} y={yb + 40} size={26} color={C.ink} font="serif" italic>
              Δx = 0
            </Label>
            <Label x={W.cx + 150} y={yb + 40} size={26} color={C.ink} font="serif" italic>
              Δp = 0
            </Label>
            <g opacity={xmark} transform={`translate(${W.cx} ${yb - 22}) scale(${0.6 + 0.4 * xmark})`}>
              <line x1={-46} y1={-46} x2={46} y2={46} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
              <line x1={46} y1={-46} x2={-46} y2={46} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* termometer 0 K + molekul tetap bergetar */}
        <g opacity={thermo}>
          <rect x={1260} y={430} width={34} height={230} rx={17} fill="#141a33" stroke={C.cyan} strokeWidth={3} />
          <circle cx={1277} cy={680} r={34} fill={C.cyan} />
          <rect x={1268} y={640} width={18} height={30} fill={C.cyan} />
          <Label x={1277} y={390} size={40} color={C.cyan} weight={700} font="mono">
            0 K
          </Label>
          <Spring x1={1440} y1={560} x2={1640 + jit} y2={560} coils={7} amp={14} width={5} />
          <Atom x={1440} y={560} el="Cl" r={52} />
          <Atom x={1640 + jit} y={560} el="H" r={30} />
          {[0, 1, 2].map((k) => {
            const ph = (t * 1.6 + k / 3) % 1;
            return <circle key={k} cx={1640 + jit} cy={560} r={34 + ph * 60} fill="none" stroke={C.gold} strokeWidth={2} opacity={cyc(ph) * 0.65} />;
          })}
          <Label x={1540} y={660} size={26} color={C.ink}>
            tetap bergetar
          </Label>
        </g>
        {/* partikel ketidakpastian */}
        <g opacity={heis * (1 - sig * 0.6)}>
          {Array.from({length: 40}, (_, i) => {
            const a = rand(i) * Math.PI * 2 + t * (0.5 + rand(i * 2));
            const r = 40 + rand(i * 3) * 80;
            return <circle key={i} cx={1500 + Math.cos(a) * r * 1.6} cy={600 + Math.sin(a) * r * 0.5} r={2.5} fill={C.violet} opacity={0.6} />;
          })}
        </g>
      </Stage>

      <Card x={1500} y={260} opacity={zpeCard} scale={0.8 + 0.2 * zpeCard} accent={C.gold}>
        <div style={{fontSize: 24, color: C.muted, letterSpacing: 4, textAlign: 'center', fontFamily: FONT.mono}}>ENERGI TITIK NOL</div>
        <div style={{fontSize: 60, textAlign: 'center'}}>
          <V color={C.gold}>E</V>
          <sub style={{fontSize: 30}}>0</sub> = ½ <V>h</V>
          <V color={C.cyan}>ν</V> <span style={{fontSize: 44, color: C.muted}}>≠ 0</span>
        </div>
      </Card>
      <Card x={1500} y={600} opacity={heis} scale={0.8 + 0.2 * heis} accent={C.violet}>
        <div style={{fontSize: 56, textAlign: 'center'}}>
          Δ<V>x</V> · Δ<V>p</V> ≥ <V>ħ</V>/2
        </div>
        <div style={{fontSize: 22, color: C.muted, textAlign: 'center'}}>prinsip ketidakpastian Heisenberg</div>
      </Card>
    </AbsoluteFill>
  );
};
