import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {interpolateColors} from 'remotion';
import {Arrow, Atom, Badge, Bond, Card, Glow, Label, Ripple, Stage} from '../components/primitives';
import {PhotonPacket} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

type Mode = 'sym' | 'asym' | 'bend' | 'mix';

/** Molekul CO₂ dengan mode getaran tertentu + panah dipol total. */
const CO2: React.FC<{x: number; y: number; mode: Mode; t: number; s?: number; dipole?: number; glow?: number; f?: number}> = ({x, y, mode, t, s = 1, dipole = 0, glow = 0, f = 0.7}) => {
  const L = 150 * s;
  const w = Math.sin(2 * Math.PI * f * t);
  const a = 32 * s;
  let o1 = [-L, 0];
  let o2 = [L, 0];
  let c = [0, 0];
  let mu: [number, number] = [0, 0];
  if (mode === 'sym') {
    o1 = [-L - a * w, 0];
    o2 = [L + a * w, 0];
  } else if (mode === 'asym') {
    o1 = [-L + a * w, 0];
    o2 = [L + a * w, 0];
    c = [-1.5 * a * w, 0];
    mu = [-w * 120 * s, 0];
  } else if (mode === 'bend') {
    c = [0, -a * w];
    o1 = [-L, 0.55 * a * w];
    o2 = [L, 0.55 * a * w];
    mu = [0, w * 90 * s];
  } else {
    const w2 = Math.sin(2 * Math.PI * 1.13 * t + 1);
    const w3 = Math.sin(2 * Math.PI * 0.53 * t + 2);
    o1 = [-L - a * 0.6 * w + a * 0.5 * w2, 0.5 * a * w3];
    o2 = [L + a * 0.6 * w + a * 0.5 * w2, 0.5 * a * w3];
    c = [-a * 0.7 * w2, -a * w3];
  }
  const P = (p: number[]) => [x + p[0], y + p[1]];
  const [O1, CC, O2] = [P(o1), P(c), P(o2)];
  return (
    <g>
      {glow > 0 ? <Glow x={x} y={y} r={260 * s} color="gold" opacity={glow} /> : null}
      <Bond x1={O1[0]} y1={O1[1]} x2={CC[0]} y2={CC[1]} order={2} width={15 * s} />
      <Bond x1={CC[0]} y1={CC[1]} x2={O2[0]} y2={O2[1]} order={2} width={15 * s} />
      <Atom x={O1[0]} y={O1[1]} el="O" r={46 * s} />
      <Atom x={CC[0]} y={CC[1]} el="C" r={42 * s} />
      <Atom x={O2[0]} y={O2[1]} el="O" r={46 * s} />
      {dipole > 0 ? (
        <g opacity={dipole}>
          {Math.hypot(mu[0], mu[1]) > 4 ? (
            <Arrow x1={x} y1={y + 130 * s} x2={x + mu[0]} y2={y + 130 * s + mu[1]} color="gold" width={7 * s} />
          ) : null}
          <circle cx={x} cy={y + 130 * s} r={7 * s} fill={C.gold} />
          <Label x={x} y={y + 205 * s} size={26 * s} color={C.gold} font="serif" italic>
            {mode === 'sym' ? 'μ total = 0' : 'μ total berubah'}
          </Label>
        </g>
      ) : null}
    </g>
  );
};

