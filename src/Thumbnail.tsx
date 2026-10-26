import React from 'react';
import {AbsoluteFill} from 'remotion';
import {sample, smoothPath} from './anim';
import {Atom, Glow, Spring, Stage} from './components/primitives';
import {Fingerprint} from './components/viz';
import {C, FONT, H, W} from './theme';

/** Gambar sampul video (2560×1440 lewat skala 4/3, lihat Root.tsx). */
const Cover: React.FC = () => {
  const wave = smoothPath(sample((x) => 760 + 26 * Math.sin(x * 0.03) * Math.sin((x / W) * Math.PI), 1000, 1840, 200));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 70% 45%, #1d2a5a 0%, ${C.bg2} 45%, ${C.bg} 100%)`}}>
      <Stage>
        <Glow x={1390} y={470} r={560} color="gold" opacity={0.28} />
        <Fingerprint x={1390} y={470} scale={1.5} p={1} opacity={0.5} width={2.6} />
        {/* jejak getaran */}
        {[-36, -18, 0].map((dx, k) => (
          <g key={k} opacity={0.25 + k * 0.35}>
            <Spring x1={1150} y1={470} x2={1560 + dx} y2={470} coils={9} amp={20} width={6} />
            <Atom x={1560 + dx} y={470} el="H" r={50} label={k === 2 ? 'H' : ''} glow={k === 2 ? 1 : 0} />
          </g>
        ))}
        <Atom x={1150} y={470} el="Cl" r={92} />
        <path d={wave} fill="none" stroke={C.cyan} strokeWidth={5} filter="url(#glow)" />
      </Stage>
      <div style={{position: 'absolute', left: 110, top: 250, width: 900}}>
        <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 8, color: C.gold}}>KIMIA KUANTUM</div>
        <div style={{fontFamily: FONT.sans, fontSize: 74, fontWeight: 800, color: C.ink, lineHeight: 1.05, marginTop: 10}}>Gerak Vibrasi</div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 132,
            fontWeight: 800,
            color: C.gold,
            lineHeight: 1,
            marginTop: 24,
            textShadow: '0 0 50px rgba(255,194,74,0.45)',
          }}
        >
          Sidik Jari
          <br />
          Molekul
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 44}}>
          {[
            ['teori dasar', C.cyan],
            ['spektroskopi IR', C.violet],
            ['industri', C.amber],
          ].map(([t, col]) => (
            <div key={t} style={{padding: '10px 22px', borderRadius: 999, border: `2px solid ${col}`, color: col, fontFamily: FONT.sans, fontWeight: 600, fontSize: 30}}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${2560 / W})`, transformOrigin: '0 0'}}>
      <Cover />
    </div>
  </AbsoluteFill>
);
