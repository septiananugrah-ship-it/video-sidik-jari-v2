import React from 'react';
import {AbsoluteFill} from 'remotion';
import {cyc, EASE_IN_OUT, ramp, rand, smoothPath, win} from '../anim';
import {Atom, Bond, Card, Stage} from '../components/primitives';
import {Sheet} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const expo = (a: number, b: number, p: number) => a * Math.pow(b / a, p);

// Rantai-rantai polimer kusut (lapisan tengah).
const STRANDS = Array.from({length: 30}, (_, i) => {
  const pts: [number, number][] = [];
  let x = -300 + rand(i * 1.7) * 2500;
  let y = -200 + rand(i * 4.1) * 1500;
  let a = rand(i * 9.3) * Math.PI * 2;
  for (let k = 0; k < 16; k++) {
    pts.push([x, y]);
    a += (rand(i * 31 + k * 7) - 0.5) * 1.6;
    x += Math.cos(a) * 140;
    y += Math.sin(a) * 140;
  }
  return {d: smoothPath(pts), color: [C.cyan, C.violet, C.blue, C.gold][i % 4], w: 3 + rand(i * 2.9) * 7, depth: 0.4 + rand(i * 5.5) * 0.6};
});

// Rantai polietilena: zig-zag karbon, masing-masing dengan dua hidrogen.
const N_C = 8;
const CHAIN = (() => {
  const atoms: {x: number; y: number; el: string; parent?: number}[] = [];
  for (let i = 0; i < N_C; i++) {
    const up = i % 2 === 0;
    atoms.push({x: 365 + i * 170, y: up ? 495 : 585, el: 'C'});
  }
  for (let i = 0; i < N_C; i++) {
    const up = i % 2 === 0;
    const c = atoms[i];
    atoms.push({x: c.x - 52, y: c.y + (up ? -92 : 92), el: 'H', parent: i});
    atoms.push({x: c.x + 52, y: c.y + (up ? -92 : 92), el: 'H', parent: i});
  }
  return atoms;
})();