export const Co2: React.FC = () => {
  const {t, cue} = useScene();
  const panelsOn = ramp(t, cue(4) - 0.6, cue(4) + 0.6, EASE_IN_OUT);
  const earth = ramp(t, cue(9) - 0.3, cue(9) + 1.2, EASE_IN_OUT);
  const intro = 1 - panelsOn;
  const modeCard = win(t, cue(1), cue(4) - 0.5, 0.6, 0.5);
  const count = ramp(t, cue(2) + 0.2, cue(2) + 1, BACK);
  const four = ramp(t, cue(3) + 1.2, cue(3) + 2, BACK);

  const panels = [
    {mode: 'sym' as Mode, x: 380, title: 'regangan simetris', on: cue(4), badge: cue(5) + 0.4, active: false, nu: 'tidak aktif IR'},
    {mode: 'asym' as Mode, x: 960, title: 'regangan asimetris', on: cue(6), badge: cue(7) + 0.6, active: true, nu: 'aktif · 2349 cm⁻¹'},
    {mode: 'bend' as Mode, x: 1540, title: 'tekuk (×2)', on: cue(8), badge: cue(8) + 1.4, active: true, nu: 'aktif · 667 cm⁻¹'},
  ];
  const py = mix(500, 360, earth);
  const ps = mix(1, 0.72, earth);

  // fase Bumi: radiasi panas naik
  const heat = [0, 1, 2, 3, 4].map((k) => {
    const period = 3.2;
    const ph = ((t - cue(9) - 0.6 + k * 0.64) % period) / period;
    return {x: 360 + k * 300, ph};
  });

  return (
    <AbsoluteFill>
      <Stage>
        {/* pembuka: CO2 bergetar campuran */}
        <g opacity={intro}>
          <CO2 x={960} y={480} mode="mix" t={t} s={1.35} />
        </g>

        {/* tiga panel mode */}
        <g opacity={panelsOn}>
          {panels.map((p, i) => {
            const on = ramp(t, p.on - 0.3, p.on + 0.6, BACK);
            const focus = ramp(t, p.on - 0.5, p.on - 0.1) * (i === 2 ? 1 : 1 - ramp(t, panels[i + 1].on - 0.5, panels[i + 1].on - 0.1));
            const ef = ramp(earth, 0.3, 0.7);
            const dip = ramp(t, p.badge - 1.4, p.badge - 0.6);
            const hl = 0.25 * focus * (1 - ef);
            return (
              <g key={i} opacity={on * mix(0.55, 1, Math.max(focus, ef))}>
                <rect x={p.x - 270 * ps} y={py - 190 * ps} width={540 * ps} height={430 * ps} rx={26} fill="rgba(14,20,42,0.55)" stroke={interpolateColors(focus * (1 - ef), [0, 1], [C.faint, C.gold])} strokeWidth={2} />
                <Label x={p.x} y={py - 150 * ps} size={30 * ps} weight={600} color={C.ink}>
                  {p.title}
                </Label>
                <CO2 x={p.x} y={py} mode={p.mode} t={t} s={0.9 * ps} dipole={dip} glow={hl} f={p.mode === 'bend' ? 0.5 : p.mode === 'sym' ? 0.6 : 0.85} />
              </g>
            );
          })}
        </g>

        {/* Bumi dan efek rumah kaca */}
        <g opacity={earth}>
          <defs>
            <radialGradient id="earthgrad" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#3a6fd8" />
              <stop offset="40%" stopColor="#173a7a" />
              <stop offset="100%" stopColor="#081633" />
            </radialGradient>
          </defs>
          <ellipse cx={960} cy={1560} rx={1500} ry={760} fill="url(#earthgrad)" />
          <ellipse cx={960} cy={1560} rx={1500} ry={760} fill="none" stroke="#7fb4ff" strokeWidth={4} opacity={0.7} filter="url(#glow)" />
          <ellipse cx={960} cy={1560} rx={1540} ry={800} fill="none" stroke="#7fb4ff" strokeWidth={30} opacity={0.08} />
          {heat.map((h, k) => {
            const y = mix(820, 470, h.ph);
            const hitCO2 = k % 2 === 0;
            const absorbedAt = 0.45;
            const vis = hitCO2 && h.ph > absorbedAt ? 0 : 1;
            return (
              <PhotonPacket key={k} x={h.x} y={y} wavelength={46} color={C.red} amp={16} len={160} angle={-90} opacity={vis * (h.ph < 0.05 ? h.ph * 20 : 1)} phase={-t * 10} />
            );
          })}
          {/* riak panas saat CO₂ menyerap foton IR */}
          {heat.map((h, k) =>
            k % 2 === 0 ? <Ripple key={`rp${k}`} x={h.x} y={640} p={(h.ph - 0.45) / 0.45} r={150} color={C.red} rings={2} /> : null,
          )}
          {heat.map((h, k) => {
            const isCO2 = k % 2 === 0;
            const hit = isCO2 && h.ph > 0.45 ? Math.max(0, 1 - (h.ph - 0.45) * 2.5) : 0;
            return isCO2 ? (
              <g key={`m${k}`}>
                <CO2 x={h.x} y={640} mode="asym" t={t} s={0.42} glow={hit * 0.9} f={0.9 + hit * 2} />
              </g>
            ) : (
              <g key={`m${k}`}>
                <Bond x1={h.x - 40} y1={640} x2={h.x + 40} y2={640} order={k === 1 ? 3 : 2} width={7} />
                <Atom x={h.x - 40} y={640} el={k === 1 ? 'N' : 'O'} r={22} label="" />
                <Atom x={h.x + 40} y={640} el={k === 1 ? 'N' : 'O'} r={22} label="" />
              </g>
            );
          })}
        </g>
      </Stage>

      <Card x={960} y={260} opacity={modeCard} accent={C.cyan}>
        <div style={{fontSize: 40, fontWeight: 600, color: C.cyan, textAlign: 'center'}}>mode normal</div>
        <div style={{fontSize: 24, color: C.muted, textAlign: 'center'}}>pola getaran dasar yang independen</div>
      </Card>
      <div style={{position: 'absolute', left: 960, top: 790, transform: 'translate(-50%,-50%)', display: 'flex', gap: 30, opacity: modeCard * count}}>
        {[
          ['linear', '3N − 5'],
          ['tak linear', '3N − 6'],
        ].map(([k, f]) => (
          <div key={k} style={{padding: '14px 30px', borderRadius: 16, border: `1px solid ${C.faint}`, background: 'rgba(12,18,40,0.8)', textAlign: 'center'}}>
            <div style={{fontSize: 22, color: C.muted, fontFamily: FONT.sans}}>{k}</div>
            <div style={{fontSize: 46, fontFamily: FONT.serif, fontStyle: 'italic', color: C.ink}}>{f}</div>
          </div>
        ))}
        <div style={{padding: '14px 30px', borderRadius: 16, border: `2px solid ${C.gold}`, background: 'rgba(40,28,8,0.8)', textAlign: 'center', opacity: four, scale: String(0.8 + 0.2 * four)}}>
          <div style={{fontSize: 22, color: C.gold, fontFamily: FONT.sans}}>CO₂ (N = 3, linear)</div>
          <div style={{fontSize: 46, fontFamily: FONT.mono, color: C.gold, fontWeight: 600}}>9 − 5 = 4</div>
        </div>
      </div>

      {panels.map((p, i) => {
        const b = ramp(t, p.badge, p.badge + 0.5, BACK);
        return (
          <Badge
            key={i}
            x={p.x}
            y={py + 300 * ps}
            text={p.nu.toUpperCase()}
            color={p.active ? C.mint : C.red}
            opacity={panelsOn * b * (1 - earth)}
            scale={0.75 + 0.2 * b}
          />
        );
      })}
      <Card x={1090} y={175} opacity={earth * ramp(t, cue(9) + 1.5, cue(9) + 2.2)} accent={C.red} style={{fontSize: 28}}>
        CO₂ menyerap <span style={{color: C.red, fontWeight: 600}}>radiasi panas (IR)</span> dari Bumi · N₂ &amp; O₂ meloloskannya
      </Card>
    </AbsoluteFill>
  );
};

