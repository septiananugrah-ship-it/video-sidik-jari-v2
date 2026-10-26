import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, pathOf, ramp, sample, smoothPath, win} from '../anim';
import {interpolateColors} from 'remotion';
import {Arrow, Atom, Bond, Card, DrawPath, Glow, Label, Ripple, Spark, Stage} from '../components/primitives';
import {GENERIC_PEAKS, spectrumPath, type PlotBox} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const S = {x: 210, y: 420};
const BS = {x: 610, y: 420};
const FM = {x: 610, y: 205};
const MM0 = 980;
const SA = {x: 610, y: 610};
const D = {x: 610, y: 770};

// Interferogram: jumlah kosinus dari spektrum sumber yang sebagian diserap.
const IGRAM = (() => {
  const nus = Array.from({length: 140}, (_, i) => 4 + (i / 139) * 40);
  const B = nus.map((n) => Math.exp(-(((n - 20) / 11) ** 2)) * (1 - 0.7 * Math.exp(-(((n - 27) / 1.2) ** 2)) - 0.5 * Math.exp(-(((n - 13) / 1.5) ** 2))));
  const pts = sample((d) => nus.reduce((s, n, k) => s + B[k] * Math.cos(2 * Math.PI * n * d * 0.5), 0), -1, 1, 700);
  const max = Math.max(...pts.map((p) => Math.abs(p[1])));
  return pts.map(([d, v]) => [d, v / max] as [number, number]);
})();

const Beam: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; t: number; width?: number; color?: string}> = ({x1, y1, x2, y2, p, t, width = 10, color = C.amber}) => {
  if (p <= 0) return null;
  const xe = mix(x1, x2, p);
  const ye = mix(y1, y2, p);
  return (
    <g>
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={color} strokeWidth={width * 2.6} strokeOpacity={0.14} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={color} strokeWidth={width * 0.5} strokeOpacity={0.9} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke="#fff" strokeWidth={width * 0.35} strokeDasharray="14 22" strokeDashoffset={-t * 140} strokeOpacity={0.8} />
    </g>
  );
};

const Mirror: React.FC<{x: number; y: number; vertical?: boolean; label: string; color?: string}> = ({x, y, vertical, label, color = '#cfe3ff'}) => (
  <g>
    <rect x={vertical ? x - 6 : x - 80} y={vertical ? y - 80 : y - 6} width={vertical ? 16 : 160} height={vertical ? 160 : 16} rx={4} fill={color} opacity={0.9} />
    <rect x={vertical ? x + 10 : x - 80} y={vertical ? y - 80 : y - 18} width={vertical ? 10 : 160} height={vertical ? 160 : 12} fill="#2a3352" />
    <Label x={vertical ? x + 20 : x + 100} y={vertical ? y + 115 : y} size={24} color={C.muted} anchor={vertical ? 'middle' : 'start'}>
      {label}
    </Label>
  </g>
);

