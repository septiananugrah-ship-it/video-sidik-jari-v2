import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, sample, smoothPath} from '../anim';
import {DrawPath, Glow, Label, Motes, Ripple, Spring, Stage} from '../components/primitives';
import {Fingerprint, PhotonPacket} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const NODES = [
  {x: 270, y: 470, title: 'ikatan bergetar', color: C.gold},
  {x: 615, y: 550, title: 'k dan μ', color: C.cyan},
  {x: 960, y: 470, title: 'tangga energi', color: C.violet},
  {x: 1305, y: 550, title: 'serapan IR', color: C.amber},
  {x: 1650, y: 470, title: 'spektrum FTIR', color: C.mint},
];

const PATH = smoothPath(NODES.map((n) => [n.x, n.y]));

const BOTTLE =
  'M935,250 L935,305 C935,345 845,355 845,425 L845,750 Q845,800 895,800 L1025,800 Q1075,800 1075,750 L1075,425 C1075,355 985,345 985,305 L985,250 Z';

const PAIRS = Array.from({length: 46}, (_, i) => ({
  x: 875 + rand(i * 2.1) * 170,
  y: 440 + rand(i * 3.7) * 330,
  a: rand(i * 5.3) * Math.PI,
  f: 0.6 + rand(i * 7.9) * 2.2,
  c: [C.gold, C.cyan, C.violet, C.mint, C.pink][i % 5],
}));

const Icon: React.FC<{i: number; x: number; y: number; t: number; on: number}> = ({i, x, y, t, on}) => {
  const col = NODES[i].color;
  switch (i) {
    case 0: {
      const s = 10 * Math.sin(t * 2 * Math.PI * (0.6 + on));
      return (
        <g>
          <Spring x1={x - 40} y1={y} x2={x + 30 + s} y2={y} coils={5} amp={9} width={4} />
          <circle cx={x - 42} cy={y} r={20} fill="#4fdc7a" />
          <circle cx={x + 34 + s} cy={y} r={13} fill="#f2f5ff" />
        </g>
      );
    }
    case 1:
      return (
        <text x={x} y={y + 4} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={44} fill={col}>
          √k/μ
        </text>
      );
    case 2:
      return (
        <g>
          {[0, 1, 2].map((k) => (
            <line key={k} x1={x - 40 + k * 8} y1={y + 30 - k * 28} x2={x + 40 - k * 8} y2={y + 30 - k * 28} stroke={col} strokeWidth={5} strokeLinecap="round" />
          ))}
          {(() => {
            const u = t * 1.2;
            const k = Math.floor(u);
            const e = ramp(u - k, 0.65, 1, EASE_IN_OUT);
            const lvl = mix(k % 3, (k + 1) % 3, e);
            return <circle cx={x} cy={y + 18 - 28 * lvl} r={8} fill={C.gold} />;
          })()}
        </g>
      );
    case 3:
      return <PhotonPacket x={x} y={y} wavelength={22} color={col} amp={16} len={110} phase={-t * 10} />;
    default:
      return (
        <path
          d={smoothPath(sample((u) => y + 25 - 50 * (Math.exp(-(((u - 0.25) / 0.05) ** 2)) + 0.8 * Math.exp(-(((u - 0.6) / 0.03) ** 2)) + 0.5 * Math.exp(-(((u - 0.8) / 0.04) ** 2))), 0, 1, 60).map(([u, v]) => [x - 50 + u * 100, v]))}
          fill="none"
          stroke={col}
          strokeWidth={4}
        />
      );
  }
};

