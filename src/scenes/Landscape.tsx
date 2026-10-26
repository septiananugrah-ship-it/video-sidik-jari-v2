import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, sample, smoothPath, win} from '../anim';
import {Arrow, Atom, Badge, Card, DrawPath, Glow, Label, Spark, Spring, Stage, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const R0 = 1.2;
const A = 1.7;
const O = {x: 380, y: 740};
const SX = 1220 / 3.8; // px per satuan r
const SY = 390; // px per satuan energi
const px = (r: number) => O.x + (r - 0.4) * SX;
const py = (v: number) => O.y - v * SY;
const morse = (r: number) => (1 - Math.exp(-A * (r - R0))) ** 2;
const harm = (r: number) => A * A * (r - R0) ** 2;

const MORSE_D = smoothPath(sample(morse, 0.76, 4.2, 160).map(([r, v]) => [px(r), py(v)]));
const HARM_D = smoothPath(sample(harm, R0 - 0.66, R0 + 0.66, 90).map(([r, v]) => [px(r), py(v)]));

export const Landscape: React.FC = () => {
  const {t, cue} = useScene();
  const axes = ramp(t, cue(0) - 0.2, cue(0) + 1.4, EASE_IN_OUT);
  const labels = ramp(t, cue(1), cue(1) + 0.8);
  const para = ramp(t, cue(2), cue(2) + 1.8, EASE_IN_OUT);
  const ball = ramp(t, cue(2) + 1.2, cue(2) + 1.8);
  const harmBadge = ramp(t, cue(3), cue(3) + 0.6, BACK);
  const morseP = ramp(t, cue(4) + 0.3, cue(4) + 2.4, EASE_IN_OUT);
  const wall = win(t, cue(5), cue(6) - 0.1, 0.4, 0.5);
  const plateau = ramp(t, cue(6), cue(6) + 0.8);
  const brk = ramp(t, cue(6) + 1.2, cue(6) + 2.6, EASE_IN_OUT);
  const morseLabel = ramp(t, cue(7), cue(7) + 0.7, BACK);
  const zoom = ramp(t, cue(8) - 0.2, cue(8) + 1.6, EASE_IN_OUT);

  // bola berosilasi di dalam mangkuk
  const amp = 0.42;
  const r = R0 + amp * Math.sin(2 * Math.PI * 0.45 * t);
  const onMorse = ramp(t, cue(4) + 1.6, cue(4) + 2.6);
  const v = mix(harm(r), morse(r), onMorse);

  const scale = mix(1, 1.75, zoom);
  const fx = px(R0);
  const fy = py(0);

  return (
    <AbsoluteFill>
      <Stage>
        <g transform={`translate(${mix(0, 960 - fx, zoom)} ${mix(0, 600 - fy, zoom)}) translate(${fx} ${fy}) scale(${scale}) translate(${-fx} ${-fy})`}>
          {/* sumbu */}
          <g opacity={axes}>
            <Arrow x1={O.x} y1={O.y} x2={mix(O.x, 1640, axes)} y2={O.y} color="muted" width={3} />
            <Arrow x1={O.x} y1={O.y} x2={O.x} y2={mix(O.y, 190, axes)} color="muted" width={3} />
          </g>
          <g opacity={labels * (1 - zoom)}>
            <Label x={1640} y={O.y + 42} size={28} color={C.muted} anchor="end">
              jarak antaratom, r
            </Label>
            <text x={O.x - 34} y={(O.y + 190) / 2} transform={`rotate(-90 ${O.x - 34} ${(O.y + 190) / 2})`} textAnchor="middle" fontSize={28} fill={C.muted} fontFamily="Outfit">
              energi potensial, V
            </text>
            <line x1={px(R0)} y1={O.y} x2={px(R0)} y2={O.y + 14} stroke={C.muted} strokeWidth={3} />
            <Label x={px(R0)} y={O.y + 38} size={26} color={C.ink} font="serif" italic>
              r₀
            </Label>
          </g>

          {/* dinding kiri & dataran kanan */}
          <g opacity={wall}>
            <rect x={px(0.74)} y={py(1.3)} width={px(1.0) - px(0.74)} height={py(0.2) - py(1.3)} fill={C.red} opacity={0.12} rx={12} />
          </g>
          <g opacity={plateau * (1 - zoom)}>
            <line x1={px(1.6)} y1={py(1)} x2={px(4.2)} y2={py(1)} stroke={C.muted} strokeWidth={2} strokeDasharray="10 10" />
            <Label x={px(3.4)} y={py(1) - 30} size={26} color={C.muted}>
              energi disosiasi
            </Label>
          </g>

          <g opacity={1 - 0.6 * morseP}>
            <DrawPath d={HARM_D} p={para} stroke={C.gold} width={6} glow len={2000} />
          </g>
          <DrawPath d={MORSE_D} p={morseP} stroke={C.cyan} width={6} glow len={3000} />

          {/* bola */}
          <g opacity={ball}>
            <Glow x={px(r)} y={py(v) - 20} r={60} color="gold" opacity={0.6} />
            <Spark x={px(r)} y={py(v) - 20} r={19} color={C.gold} />
          </g>
          <g opacity={zoom}>
            <Glow x={fx} y={fy - 40} r={200} color="gold" opacity={0.35} />
          </g>
        </g>

        {/* ikon: atom terlalu dekat */}
        <g opacity={wall} transform={`translate(${px(2.15)} ${py(1.15)})`}>
          <Atom x={-30} y={0} el="Cl" r={40} label="" />
          <Atom x={30} y={0} el="H" r={26} label="" />
          <Label x={0} y={64} size={24} color={C.red} weight={600}>
            ← terlalu dekat
          </Label>
        </g>
        {/* ikon: ikatan putus */}
        <g opacity={plateau * (1 - zoom)} transform={`translate(${px(3.3)} ${py(1.35)})`}>
          <Spring x1={-110 - brk * 40} y1={0} x2={-20 - brk * 40} y2={brk * 14} coils={4} amp={10} width={4} opacity={1} />
          <Spring x1={20 + brk * 40} y1={brk * -14} x2={110 + brk * 40} y2={0} coils={4} amp={10} width={4} opacity={1 - brk * 0.2} />
          <Atom x={-130 - brk * 50} y={0} el="Cl" r={40} label="" />
          <Atom x={130 + brk * 50} y={0} el="H" r={26} label="" />
          <Label x={0} y={70} size={24} color={C.gold} weight={600} opacity={brk}>
            ikatan putus
          </Label>
        </g>
      </Stage>

      <Card x={1560} y={290} opacity={para * (1 - morseP) * (1 - zoom)} accent={C.gold} anchor="right">
        <div style={{fontSize: 46}}>
          <V>V</V> = ½ <V color={C.gold}>k</V> <V>x</V>²
        </div>
      </Card>
      <Badge x={px(R0)} y={190} text="OSILATOR HARMONIK" color={C.gold} opacity={harmBadge * (1 - morseP) } scale={0.8 + 0.2 * harmBadge} />
      <Card x={px(2.6)} y={py(0.55)} opacity={morseLabel * (1 - zoom)} scale={0.85 + 0.15 * morseLabel} accent={C.cyan} anchor="left">
        <div style={{fontSize: 34, color: C.cyan, fontWeight: 600}}>potensial Morse</div>
        <div style={{fontSize: 30, marginTop: 6}}>
          <V>V</V>(<V>r</V>) = <V>D</V>
          <sub>e</sub> [1 − <V>e</V>
          <sup style={{fontSize: 20}}>−a(r−r₀)</sup>]²
        </div>
      </Card>
      <Card x={960} y={250} opacity={zoom} accent={C.gold}>
        <div style={{fontSize: 34}}>
          di dasar mangkuk: <span style={{color: C.gold, fontWeight: 600}}>harmonik</span> ≈ <span style={{color: C.cyan, fontWeight: 600}}>Morse</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