export const Ftir: React.FC = () => {
  const {t, cue} = useScene();
  const acr = win(t, -0.5, cue(1) - 0.3, 0.6, 0.6);
  const setup = ramp(t, cue(1) - 0.4, cue(1) + 0.4);
  const b1 = ramp(t, cue(1) + 0.4, cue(1) + 1.6, EASE_IN_OUT);
  const b2 = ramp(t, cue(2) + 0.4, cue(2) + 1.4, EASE_IN_OUT);
  const mirrors = ramp(t, cue(2) + 0.6, cue(2) + 1.3);
  const moving = ramp(t, cue(3) + 0.3, cue(3) + 1.2);
  const recomb = ramp(t, cue(4) + 0.2, cue(4) + 1.2, EASE_IN_OUT);
  const inset = win(t, cue(4) + 0.4, cue(6) - 0.3, 0.6, 0.5);
  const toSample = ramp(t, cue(5), cue(5) + 1, EASE_IN_OUT);
  const absorb = ramp(t, cue(5) + 1.2, cue(5) + 2);
  const toDet = ramp(t, cue(6) - 0.2, cue(6) + 0.6, EASE_IN_OUT);
  const igram = ramp(t, cue(6) + 0.4, cue(6) + 3, EASE_IN_OUT);
  const ft = ramp(t, cue(7), cue(7) + 0.8, BACK);
  const spec = ramp(t, cue(8) + 0.2, cue(8) + 3.2, EASE_IN_OUT);

  const sweepOn = ramp(t, cue(6) + 0.2, cue(6) + 0.5) * (1 - ramp(t, cue(6) + 3, cue(6) + 3.4));
  const d = mix(46 * Math.sin(2 * Math.PI * 0.35 * t) * moving, mix(-46, 46, ramp(t, cue(6) + 0.4, cue(6) + 3, EASE_IN_OUT)), sweepOn);
  const MM = {x: MM0 + d, y: 420};

  // inset interferensi
  const phase = (d / 46) * Math.PI;
  const inX = 1440;
  const inY = 420;
  const w1 = smoothPath(sample((x) => inY - 120 + 26 * Math.sin(x * 0.05 - t * 6), inX - 260, inX + 260, 120));
  const w2 = smoothPath(sample((x) => inY - 40 + 26 * Math.sin(x * 0.05 - t * 6 + phase), inX - 260, inX + 260, 120));
  const w3 = smoothPath(sample((x) => inY + 70 + 26 * (Math.sin(x * 0.05 - t * 6) + Math.sin(x * 0.05 - t * 6 + phase)), inX - 260, inX + 260, 120));
  const constructive = Math.cos(phase / 2) ** 2;

  const ig: PlotBox = {x: 1110, y: 200, w: 660, h: 230};
  const igPts = IGRAM.map(([dd, v]) => [ig.x + ((dd + 1) / 2) * ig.w, ig.y + ig.h / 2 - v * ig.h * 0.46] as [number, number]);
  const sp: PlotBox = {x: 1110, y: 560, w: 660, h: 200};

  return (
    <AbsoluteFill>
      {/* akronim */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: acr}}>
        <div style={{display: 'flex', gap: 46}}>
          {[
            ['F', 'Fourier'],
            ['T', 'Transform'],
            ['I', 'Infra'],
            ['R', 'Red'],
          ].map(([L, word], i) => {
            const p = ramp(t, 0.1 + i * 0.25, 0.7 + i * 0.25, BACK);
            const w = ramp(t, 1.4 + i * 0.25, 2 + i * 0.25);
            return (
              <div key={L} style={{textAlign: 'center', opacity: p, translate: `0px ${(1 - p) * 30}px`}}>
                <div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 190, color: i < 2 ? C.gold : C.amber, lineHeight: 1, textShadow: '0 0 50px rgba(255,160,60,0.4)'}}>{L}</div>
                <div style={{fontFamily: FONT.sans, fontSize: 32, color: C.muted, opacity: w}}>{word}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 30, fontFamily: FONT.sans, fontSize: 34, color: C.ink, opacity: ramp(t, 2.6, 3.4)}}>spektroskopi inframerah transformasi Fourier</div>
      </AbsoluteFill>

      <Stage>
        <g opacity={setup}>
          {/* kotak interferometer */}
          <rect x={420} y={140} width={680} height={380} rx={24} fill="rgba(20,28,58,0.35)" stroke={C.faint} strokeWidth={2} strokeDasharray="10 8" />
          <Label x={440} y={168} size={22} color={C.muted} anchor="start" spacing={3}>
            INTERFEROMETER
          </Label>
          {/* sumber */}
          <Glow x={S.x} y={S.y} r={110} color="red" opacity={0.6 + 0.2 * Math.sin(t * 5)} />
          <circle cx={S.x} cy={S.y} r={36} fill="#ff8a5a" />
          <path d={pathOf(sample((x) => S.y + 12 * Math.sin(x * 0.6), S.x - 22, S.x + 22, 40))} stroke="#fff" strokeWidth={3} fill="none" />
          <Label x={S.x} y={S.y + 80} size={24} color={C.muted}>
            sumber IR
          </Label>

          <Beam x1={S.x + 36} y1={S.y} x2={BS.x} y2={BS.y} p={b1} t={t} />
          <Beam x1={BS.x} y1={BS.y} x2={FM.x} y2={FM.y + 8} p={b2} t={t} />
          <Beam x1={BS.x} y1={BS.y} x2={MM.x - 8} y2={MM.y} p={b2} t={t} />
          <Beam x1={BS.x} y1={BS.y + 4} x2={SA.x} y2={SA.y - 40} p={recomb} t={t} width={12} />
          <Beam x1={SA.x} y1={SA.y + 40} x2={D.x} y2={D.y - 30} p={toDet} t={t} width={9} color={C.gold} />

          {/* pemecah berkas */}
          <g opacity={ramp(t, cue(2), cue(2) + 0.6)}>
            <line x1={BS.x - 60} y1={BS.y + 60} x2={BS.x + 60} y2={BS.y - 60} stroke={C.cyan} strokeWidth={9} opacity={0.85} filter="url(#glow)" />
            <Label x={BS.x - 110} y={BS.y + 100} size={24} color={C.cyan} anchor="middle">
              pemecah berkas
            </Label>
          </g>
          <g opacity={mirrors}>
            <Mirror x={FM.x} y={FM.y} label="cermin diam" />
            <Mirror x={MM.x} y={MM.y} vertical label="cermin bergerak" color={C.gold} />
            <g opacity={moving}>
              <Arrow x1={MM0 - 70} y1={MM.y + 150} x2={MM0 + 70} y2={MM.y + 150} color="gold" width={4} both />
            </g>
          </g>
          {/* sampel */}
          <g opacity={toSample}>
            <rect x={SA.x - 110} y={SA.y - 34} width={220} height={68} rx={12} fill="rgba(120,170,255,0.12)" stroke="#bcd6ff" strokeOpacity={0.6} strokeWidth={2} />
            <rect x={SA.x - 108} y={SA.y - 32} width={216} height={6} rx={3} fill="#ffffff" opacity={0.25} />
            <Glow x={SA.x} y={SA.y} r={150} color="gold" opacity={0.45 * absorb * (0.7 + 0.3 * Math.sin(t * 7))} />
            {(() => {
              const n = 9;
              const pts = Array.from({length: n}, (_, i) => [SA.x - 96 + i * 24 + 2 * Math.sin(t * 9 + i), SA.y + (i % 2 ? -8 : 8) + 2.5 * Math.sin(t * 7 + i * 1.3)] as [number, number]);
              return (
                <g>
                  {pts.slice(1).map((q, i) => (
                    <Bond key={i} x1={pts[i][0]} y1={pts[i][1]} x2={q[0]} y2={q[1]} width={4} />
                  ))}
                  {[2, 6].map((i) => {
                    const ox = pts[i][0];
                    const oy = pts[i][1] - 20 - 5 * absorb * Math.sin(t * 16 + i);
                    return (
                      <g key={i}>
                        <Bond x1={pts[i][0]} y1={pts[i][1]} x2={ox} y2={oy} order={2} width={4} color={absorb > 0.1 ? C.gold : undefined} />
                        <Atom x={ox} y={oy} el="O" r={7} label={null} glow={absorb} />
                      </g>
                    );
                  })}
                  {pts.map((q, i) => (
                    <Atom key={i} x={q[0]} y={q[1]} el="C" r={6} label={null} glow={0.3} />
                  ))}
                </g>
              );
            })()}
            <Ripple x={SA.x} y={SA.y} p={ramp(t, cue(5) + 1.2, cue(5) + 2.6)} r={170} color={C.gold} rings={3} />
            <Label x={SA.x + 120} y={SA.y} size={26} color={C.gold} anchor="start" weight={600}>
              sampel
            </Label>
          </g>
          {/* detektor */}
          <g opacity={toDet}>
            <path d={`M${D.x - 50},${D.y - 30} L${D.x + 50},${D.y - 30} L${D.x + 36},${D.y + 30} L${D.x - 36},${D.y + 30} Z`} fill="#3a4466" stroke={C.ink} strokeWidth={2} />
            <circle cx={D.x} cy={D.y - 2} r={10} fill={C.mint} opacity={0.6 + 0.4 * Math.sin(t * 9)} />
            <Label x={D.x + 80} y={D.y} size={26} color={C.ink} anchor="start">
              detektor
            </Label>
            <Label x={D.x - 80} y={D.y} size={26} color={C.mint} anchor="end" font="mono" weight={600} opacity={ramp(t, cue(6) + 0.3, cue(6) + 0.6)}>
              {String(Math.round(50 + 48 * IGRAM[Math.round(Math.min(1, Math.max(0, igram)) * (IGRAM.length - 1))][1])).padStart(3, ' ')}
            </Label>
          </g>
        </g>

        {/* inset interferensi */}
        <g opacity={inset}>
          <rect x={inX - 300} y={inY - 190} width={600} height={360} rx={20} fill="rgba(10,14,30,0.75)" stroke={C.faint} strokeWidth={2} />
          <path d={w1} stroke={C.amber} strokeWidth={4} fill="none" />
          <path d={w2} stroke={C.gold} strokeWidth={4} fill="none" />
          <path d={w3} stroke={interpolateColors(constructive, [0.2, 0.8], [C.red, C.mint])} strokeWidth={5} fill="none" filter="url(#glow)" />
          <Label x={inX} y={inY + 150} size={24} color={C.mint} weight={600} opacity={ramp(constructive, 0.35, 0.65)}>
            saling menguatkan
          </Label>
          <Label x={inX} y={inY + 150} size={24} color={C.red} weight={600} opacity={1 - ramp(constructive, 0.35, 0.65)}>
            saling melemahkan
          </Label>
        </g>

        {/* interferogram */}
        <g opacity={ramp(t, cue(6), cue(6) + 0.5)}>
          <rect x={ig.x - 20} y={ig.y - 20} width={ig.w + 40} height={ig.h + 40} rx={18} fill="rgba(10,14,30,0.6)" stroke={C.faint} />
          <Label x={ig.x} y={ig.y - 44} size={24} color={C.mint} anchor="start" weight={600}>
            interferogram
          </Label>
          <line x1={ig.x} y1={ig.y + ig.h / 2} x2={ig.x + ig.w} y2={ig.y + ig.h / 2} stroke={C.faint} />
          {igram > 0 ? (
            <g>
              <path d={pathOf(igPts.slice(0, Math.max(2, Math.round(igram * (igPts.length - 1)) + 1)))} fill="none" stroke={C.mint} strokeWidth={2.5} />
              {igram < 1 ? (
                <>
                  <line x1={igPts[Math.round(igram * (igPts.length - 1))][0]} y1={ig.y} x2={igPts[Math.round(igram * (igPts.length - 1))][0]} y2={ig.y + ig.h} stroke={C.mint} strokeOpacity={0.35} strokeDasharray="4 6" />
                  <Spark x={igPts[Math.round(igram * (igPts.length - 1))][0]} y={igPts[Math.round(igram * (igPts.length - 1))][1]} r={7} color={C.mint} />
                </>
              ) : null}
            </g>
          ) : null}
          <Label x={ig.x + ig.w} y={ig.y + ig.h + 44} size={20} color={C.muted} anchor="end">
            posisi cermin →
          </Label>
        </g>
        {/* panah FT */}
        <g opacity={ft}>
          <Arrow x1={ig.x + ig.w / 2} y1={ig.y + ig.h + 30} x2={ig.x + ig.w / 2} y2={sp.y - 30} color="gold" width={5} />
        </g>
        {/* spektrum */}
        <g opacity={ramp(t, cue(8) - 0.2, cue(8) + 0.4)}>
          <rect x={sp.x - 20} y={sp.y - 20} width={sp.w + 40} height={sp.h + 40} rx={18} fill="rgba(10,14,30,0.6)" stroke={C.faint} />
          <line x1={sp.x} y1={sp.y + sp.h} x2={sp.x + sp.w} y2={sp.y + sp.h} stroke={C.faint} />
          <DrawPath d={spectrumPath(sp, GENERIC_PEAKS, 0.9)} p={spec} stroke={C.gold} width={3} glow len={5000} />
          <Label x={sp.x} y={sp.y + sp.h + 44} size={20} color={C.muted} anchor="start" font="mono">
            4000
          </Label>
          <Label x={sp.x + sp.w} y={sp.y + sp.h + 44} size={20} color={C.muted} anchor="end" font="mono">
            400 cm⁻¹
          </Label>
          <Label x={sp.x + sp.w / 2} y={sp.y + sp.h + 44} size={22} color={C.gold} weight={600}>
            spektrum
          </Label>
        </g>
      </Stage>
      <Card x={1440 + 40} y={(ig.y + ig.h + sp.y) / 2} opacity={ft} scale={0.8 + 0.2 * ft} accent={C.gold} anchor="left" style={{padding: '10px 22px'}}>
        <div style={{fontSize: 30}}>
          <span style={{fontFamily: FONT.serif, fontStyle: 'italic', color: C.gold, fontSize: 38}}>ℱ</span> transformasi Fourier
        </div>
      </Card>
    </AbsoluteFill>
  );
};
