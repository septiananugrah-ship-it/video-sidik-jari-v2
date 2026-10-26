import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, cyc, ramp, sample, smoothPath} from '../anim';
import {Atom, Glow, Spring, Stage} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Peta video: tiga bagian wajib tugas.
const CARDS = [
  {n: '1', title: 'Prinsip & teori dasar', sub: 'pegas → Schrödinger → tangga energi', color: C.cyan, x: 420},
  {n: '2', title: 'Implementasi dalam kimia', sub: 'spektroskopi inframerah & FTIR', color: C.violet, x: 960},
  {n: '3', title: 'Penerapan di industri', sub: 'polimer, sensor gas, farmasi, pangan', color: C.amber, x: 1500},
];
const Y = 560;

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  if (i === 0) {
    const s = 10 * Math.sin(t * 2 * Math.PI * 0.9);
    return (
      <g>
        <Spring x1={x - 50} y1={y} x2={x + 36 + s} y2={y} coils={6} amp={10} width={4} />
        <Atom x={x - 52} y={y} el="Cl" r={26} label="" />
        <Atom x={x + 40 + s} y={y} el="H" r={16} label="" />
      </g>
    );
  }
  if (i === 1) {
    const d = smoothPath(
      sample((u) => y + 26 - 52 * (Math.exp(-(((u - 0.2) / 0.05) ** 2)) + 0.9 * Math.exp(-(((u - 0.55) / 0.025) ** 2)) + 0.5 * Math.exp(-(((u - 0.8) / 0.03) ** 2))), 0, 1, 80).map(
        ([u, v]) => [x - 70 + u * 140, v],
      ),
    );
    return <path d={d} fill="none" stroke={C.violet} strokeWidth={4} filter="url(#glow)" />;
  }
  // siluet pabrik
  const smoke = (k: number) => {
    const ph = (t * 0.5 + k / 3) % 1;
    return <circle key={k} cx={x + 38 + ph * 14} cy={y - 50 - ph * 40} r={6 + ph * 10} fill={C.muted} opacity={cyc(ph) * 0.55} />;
  };
  return (
    <g>
      {[0, 1, 2].map(smoke)}
      <path
        d={`M${x - 70},${y + 32} L${x - 70},${y - 4} L${x - 40},${y - 20} L${x - 40},${y - 4} L${x - 10},${y - 20} L${x - 10},${y - 4} L${x + 20},${y - 20} L${x + 30},${y - 20} L${x + 30},${y - 50} L${x + 46},${y - 50} L${x + 46},${y + 32} Z`}
        fill={C.amber}
        opacity={0.85}
      />
    </g>
  );
};

export const Roadmap: React.FC = () => {
  const {t, cue} = useScene();
  const head = ramp(t, -0.2, 0.9);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 170,
          width: '100%',
          textAlign: 'center',
          opacity: head,
          translate: `0px ${(1 - head) * 20}px`,
          willChange: 'transform',
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.gold}}>TOPIK KAJIAN</div>
        <div style={{fontFamily: FONT.sans, fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 6}}>Kimia Kuantum Gerak Vibrasi</div>
      </div>
      <Stage>
        {CARDS.map((c, i) => {
          const p = ramp(t, cue(i + 1) - 0.2, cue(i + 1) + 0.6, BACK);
          const lit = ramp(t, cue(i + 1), cue(i + 1) + 0.4) * (i === 2 ? 1 : 1 - 0.45 * ramp(t, cue(i + 2) - 0.2, cue(i + 2) + 0.4));
          return (
            <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 40})`}>
              <Glow x={c.x} y={Y} r={260} color={(['cyan', 'violet', 'gold'] as const)[i]} opacity={0.18 * lit} />
              <rect x={c.x - 252} y={Y - 170} width={504} height={340} rx={28} fill="rgba(12,18,40,0.82)" stroke={c.color} strokeOpacity={0.35 + 0.5 * lit} strokeWidth={2.5} />
              <text x={c.x - 214} y={Y - 110} fontFamily={FONT.mono} fontSize={64} fontWeight={600} fill={c.color} dominantBaseline="central">
                {c.n}
              </text>
              <Icon i={i} x={c.x + 130} y={Y - 110} t={t} />
              <text x={c.x - 214} y={Y + 10} fontFamily={FONT.sans} fontSize={31} fontWeight={700} fill={C.ink}>
                {c.title}
              </text>
              <text x={c.x - 214} y={Y + 58} fontFamily={FONT.sans} fontSize={21} fill={C.muted}>
                {c.sub}
              </text>
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