export const Zoom: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const zA = ramp(t, cue(0) + 0.6, cue(1) + 0.4, EASE_IN_OUT);
  const zB = ramp(t, cue(2) - 0.3, cue(2) + 1.6, EASE_IN_OUT);
  const aScale = expo(1, 14, zA);
  const aOpacity = 1 - ramp(zA, 0.55, 0.95, EASE_IN_OUT);
  const bScale = expo(0.3, 1, zA) * expo(1, 12, zB);
  const bOpacity = ramp(zA, 0.45, 0.9) * (1 - ramp(zB, 0.5, 0.9));
  const cScale = expo(0.25, 1, zB);
  const cOpacity = ramp(zB, 0.45, 0.95);

  const vib = ramp(t, wordOf(4, 'tidak') - 0.2, wordOf(4, 'diam') + 0.4);
  const stretchHl = win(t, wordOf(5, 'memanjang'), wordOf(5, 'menekuk') - 0.1, 0.3, 0.3);
  const bendHl = win(t, wordOf(5, 'menekuk'), cue(6) + 0.2, 0.3, 0.4);
  const orchestra = ramp(t, cue(6) - 0.2, cue(6) + 0.8);

  // Perpindahan setiap atom: H ringan bergetar lebih cepat dan lebih jauh.
  const pos = CHAIN.map((a, i) => {
    const light = a.el === 'H';
    const f = light ? 1.9 + rand(i) * 0.9 : 0.7 + rand(i) * 0.3;
    const amp = (light ? 13 : 6) * vib * (1 + 0.6 * orchestra);
    return {
      ...a,
      x: a.x + amp * Math.sin(t * f * 2 * Math.PI + i * 1.3),
      y: a.y + amp * Math.cos(t * f * 2 * Math.PI * 0.83 + i * 2.1),
    };
  });

  const mag = zB > 0.02 ? expo(1e5, 1e7, zB) : expo(1, 1e5, zA);
  const magLabel = `×${Math.round(mag).toLocaleString('id-ID')}`;
  const sA = ramp(zA, 0.4, 0.6);
  const sB = ramp(zB, 0.4, 0.6);
  const stages: [string, number][] = [
    ['lembar plastik · ~0,1 mm', (1 - sA) * (1 - sB)],
    ['rantai polimer · ~10 nm', sA * (1 - sB)],
    ['atom & ikatan · ~0,1 nm', sB],
  ];

  const hlBond = 3; // ikatan C–H yang disorot
  const hC = pos[hlBond];
  const hH = pos[N_C + hlBond * 2 + 1];

  return (
    <AbsoluteFill>
      {/* Lapisan A: lembar plastik */}
      <AbsoluteFill style={{scale: String(aScale), opacity: aOpacity, transformOrigin: '54% 46%'}}>
        <Sheet x={960} y={480} w={620} h={600} t={t} tint={C.cyan} rotY={8} seed={0.3} />
      </AbsoluteFill>

      {/* Lapisan B: rantai polimer kusut */}
      <AbsoluteFill style={{scale: String(bScale), opacity: bOpacity, transformOrigin: '50% 50%'}}>
        <Stage>
          {STRANDS.map((s, i) => (
            <g key={i} transform={`translate(${Math.sin(t * 0.2 + i) * 20 * s.depth} ${Math.cos(t * 0.17 + i) * 16 * s.depth})`}>
              <path d={s.d} fill="none" stroke={s.color} strokeWidth={s.w * 2.4} strokeOpacity={0.12} strokeLinecap="round" />
              <path d={s.d} fill="none" stroke={s.color} strokeWidth={s.w} strokeOpacity={0.35 + 0.5 * s.depth} strokeLinecap="round" />
            </g>
          ))}
        </Stage>
      </AbsoluteFill>

      {/* Lapisan C: atom-atom rantai polietilena */}
      <AbsoluteFill style={{scale: String(cScale), opacity: cOpacity, rotate: `${-2.5 + 2.5 * Math.sin(t * 0.18)}deg`, translate: `${12 * Math.sin(t * 0.23)}px ${8 * Math.cos(t * 0.19)}px`}}>
        <Stage>
          {/* riak "orkestra" */}
          {orchestra > 0
            ? [0, 2, 4, 6, 9, 12, 14].map((bi, k) => {
                const a = pos[bi];
                const speed = 0.6 + (k % 3) * 0.35;
                return [0, 1, 2].map((j) => {
                  const ph = (t * speed + j / 3 + k * 0.13) % 1;
                  return (
                    <circle
                      key={`${k}-${j}`}
                      cx={a.x}
                      cy={a.y}
                      r={30 + ph * 160}
                      fill="none"
                      stroke={[C.gold, C.cyan, C.violet, C.mint][k % 4]}
                      strokeWidth={2.5}
                      opacity={orchestra * cyc(ph) * 0.6}
                    />
                  );
                });
              })
            : null}
          {pos.slice(N_C).map((h, i) => (
            <Bond key={`h${i}`} x1={pos[h.parent!].x} y1={pos[h.parent!].y} x2={h.x} y2={h.y} width={9} />
          ))}
          {pos.slice(0, N_C - 1).map((c, i) => (
            <Bond key={`c${i}`} x1={c.x} y1={c.y} x2={pos[i + 1].x} y2={pos[i + 1].y} width={12} />
          ))}
          {/* rantai berlanjut di kedua sisi */}
          <Bond x1={pos[0].x} y1={pos[0].y} x2={pos[0].x - 150} y2={pos[0].y + 90} width={12} opacity={0.35} />
          <Bond x1={pos[N_C - 1].x} y1={pos[N_C - 1].y} x2={pos[N_C - 1].x + 150} y2={pos[N_C - 1].y - 90} width={12} opacity={0.35} />
          {pos.map((a, i) => (
            <Atom key={i} x={a.x} y={a.y} el={a.el} r={a.el === 'H' ? 24 : 38} />
          ))}
          {/* sorotan regangan */}
          <g opacity={stretchHl}>
            <line x1={hC.x} y1={hC.y} x2={hH.x} y2={hH.y} stroke={C.gold} strokeWidth={26} strokeOpacity={0.25} strokeLinecap="round" />
            <circle cx={hH.x} cy={hH.y} r={40} fill="none" stroke={C.gold} strokeWidth={3} />
          </g>
          <g opacity={bendHl}>
            {(() => {
              const c = pos[4];
              const h1 = pos[N_C + 8];
              const h2 = pos[N_C + 9];
              const a1 = Math.atan2(h1.y - c.y, h1.x - c.x);
              const a2 = Math.atan2(h2.y - c.y, h2.x - c.x);
              const r = 60;
              return (
                <path
                  d={`M${c.x + r * Math.cos(a1)},${c.y + r * Math.sin(a1)} A${r},${r} 0 0 1 ${c.x + r * Math.cos(a2)},${c.y + r * Math.sin(a2)}`}
                  fill="none"
                  stroke={C.mint}
                  strokeWidth={5}
                  filter="url(#glow)"
                />
              );
            })()}
          </g>
        </Stage>
        <Card x={hH.x + 70} y={hH.y - 70} opacity={stretchHl} accent={C.gold} anchor="left" style={{fontSize: 28}}>
          <span style={{color: C.gold, fontWeight: 600}}>regang</span> ⟷
        </Card>
        <Card x={pos[4].x + 40} y={pos[4].y - 190} opacity={bendHl} accent={C.mint} style={{fontSize: 28}}>
          <span style={{color: C.mint, fontWeight: 600}}>tekuk</span> ∠
        </Card>
      </AbsoluteFill>

      {/* Indikator perbesaran */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 130,
          textAlign: 'right',
          fontFamily: FONT.mono,
          opacity: win(t, cue(0), cue(3), 0.6, 0.8),
        }}
      >
        <div style={{fontSize: 18, color: C.muted, letterSpacing: 3}}>PERBESARAN</div>
        <div style={{fontSize: 44, color: C.gold, fontWeight: 600}}>{magLabel}</div>
        <div style={{display: 'grid', fontSize: 20, color: C.ink, fontFamily: FONT.sans, marginTop: 4}}>
          {stages.map(([txt, o]) => (
            <div key={txt} style={{gridArea: '1 / 1', opacity: o}}>
              {txt}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