export const Recap: React.FC = () => {
  const {t, cue} = useScene();
  const intro = ramp(t, cue(0) - 0.3, cue(0) + 1);
  const nodesOut = ramp(t, cue(6) - 0.3, cue(6) + 1, EASE_IN_OUT);
  const bottle = ramp(t, cue(6) + 0.2, cue(6) + 2, EASE_IN_OUT);
  const pairs = ramp(t, cue(7) + 0.2, cue(7) + 2);
  const beam = ramp(t, cue(8) - 0.2, cue(8) + 2.2, EASE_IN_OUT);
  const fp = ramp(t, cue(8) + 1.4, cue(8) + 4.5, EASE_IN_OUT);
  const lit = NODES.map((_, i) => ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 0.6, BACK));
  const pathP = ramp(t, cue(1), cue(5) + 1, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={intro * (1 - nodesOut)} transform={`translate(0 ${-nodesOut * 80})`}>
          <path d={PATH} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="6 10" />
          <DrawPath d={PATH} p={pathP} stroke={C.gold} width={4} glow len={2200} />
          {NODES.map((n, i) => {
            const on = lit[i];
            return (
              <g key={i}>
                <Glow x={n.x} y={n.y} r={180} color="white" opacity={0.08 + 0.12 * on} />
                <Ripple x={n.x} y={n.y} p={ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 1.5)} r={230} color={n.color} rings={2} />
                <Motes x={n.x} y={n.y} rx={150} ry={150} t={t} n={14} color={n.color} opacity={0.8 * on} seed={i} />
                <circle cx={n.x} cy={n.y} r={96} fill="rgba(12,18,40,0.92)" stroke={on > 0.05 ? n.color : C.faint} strokeWidth={3 + 2 * on} />
                <circle cx={n.x} cy={n.y} r={96 + 14 * on} fill="none" stroke={n.color} strokeWidth={2} opacity={0.4 * on} />
                <g opacity={0.35 + 0.65 * on}>
                  <Icon i={i} x={n.x} y={n.y} t={t} on={on} />
                </g>
                <Label x={n.x} y={n.y + 140} size={28} weight={600} color={on > 0.05 ? C.ink : C.muted}>
                  {n.title}
                </Label>
                <Label x={n.x} y={n.y - 130} size={22} color={n.color} font="mono" opacity={on}>
                  {`0${i + 1}`}
                </Label>
              </g>
            );
          })}
        </g>

        {/* botol plastik */}
        <g opacity={bottle}>
          <Fingerprint x={960} y={520} scale={1.6} p={fp} opacity={0.5} width={2.5} />
          <Glow x={960} y={520} r={420} color="gold" opacity={0.25 * fp} />
          <path d={BOTTLE} fill="rgba(120,200,255,0.06)" />
          <DrawPath d={BOTTLE} p={bottle} stroke="#bfe6ff" width={4} glow len={2600} />
          <rect x={925} y={215} width={70} height={38} rx={8} fill={C.cyan} opacity={0.7 * bottle} />
          <g opacity={pairs}>
            {PAIRS.map((q, i) => {
              const s = 5 * Math.sin(2 * Math.PI * q.f * t + i);
              const dx = Math.cos(q.a) * (12 + s);
              const dy = Math.sin(q.a) * (12 + s);
              return (
                <g key={i}>
                  <circle cx={q.x} cy={q.y} r={16} fill={q.c} opacity={0.15 + 0.15 * Math.sin(t * q.f * 3 + i)} />
                  <line x1={q.x - dx} y1={q.y - dy} x2={q.x + dx} y2={q.y + dy} stroke={q.c} strokeWidth={2} />
                  <circle cx={q.x - dx} cy={q.y - dy} r={4.5} fill={q.c} />
                  <circle cx={q.x + dx} cy={q.y + dy} r={3.5} fill="#fff" />
                </g>
              );
            })}
          </g>
          {/* berkas IR melintas */}
          <g opacity={ramp(beam, 0, 0.06)}>
            <line x1={120} y1={600} x2={mix(120, 1800, beam)} y2={600} stroke={C.red} strokeWidth={14} strokeOpacity={0.18} />
            <line x1={120} y1={600} x2={mix(120, 1800, beam)} y2={600} stroke={C.red} strokeWidth={3} />
            <PhotonPacket x={mix(120, 1800, beam)} y={600} wavelength={40} color={C.red} amp={20} len={200} phase={-t * 12} />
          </g>
        </g>
      </Stage>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 130, opacity: ramp(t, cue(8) + 2.6, cue(8) + 3.4)}}>
        <div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: 300, color: C.ink, letterSpacing: 2}}>
          setiap bahan punya <span style={{color: C.gold, fontWeight: 700}}>lagunya</span> sendiri
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
