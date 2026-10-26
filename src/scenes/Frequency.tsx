import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, sample, smoothPath, win} from '../anim';
import {Atom, Bond, Card, Glow, Label, Spring, Stage, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

/** Jejak osilasi yang bergulir: kanan = sekarang, kiri = masa lalu. */
const Trace: React.FC<{x0: number; x1: number; y: number; f: number; amp: number; t: number; color: string; p?: number}> = ({x0, x1, y, f, amp, t, color, p = 1}) => {
  const speed = 300;
  const xr = mix(x0, x1, p);
  const pts = sample((x) => y - amp * Math.sin(2 * Math.PI * f * (t - (xr - x) / speed)), x0, xr, 160);
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.faint} strokeWidth={1.5} strokeDasharray="4 8" />
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth={4} filter="url(#glow)" />
      <circle cx={xr} cy={y - amp * Math.sin(2 * Math.PI * f * t)} r={9} fill={color} />
    </g>
  );
};

export const Frequency: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const pA = win(t, -1, cue(2) - 0.6, 0.5, 0.6);
  const pB = win(t, cue(2) - 0.3, cue(5) - 0.5, 0.7, 0.6);
  const pC = win(t, cue(5) - 0.2, cue(7) - 0.5, 0.7, 0.6);
  const pD = win(t, cue(7) - 0.2, cue(9) - 0.5, 0.7, 0.6);
  const pE = win(t, cue(9) - 0.2, cue(12) - 0.3, 0.7, 0.6);
  const pF = ramp(t, cue(12) - 0.1, cue(12) + 0.7);

  // --- Fase A: pertanyaan ---
  const qx = 30 * Math.sin(2 * Math.PI * 0.8 * t);
  const twoCards = ramp(t, cue(1) + 0.3, cue(1) + 1, BACK);

  // --- Fase B: jenis ikatan ---
  const rows = [
    {order: 1, f: 0.55, label: 'C–C', nu: '≈ 1000 cm⁻¹', y: 330},
    {order: 2, f: 0.85, label: 'C=C', nu: '≈ 1650 cm⁻¹', y: 520},
    {order: 3, f: 1.15, label: 'C≡C', nu: '≈ 2150 cm⁻¹', y: 710},
  ];
  const rowStart = (i: number) => (i === 0 ? cue(2) + 0.4 : cue(3) + (i - 1) * 1.4);
  const rowIn = (i: number) => ramp(t, rowStart(i) - 0.4, rowStart(i) + 0.4, BACK);
  const kFaster = ramp(t, cue(4), cue(4) + 0.6, BACK);

  // --- Fase C: massa ---
  const masses = [
    {m: 'ringan', r: 30, f: 1.0, y: 380, color: C.cyan},
    {m: 'berat', r: 64, f: 0.42, y: 660, color: C.gold},
  ];
  const heavyFocus = ramp(t, cue(6), cue(6) + 0.6);

  // --- Fase D: rumus ---
  const mu = ramp(t, cue(7), cue(7) + 0.8, BACK);
  const nu = ramp(t, cue(8), cue(8) + 0.9, BACK);

  // --- Fase E: HCl vs DCl ---
  const dMorph = ramp(t, wordOf(10, 'deuterium'), wordOf(10, 'deuterium') + 1, EASE_IN_OUT);
  const readout = ramp(t, cue(11) + 0.5, cue(11) + 1.3);

  return (
    <AbsoluteFill>
      <Stage>
        {/* Fase A */}
        <g opacity={pA}>
          <Glow x={960} y={500} r={260} color="cyan" opacity={0.18} />
          <Spring x1={760} y1={500} x2={1150 + qx} y2={500} coils={9} amp={20} />
          <Atom x={760} y={500} el="C" r={56} label="" />
          <Atom x={1150 + qx} y={500} el="O" r={56} label="" />
          <Label x={960} y={340} size={72} weight={700} color={C.ink}>
            <tspan fontFamily={FONT.serif} fontStyle="italic" fill={C.gold}>
              ν
            </tspan>{' '}
            = ?
          </Label>
        </g>

        {/* Fase B */}
        <g opacity={pB}>
          {rows.map((r, i) => {
            const amp = 26 - i * 4;
            const s = amp * Math.sin(2 * Math.PI * r.f * t);
            const kHl = i === 2 ? ramp(t, wordOf(3, 'tiga'), wordOf(3, 'tiga') + 0.4) : 0;
            return (
              <g key={i} opacity={rowIn(i)}>
                <Label x={250} y={r.y} size={34} weight={600} color={C.ink} font="mono">
                  {r.label}
                </Label>
                <Bond x1={400 - s / 2} y1={r.y} x2={650 + s / 2} y2={r.y} order={r.order} width={14} />
                {kHl > 0.001 ? <Bond x1={400 - s / 2} y1={r.y} x2={650 + s / 2} y2={r.y} order={r.order} width={14} color={C.gold} opacity={kHl} /> : null}
                <Atom x={400 - s / 2} y={r.y} el="C" r={38} />
                <Atom x={650 + s / 2} y={r.y} el="C" r={38} />
                <Trace x0={780} x1={1460} y={r.y} f={r.f} amp={40} t={t} color={[C.cyan, C.violet, C.gold][i]} p={ramp(t, rowStart(i), rowStart(i) + 1.2)} />
                <Label x={1500} y={r.y} size={26} color={C.muted} anchor="start" font="mono">
                  {r.nu}
                </Label>
              </g>
            );
          })}
        </g>

        {/* Fase C */}
        <g opacity={pC}>
          {masses.map((m, i) => {
            const s = 60 * Math.sin(2 * Math.PI * m.f * (t - cue(5)));
            const dim = i === 0 ? 1 - 0.5 * heavyFocus : 1;
            return (
              <g key={i} opacity={ramp(t, cue(5) + i * 0.6, cue(5) + i * 0.6 + 0.6) * dim}>
                <rect x={250} y={m.y - 80} width={22} height={160} rx={6} fill="#2a3352" stroke={C.muted} strokeWidth={2} />
                <Spring x1={272} y1={m.y} x2={620 + s - m.r} y2={m.y} coils={8} amp={18} />
                <circle cx={620 + s} cy={m.y} r={m.r * 2} fill={`url(#soft-${i ? 'gold' : 'cyan'})`} opacity={0.4} />
                <circle cx={620 + s} cy={m.y} r={m.r} fill={m.color} />
                <ellipse cx={620 + s - m.r * 0.3} cy={m.y - m.r * 0.35} rx={m.r * 0.32} ry={m.r * 0.18} fill="#fff" opacity={0.5} />
                <Label x={620 + s} y={m.y + m.r + 34} size={26} color={m.color} weight={600}>
                  {m.m}
                </Label>
                <Trace x0={820} x1={1500} y={m.y} f={m.f} amp={50} t={t - cue(5)} color={m.color} />
              </g>
            );
          })}
        </g>

        {/* Fase E */}
        <g opacity={pE}>
          {[0, 1].map((i) => {
            const isD = i === 1;
            const appear = isD ? ramp(t, wordOf(10, 'deuterium') - 0.3, wordOf(10, 'deuterium') + 0.6, BACK) : 1;
            const f = isD ? mix(0.9, 0.9 * 0.717, dMorph) : 0.9;
            const y = isD ? 650 : 380;
            const s = 34 * Math.sin(2 * Math.PI * f * t);
            return (
              <g key={i} opacity={appear}>
                <Spring x1={360} y1={y} x2={640 + s} y2={y} coils={8} amp={16} />
                <Atom x={360} y={y} el="Cl" r={60} />
                {isD ? (
                  <>
                    <Atom x={640 + s} y={y} el="H" r={mix(32, 40, dMorph)} opacity={1 - ramp(dMorph, 0.3, 0.7)} />
                    <Atom x={640 + s} y={y} el="D" r={mix(32, 40, dMorph)} opacity={ramp(dMorph, 0.3, 0.7)} />
                  </>
                ) : (
                  <Atom x={640 + s} y={y} el="H" r={32} />
                )}
                <Trace x0={800} x1={1420} y={y} f={f} amp={44} t={t} color={isD ? C.violet : C.mint} />
                <g opacity={readout}>
                  <Label x={1460} y={y - 20} size={40} weight={700} color={isD ? C.violet : C.mint} anchor="start" font="mono">
                    {isD ? '2091' : '2886'}
                  </Label>
                  <Label x={1460} y={y + 22} size={22} color={C.muted} anchor="start">
                    cm⁻¹ · {isD ? 'D–Cl' : 'H–Cl'}
                  </Label>
                </g>
              </g>
            );
          })}
        </g>
      </Stage>

      {/* Kartu fase A */}
      <Card x={600} y={760} opacity={pA * twoCards} scale={0.8 + 0.2 * twoCards} accent={C.gold}>
        <div style={{fontSize: 40}}>
          <V color={C.gold}>k</V> <span style={{fontSize: 28, color: C.muted}}>kekakuan ikatan</span>
        </div>
      </Card>
      <Card x={1320} y={760} opacity={pA * ramp(t, cue(1) + 0.7, cue(1) + 1.4)} accent={C.cyan}>
        <div style={{fontSize: 40}}>
          <V color={C.cyan}>m</V> <span style={{fontSize: 28, color: C.muted}}>massa atom</span>
        </div>
      </Card>

      <Card x={1720} y={170} opacity={pB * kFaster} scale={0.8 + 0.2 * kFaster} accent={C.gold} anchor="right">
        <div style={{fontSize: 38}}>
          <V color={C.gold}>k</V> ↑ &nbsp;⇒&nbsp; <V color={C.gold}>ν</V> ↑
        </div>
      </Card>
      <Card x={1720} y={170} opacity={pC * heavyFocus} accent={C.cyan} anchor="right">
        <div style={{fontSize: 38}}>
          <V color={C.cyan}>m</V> ↑ &nbsp;⇒&nbsp; <V color={C.cyan}>ν</V> ↓
        </div>
      </Card>

      {/* Fase D: rumus */}
      <Card x={960} y={mix(500, 300, nu)} opacity={pD * mu} scale={mix(0.85, 1, mu) * mix(1, 0.8, nu)} accent={C.cyan}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, fontSize: 60}}>
          <V color={C.cyan}>μ</V> =
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 52}}>
            <div style={{padding: '0 10px', borderBottom: `3px solid ${C.ink}`}}>
              <V>m</V>
              <sub style={{fontSize: 28}}>1</sub> <V>m</V>
              <sub style={{fontSize: 28}}>2</sub>
            </div>
            <div style={{padding: '0 10px'}}>
              <V>m</V>
              <sub style={{fontSize: 28}}>1</sub> + <V>m</V>
              <sub style={{fontSize: 28}}>2</sub>
            </div>
          </div>
        </div>
        <div style={{fontSize: 22, color: C.muted, textAlign: 'center', marginTop: 6}}>massa tereduksi</div>
      </Card>
      <Card x={960} y={640} opacity={pD * nu} scale={mix(0.7, 1.1, nu)} accent={C.gold} style={{padding: '26px 50px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 84}}>
          <V color={C.gold}>ν</V>
          <span>=</span>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 48}}>
            <div style={{borderBottom: `3px solid ${C.ink}`, padding: '0 8px'}}>1</div>
            <div style={{padding: '0 8px'}}>
              2<V>π</V>
            </div>
          </div>
          <span style={{fontSize: 110, fontWeight: 200, marginRight: -10}}>√</span>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 60, borderTop: `3px solid ${C.ink}`, paddingTop: 4}}>
            <div style={{borderBottom: `3px solid ${C.ink}`, padding: '0 14px'}}>
              <V color={C.gold}>k</V>
            </div>
            <div style={{padding: '0 14px'}}>
              <V color={C.cyan}>μ</V>
            </div>
          </div>
        </div>
      </Card>

      {/* Fase F: menghitung konstanta gaya dari spektrum */}
      <Card x={960} y={270} opacity={pF} scale={0.9 + 0.1 * pF} accent={C.gold} style={{padding: '18px 40px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28, fontSize: 46}}>
          <span style={{opacity: 1 - 0.5 * ramp(t, cue(12) + 1, cue(12) + 1.6)}}>
            <V color={C.gold}>ν</V> = <span style={{fontSize: 34}}>1/2π</span> √(<V color={C.gold}>k</V>/<V color={C.cyan}>μ</V>)
          </span>
          <span style={{color: C.gold, opacity: ramp(t, cue(12) + 0.8, cue(12) + 1.3)}}>⟶</span>
          <span style={{opacity: ramp(t, cue(12) + 1, cue(12) + 1.6)}}>
            <V color={C.gold}>k</V> = <V color={C.cyan}>μ</V> (2π<V>c</V>
            <V>ν̃</V>)²
          </span>
        </div>
      </Card>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 560,
          transform: 'translate(-50%, -50%)',
          opacity: ramp(t, cue(13) - 0.2, cue(13) + 0.5),
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: FONT.mono,
          fontSize: 34,
          color: C.ink,
          padding: '26px 44px',
          borderRadius: 22,
          background: 'rgba(10,15,34,0.85)',
          border: `1px solid ${C.faint}`,
          whiteSpace: 'nowrap',
        }}
      >
        {[
          [wordOf(13, 'delapan'), <>ν̃ = <span style={{color: C.mint}}>2886 cm⁻¹</span>  →  ν = c·ν̃ = 8,65 × 10¹³ Hz</>],
          [wordOf(13, 'menghitung'), <>μ(H–Cl) = (1,008 × 34,97)/(1,008 + 34,97) u = 1,63 × 10⁻²⁷ kg</>],
          [wordOf(13, 'kira-kira'), <>k = μ(2πν)² ≈ <span style={{color: C.gold, fontWeight: 600, fontSize: 44, textShadow: `0 0 ${18 * ramp(t, cue(14), cue(14) + 0.6)}px ${C.gold}`}}>480 N/m</span></>],
        ].map(([at, row], i) => {
          const p = ramp(t, (at as number) - 0.2, (at as number) + 0.5);
          return (
            <div key={i} style={{opacity: p, translate: `${(1 - p) * -20}px 0px`}}>
              {row as React.ReactNode}
            </div>
          );
        })}
      </div>
      <Card x={960} y={790} opacity={ramp(t, cue(14), cue(14) + 0.6)} accent={C.gold} style={{padding: '12px 30px'}}>
        <div style={{fontSize: 30}}>
          spektrum <span style={{color: C.muted}}>→</span> <span style={{color: C.gold, fontWeight: 600}}>kekuatan ikatan kimia</span>
        </div>
      </Card>

      {/* Fase E: rasio */}
      <Card x={960} y={515} opacity={pE * readout} accent={C.violet}>
        <div style={{fontSize: 32}}>
          <span style={{color: C.violet, fontWeight: 700, fontFamily: FONT.mono}}>2091 / 2886 ≈ 0,72</span>
          <span style={{color: C.muted}}> · ikatan sama, atom lebih berat</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
