// Adegan uji gaya "ilustrasi vektor matang" (mengikuti video referensi):
// objek nyata yang dilukis vektor (botol PET) → kamera menyelam ke penampang dinding →
// rantai polimer yang terus bergetar → sinar inframerah menembus, ikatan C=O menyerap →
// deretan angka detektor ala "100 81 62 84 100" → spektrum = sidik jari molekul.
// Semua gerak berbasis frame; tidak masuk film utama. Komposisi: "UjiGayaVektor".
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

export const UJI_FPS = 30;
export const UJI_DUR = 21;

const EASE = Easing.bezier(0.45, 0, 0.2, 1);
const ramp = (t: number, a: number, b: number, e: (x: number) => number = EASE) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const rnd = (k: number) => {
  const s = Math.sin(k * 12.9898 + 4.1) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------- teks layar
type Wd = {w: string; k?: boolean};
const LINES: {at: number; words: Wd[]}[] = [
  {at: 0.4, words: [{w: 'Botol'}, {w: 'plastik', k: true}, {w: 'ini'}]},
  {at: 2.0, words: [{w: 'kelihatan'}, {w: 'diam,', k: true}]},
  {at: 4.2, words: [{w: 'tapi'}, {w: 'di'}, {w: 'dalam'}, {w: 'dindingnya,', k: true}]},
  {at: 6.3, words: [{w: 'rantai'}, {w: 'molekulnya'}, {w: 'terus'}, {w: 'bergetar.', k: true}]},
  {at: 9.0, words: [{w: 'Sinar'}, {w: 'inframerah', k: true}, {w: 'lewat,'}]},
  {at: 10.9, words: [{w: 'ikatan'}, {w: 'yang'}, {w: 'iramanya'}, {w: 'cocok'}, {w: 'menyerapnya,', k: true}]},
  {at: 13.2, words: [{w: 'dan'}, {w: 'detektor', k: true}, {w: 'mencatat'}, {w: 'sisanya.'}]},
  {at: 15.6, words: [{w: 'Polanya'}, {w: 'jadi'}]},
  {at: 17.0, words: [{w: 'sidik', k: true}, {w: 'jari', k: true}, {w: 'molekul.'}]},
];

const Caption: React.FC<{t: number}> = ({t}) => {
  const idx = LINES.findIndex((l, i) => t >= l.at && (i === LINES.length - 1 || t < LINES[i + 1].at));
  if (idx < 0) return null;
  const line = LINES[idx];
  const end = idx === LINES.length - 1 ? UJI_DUR - 0.4 : LINES[idx + 1].at;
  const out = 1 - ramp(t, end - 0.22, end);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center', opacity: out}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 14px', maxWidth: 1300}}>
        {line.words.map((wd, i) => {
          const s = line.at + i * 0.18;
          const p = ramp(t, s, s + 0.26);
          const box = wd.k ? ramp(t, s + 0.1, s + 0.42) : 0;
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                fontFamily: FONT.sans,
                fontSize: 60,
                lineHeight: 1.25,
                fontWeight: wd.k ? 700 : 400,
                color: wd.k ? '#ffffff' : 'rgba(208,212,224,0.72)',
                opacity: p,
                filter: `blur(${(1 - p) * 8}px)`,
                transform: `translateY(${(1 - p) * 14}px)`,
                padding: '0 6px',
                textShadow: '0 4px 18px rgba(0,0,0,0.55)',
              }}
            >
              {wd.w}
              {wd.k ? (
                <span style={{position: 'absolute', inset: '6px -2px 4px -2px', border: '2.5px solid #6fa6ff', opacity: box, transform: `scale(${0.9 + 0.1 * box})`}}>
                  {[0, 1].map((j) => (
                    <span
                      key={j}
                      style={{position: 'absolute', width: 11, height: 11, borderRadius: 11, background: '#fff', border: '2.5px solid #6fa6ff', left: j ? undefined : -7, right: j ? -7 : undefined, top: j ? undefined : -7, bottom: j ? -7 : undefined}}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// label bergaris penunjuk (gaya referensi)
const Callout: React.FC<{x: number; y: number; text: string; len: number; o: number; side?: 'up' | 'down' | 'right'}> = ({x, y, text, len, o, side = 'up'}) => {
  if (o <= 0.001) return null;
  const L = len * o;
  const up = side === 'up';
  if (side === 'right')
    return (
      <div style={{position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, top: -1, width: L, height: 2, background: 'rgba(240,242,248,0.85)'}} />
        <div style={{position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 10, background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.7)'}} />
        <div style={{position: 'absolute', left: L + 12, top: 0, transform: 'translateY(-50%)', fontFamily: FONT.sans, fontWeight: 700, fontSize: 21, letterSpacing: 5, color: '#f1f3f8', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.9)', background: 'rgba(15,16,20,0.55)', padding: '4px 10px', borderRadius: 4}}>
          {text}
        </div>
      </div>
    );
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -1, top: up ? -L : 0, width: 2, height: L, background: 'rgba(240,242,248,0.85)'}} />
      <div style={{position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 10, background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.7)'}} />
      <div style={{position: 'absolute', left: 0, top: up ? -L - 32 : L + 8, transform: 'translateX(-50%)', fontFamily: FONT.sans, fontWeight: 700, fontSize: 21, letterSpacing: 5, color: '#f1f3f8', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>
        {text}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- definisi warna bersama
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="v-c" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#c9cfdc" />
      <stop offset="35%" stopColor="#6d7486" />
      <stop offset="100%" stopColor="#1e2129" />
    </radialGradient>
    <radialGradient id="v-o" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#ffd0d4" />
      <stop offset="35%" stopColor="#e2505f" />
      <stop offset="100%" stopColor="#5a1219" />
    </radialGradient>
    <radialGradient id="v-glow">
      <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.9" />
      <stop offset="40%" stopColor="#ffb14a" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#ff8a2a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="v-photon">
      <stop offset="0%" stopColor="#fff6e4" stopOpacity="1" />
      <stop offset="45%" stopColor="#ffc77a" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#ff8a3a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="v-shadow">
      <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
      <stop offset="100%" stopColor="#000" stopOpacity="0" />
    </radialGradient>
    {/* plastik bening: tepi terang, tengah gelap transparan */}
    <linearGradient id="v-plastic" x1="0" x2="1">
      <stop offset="0%" stopColor="#cfe3f5" stopOpacity="0.55" />
      <stop offset="10%" stopColor="#7fa2c2" stopOpacity="0.28" />
      <stop offset="45%" stopColor="#2a3a4c" stopOpacity="0.18" />
      <stop offset="78%" stopColor="#4c6782" stopOpacity="0.22" />
      <stop offset="94%" stopColor="#bcd6ee" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#e9f4ff" stopOpacity="0.7" />
    </linearGradient>
    <linearGradient id="v-cap" x1="0" x2="1">
      <stop offset="0%" stopColor="#0f3a6e" />
      <stop offset="30%" stopColor="#3f86d6" />
      <stop offset="55%" stopColor="#1f5fa8" />
      <stop offset="100%" stopColor="#0a2244" />
    </linearGradient>
    <linearGradient id="v-label" x1="0" x2="1">
      <stop offset="0%" stopColor="#0d2f57" />
      <stop offset="35%" stopColor="#2a6db7" />
      <stop offset="60%" stopColor="#1d5296" />
      <stop offset="100%" stopColor="#081c36" />
    </linearGradient>
    <linearGradient id="v-sweep" x1="0" x2="1">
      <stop offset="0%" stopColor="#fff" stopOpacity="0" />
      <stop offset="50%" stopColor="#fff" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    {/* lapisan penampang */}
    <linearGradient id="v-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e8f1fb" stopOpacity="0.85" />
      <stop offset="30%" stopColor="#9ab3cc" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#3b4c60" stopOpacity="0.5" />
    </linearGradient>
    <linearGradient id="v-core" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#25344a" stopOpacity="0.85" />
      <stop offset="50%" stopColor="#1a2433" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#2b3b52" stopOpacity="0.85" />
    </linearGradient>
    <linearGradient id="v-ray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ff7b39" stopOpacity="0" />
      <stop offset="25%" stopColor="#ff8f45" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#ffb85c" stopOpacity="0.75" />
    </linearGradient>
    <linearGradient id="v-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8d93a1" />
      <stop offset="45%" stopColor="#3a3e48" />
      <stop offset="100%" stopColor="#15171c" />
    </linearGradient>
    <pattern id="v-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="2" />
    </pattern>
  </defs>
);

// ---------------------------------------------------------------- shot 1: botol PET
const BOTTLE =
  'M-62,-300 L-62,-262 C-62,-238 -70,-226 -86,-206 C-130,-150 -140,-110 -140,-60 L-140,40 C-128,52 -128,72 -140,84 L-140,236 C-140,262 -122,286 -96,290 C-60,296 -30,300 0,300 C30,300 60,296 96,290 C122,286 140,262 140,236 L140,84 C128,72 128,52 140,40 L140,-60 C140,-110 130,-150 86,-206 C70,-226 62,-238 62,-262 L62,-300 Z';

const Bottle: React.FC<{t: number}> = ({t}) => {
  const sweep = ((t * 0.45) % 1.6) - 0.3;
  return (
    <g>
      <ellipse cx={14} cy={318} rx={190} ry={26} fill="url(#v-shadow)" />
      <clipPath id="v-bottle-clip">
        <path d={BOTTLE} />
      </clipPath>
      {/* isi air: sedikit bergoyang, gelembung naik */}
      <g clipPath="url(#v-bottle-clip)">
        <path d={`M-160,${-40 + 6 * Math.sin(t * 2)} Q0,${-52 - 8 * Math.sin(t * 2)} 160,${-40 + 6 * Math.sin(t * 2 + 1)} L160,320 L-160,320 Z`} fill="#2f6fae" opacity={0.28} />
        <path d={`M-160,${-40 + 6 * Math.sin(t * 2)} Q0,${-52 - 8 * Math.sin(t * 2)} 160,${-40 + 6 * Math.sin(t * 2 + 1)}`} fill="none" stroke="#bfe0ff" strokeWidth={3} opacity={0.5} />
        {Array.from({length: 14}, (_, i) => {
          const y = 280 - ((t * (30 + rnd(i) * 40) + rnd(i + 3) * 300) % 310);
          return <circle key={i} cx={-110 + rnd(i + 1) * 220 + 6 * Math.sin(t * 2 + i)} cy={y} r={2 + rnd(i + 2) * 4} fill="none" stroke="#d8ecff" strokeWidth={1.5} opacity={0.5} />;
        })}
      </g>
      <path d={BOTTLE} fill="url(#v-plastic)" stroke="#d9ecff" strokeOpacity={0.45} strokeWidth={2} />
      {/* rusuk badan */}
      {[-30, 0, 30].map((y) => (
        <path key={y} d={`M-138,${y + 120} Q0,${y + 132} 138,${y + 120}`} fill="none" stroke="#e6f2ff" strokeOpacity={0.18} strokeWidth={3} />
      ))}
      {/* label */}
      <g clipPath="url(#v-bottle-clip)">
        <rect x={-142} y={100} width={284} height={110} fill="url(#v-label)" />
        <rect x={-142} y={100} width={284} height={4} fill="#9cc7ff" opacity={0.6} />
        <rect x={-142} y={206} width={284} height={4} fill="#03101f" opacity={0.6} />
        <text x={0} y={152} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={40} fill="#ffffff" letterSpacing={6}>
          PET
        </text>
        <text x={0} y={186} textAnchor="middle" fontFamily={FONT.sans} fontWeight={500} fontSize={13} fill="#cfe3ff" letterSpacing={2.5}>
          POLIETILENA TEREFTALAT
        </text>
        {/* sorot cahaya yang lewat */}
        <rect x={-140 + sweep * 320} y={-320} width={90} height={660} fill="url(#v-sweep)" transform="skewX(-18)" />
      </g>
      {/* kilap vertikal */}
      <path d="M-112,-40 L-112,250" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={10} strokeLinecap="round" />
      <path d="M-96,-10 L-96,230" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={4} strokeLinecap="round" />
      <path d="M118,-30 L118,240" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={5} strokeLinecap="round" />
      {/* tutup berulir */}
      <rect x={-72} y={-372} width={144} height={76} rx={10} fill="url(#v-cap)" />
      {Array.from({length: 17}, (_, i) => (
        <line key={i} x1={-64 + i * 8} y1={-366} x2={-64 + i * 8} y2={-302} stroke="#000" strokeOpacity={0.22} strokeWidth={2.5} />
      ))}
      <rect x={-72} y={-372} width={144} height={10} rx={5} fill="#8fc0ff" opacity={0.45} />
      <rect x={-80} y={-300} width={160} height={14} rx={6} fill="#1a4f8c" />
    </g>
  );
};

// ---------------------------------------------------------------- shot 2–3: penampang dinding
const SLAB = {top: 380, coreTop: 420, coreBot: 720, bot: 760};
const RACK = 820;
const SRC = 280; // rumah sumber sinar
const COLS = [440, 700, 960, 1220, 1480];
const FINAL = [100, 81, 62, 84, 100];
const ABSORB = [0, 0.55, 1, 0.45, 0]; // seberapa banyak C=O di bawah tiap kolom

type AtomP = {x: number; y: number; el: 'C' | 'O'; ph: number; carbonyl?: boolean; col?: number};
type Chain = {d: number; atoms: AtomP[]; bonds: [number, number, number][]};
const CHAINS: Chain[] = [0, 1, 2].map((row) => {
  const d = [0.78, 0.89, 1][row];
  const yb = [490, 585, 672][row];
  const sp = 80 * d;
  const atoms: AtomP[] = [];
  const bonds: [number, number, number][] = [];
  const n = Math.ceil(2900 / sp);
  for (let i = 0; i < n; i++) {
    const x = -300 + i * sp + row * 29;
    atoms.push({x, y: yb + (i % 2 ? -22 : 22) * d, el: 'C', ph: rnd(i * 7.1 + row)});
    if (i) bonds.push([i - 1, i, 1]);
  }
  // gugus karbonil (C=O): banyak di bawah kolom 2–4, sesekali di tempat lain
  const chainLen = atoms.length;
  for (let i = 1; i < chainLen; i += 2) {
    const a = atoms[i];
    const nearCol = COLS.findIndex((cx) => Math.abs(a.x - cx) < 90);
    const want = (nearCol >= 1 && nearCol <= 3 && rnd(i + row * 3) < 0.35 + ABSORB[nearCol] * 0.65) || ((a.x < 300 || a.x > 1620) && i % 5 === row + 1);
    if (!want) continue;
    const o = atoms.length;
    atoms.push({x: a.x, y: a.y + (i % 4 === 1 ? -62 : 62) * d, el: 'O', ph: rnd(i + 99), carbonyl: true, col: nearCol});
    bonds.push([i, o, 2]);
  }
  return {d, atoms, bonds};
});

const Section: React.FC<{t: number; camX: number; camY: number; z: number; beam: number; absorbT: number}> = ({t, camX, camY, z, beam, absorbT}) => {
  const layer = (pf: number, children: React.ReactNode, key: string) => (
    <g key={key} transform={`translate(960 540) scale(${z}) translate(${-camX * pf - 960 * (1 - pf)} ${-camY})`}>
      {children}
    </g>
  );
  const absorbing = (a: AtomP) => (a.carbonyl && a.col !== undefined && a.col >= 1 && a.col <= 3 ? ABSORB[a.col] * absorbT : 0);
  return (
    <g>
      {layer(
        1,
        <g>
          {/* bayangan & lapisan */}
          <rect x={-300} y={SLAB.bot} width={2900} height={60} fill="url(#v-shadow)" opacity={0.5} />
          <rect x={-300} y={SLAB.top} width={2900} height={SLAB.bot - SLAB.top} fill="url(#v-core)" />
          <rect x={-300} y={SLAB.top} width={2900} height={SLAB.bot - SLAB.top} fill="url(#v-hatch)" />
          <rect x={-300} y={SLAB.top} width={2900} height={SLAB.coreTop - SLAB.top} fill="url(#v-skin)" />
          <rect x={-300} y={SLAB.coreBot} width={2900} height={SLAB.bot - SLAB.coreBot} fill="url(#v-skin)" opacity={0.7} />
          <rect x={-300} y={SLAB.top} width={2900} height={3} fill="#ffffff" opacity={0.75} />
          <rect x={-300} y={SLAB.top + 6} width={2900} height={1.5} fill="#ffffff" opacity={0.3} />
          <rect x={-300} y={SLAB.bot - 2} width={2900} height={2} fill="#cfe2f6" opacity={0.5} />
          {/* rumah sumber inframerah di atas */}
          <rect x={-300} y={SRC - 40} width={2900} height={70} fill="url(#v-metal)" />
          <rect x={-300} y={SRC + 28} width={2900} height={3} fill="#c7ccd8" opacity={0.5} />
          {COLS.map((cx, i) => (
            <g key={i}>
              <rect x={cx - 40} y={SRC + 10} width={80} height={22} rx={6} fill="#0c0d10" />
              <rect x={cx - 34} y={SRC + 16} width={68} height={12} rx={4} fill="#ff9a4a" opacity={0.15 + 0.85 * beam} />
            </g>
          ))}
          {/* rak detektor di bawah */}
          <rect x={-300} y={RACK} width={2900} height={46} fill="url(#v-metal)" />
          <rect x={-300} y={RACK} width={2900} height={2} fill="#c7ccd8" opacity={0.6} />
          <rect x={-300} y={RACK + 46} width={2900} height={200} fill="#121318" />
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={-300} y={RACK + 120 + i * 12} width={2900} height={2} fill="#2a2d35" />
          ))}
          {Array.from({length: 72}, (_, i) => {
            const x = -300 + i * 40;
            const ci = COLS.findIndex((c) => Math.abs(c - (x + 20)) < 21);
            const lvl = ci >= 0 ? mix(1, FINAL[ci] / 100, absorbT) : 0;
            const base = ['#ff4d5e', '#4fdc7a', '#4f86ff'][i % 3];
            return (
              <g key={i}>
                <rect x={x + 5} y={RACK + 13} width={30} height={20} rx={5} fill={base} opacity={0.3 + 0.08 * Math.sin(t * 3 + i)} />
                {ci >= 0 && beam > 0 ? <rect x={x + 5} y={RACK + 13} width={30} height={20} rx={5} fill="#ffe3a0" opacity={beam * lvl} /> : null}
              </g>
            );
          })}
        </g>,
        'base',
      )}
      {/* rantai (paralaks per kedalaman) */}
      {CHAINS.map((ch, r) =>
        layer(
          0.85 + 0.15 * ch.d,
          <g opacity={0.55 + 0.45 * ch.d}>
            {(() => {
              const pos = ch.atoms.map((a, i) => {
                const k = absorbing(a);
                const amp = (3.5 + (a.carbonyl ? 3 : 0) + 14 * k) * ch.d;
                const f = a.carbonyl ? 3.1 : 2.2;
                return [a.x + amp * 0.5 * Math.sin(t * f * 3.14 + a.ph * 6.28), a.y + amp * Math.sin(t * f * 2.3 + a.ph * 9 + i)] as [number, number];
              });
              return (
                <>
                  {ch.bonds.map(([a, b, ord], i) => {
                    const [x1, y1] = pos[a];
                    const [x2, y2] = pos[b];
                    const k = Math.max(absorbing(ch.atoms[a]), absorbing(ch.atoms[b]));
                    const w = 12 * ch.d;
                    const offs = ord === 2 ? [-w * 0.6, w * 0.6] : [0];
                    return (
                      <g key={i}>
                        {offs.map((o, j) => (
                          <g key={j}>
                            <line x1={x1 + o} y1={y1} x2={x2 + o} y2={y2} stroke="#0b0d12" strokeWidth={w + 3} strokeLinecap="round" />
                            <line x1={x1 + o} y1={y1} x2={x2 + o} y2={y2} stroke={k > 0.05 ? '#ffc65a' : '#8a93a8'} strokeWidth={ord === 2 ? w * 0.7 : w} strokeLinecap="round" />
                            <line x1={x1 + o - 1} y1={y1 - 1.5} x2={x2 + o - 1} y2={y2 - 1.5} stroke="#fff" strokeOpacity={0.3} strokeWidth={w * 0.25} strokeLinecap="round" />
                          </g>
                        ))}
                      </g>
                    );
                  })}
                  {ch.atoms.map((a, i) => {
                    const k = absorbing(a);
                    const R = (a.el === 'O' ? 21 : 19) * ch.d;
                    return (
                      <g key={i}>
                        {k > 0.02 ? <circle cx={pos[i][0]} cy={pos[i][1]} r={R * (3.4 + 0.8 * Math.sin(t * 9 + i))} fill="url(#v-glow)" opacity={k} /> : null}
                        <circle cx={pos[i][0]} cy={pos[i][1]} r={R} fill={`url(#v-${a.el === 'O' ? 'o' : 'c'})`} />
                        <circle cx={pos[i][0] - R * 0.35} cy={pos[i][1] - R * 0.38} r={R * 0.22} fill="#fff" opacity={0.6} />
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </g>,
          `ch${r}`,
        ),
      )}
      {/* lengkung energi emas di atas permukaan: denyut getaran (pola berulang ala referensi) */}
      {layer(
        1,
        <g style={{filter: 'drop-shadow(0 0 6px rgba(255,190,80,0.8))'}}>
          {Array.from({length: 27}, (_, i) => {
            const x = -300 + i * 110 + 10;
            const ci = COLS.findIndex((c) => Math.abs(c - x) < 56);
            const big = ci >= 1 && ci <= 3 ? ABSORB[ci] * absorbT : 0;
            const h = 40 + 14 * Math.sin(t * 3.2 + i * 0.9) + 120 * big;
            const w = 40 + 30 * big;
            return (
              <g key={i} opacity={0.55 + 0.45 * big}>
                <path d={`M${x - w},${SLAB.top} C${x - w},${SLAB.top - h * 1.3} ${x + w},${SLAB.top - h * 1.3} ${x + w},${SLAB.top}`} fill="none" stroke="#ffc24a" strokeWidth={2.4 + 1.5 * big} />
                <path d={`M${x - w * 0.55},${SLAB.top} C${x - w * 0.55},${SLAB.top - h * 0.8} ${x + w * 0.55},${SLAB.top - h * 0.8} ${x + w * 0.55},${SLAB.top}`} fill="none" stroke="#ffd98a" strokeWidth={1.6} opacity={0.7} />
                <rect x={x - 10} y={SLAB.top - 4} width={20} height={9} rx={4} fill="#f4f6fb" opacity={0.85} />
              </g>
            );
          })}
        </g>,
        'arcs',
      )}
      {/* sinar inframerah: kolom cahaya turun dengan foton berjalan */}
      {beam > 0.001
        ? layer(
            1,
            <g style={{mixBlendMode: 'screen'}}>
              {COLS.map((cx, ci) => {
                const below = mix(1, FINAL[ci] / 100, absorbT);
                return (
                  <g key={ci} opacity={beam}>
                    <rect x={cx - 34} y={SRC + 30} width={68} height={SLAB.top - SRC - 30} fill="url(#v-ray)" />
                    <rect x={cx - 34} y={SLAB.bot} width={68} height={RACK - SLAB.bot} fill="#ffb85c" opacity={0.55 * below} />
                    {Array.from({length: 6}, (_, k) => {
                      const y = SRC + 30 + ((((t * 300 + k * 85 + ci * 37) % 510) + 510) % 510);
                      const inSlab = y > SLAB.top && y < SLAB.bot;
                      const after = y >= SLAB.bot;
                      const o = after ? below : inSlab ? mix(1, below, (y - SLAB.top) / (SLAB.bot - SLAB.top)) : 1;
                      return y < RACK ? <ellipse key={k} cx={cx} cy={y} rx={18} ry={34} fill="url(#v-photon)" opacity={0.9 * o} /> : null;
                    })}
                  </g>
                );
              })}
            </g>,
            'beam',
          )
        : null}
    </g>
  );
};

// atom O penyerap di dekat kolom tengah (untuk label)
const ABS_ATOM = (() => {
  for (const ch of CHAINS) {
    const a = ch.atoms.find((q) => q.carbonyl && q.col === 2);
    if (a) return {x: a.x, y: a.y, pf: 0.85 + 0.15 * ch.d};
  }
  return {x: COLS[2], y: 580, pf: 1};
})();

// ---------------------------------------------------------------- shot 4: spektrum
const DIPS: [number, number, number, string][] = [
  [0.18, 0.55, 0.018, 'C–H'],
  [0.46, 0.95, 0.012, 'C=O'],
  [0.63, 0.7, 0.014, 'C–O'],
  [0.72, 0.5, 0.01, ''],
  [0.86, 0.6, 0.008, ''],
];
const specY = (u: number) => DIPS.reduce((s, [c, h, w]) => s - h * Math.exp(-(((u - c) / w) ** 2)), 1) + 0.015 * Math.sin(u * 140);

// ---------------------------------------------------------------- komposisi
const DUST = Array.from({length: 60}, (_, i) => ({x: rnd(i) * 1920, y: rnd(i + 30) * 1080, r: 0.8 + rnd(i + 60) * 2.2, d: 0.2 + rnd(i + 90) * 0.8}));

export const UjiGayaVektor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // --- shot 1: botol, kamera mendorong, lalu menyelam ke dinding
  const s1 = 1 - ramp(t, 3.7, 4.4);
  const dive = ramp(t, 3.1, 4.4, Easing.in(Easing.cubic));
  const bz = mix(1.22, 1.4, ramp(t, 0, 3.2)) * mix(1, 9, dive);
  const brot = mix(-4, 3, ramp(t, 0, 4));
  const bFocus = {x: 1080, y: 560}; // titik di dinding botol yang dituju

  // --- shot 2–3: penampang
  const s2in = ramp(t, 3.7, 4.6);
  const s2out = ramp(t, 14.6, 15.6);
  const s2 = s2in * (1 - s2out);
  const camX = mix(mix(mix(640, 860, ramp(t, 3.7, 8.6)), 960, ramp(t, 8.6, 10.6)), 990, ramp(t, 10.6, 14.6));
  const camY = mix(mix(mix(585, 570, ramp(t, 3.7, 8.6)), 545, ramp(t, 8.6, 10.6)), 640, ramp(t, 12.4, 14.6));
  const z = mix(mix(mix(1.75, 1.35, ramp(t, 3.7, 7.5)), 0.98, ramp(t, 8.4, 10.4)), 1.05, ramp(t, 12.4, 14.6)) * (1 + 0.25 * s2out);
  const beam = ramp(t, 8.9, 9.8);
  const absorbT = ramp(t, 10.9, 12.6);

  // angka detektor
  const nums = FINAL.map((f) => Math.round(mix(100, f, ramp(t, 12.6, 14.0))));
  const numsOn = ramp(t, 12.4, 13.0) * (1 - ramp(t, 14.8, 15.5));

  // --- shot 4: spektrum
  const s4 = ramp(t, 15.2, 16.1);
  const draw = ramp(t, 15.5, 17.6, Easing.inOut(Easing.cubic));
  const sz = mix(1.12, 1.0, ramp(t, 15.2, 18)) + 0.03 * ramp(t, 18, UJI_DUR);
  const PX = (u: number) => 260 + u * 1400;
  const PY = (v: number) => 360 + (1 - v) * 380;
  const specPts: string[] = [];
  for (let i = 0; i <= 400 * draw; i++) {
    const u = i / 400;
    specPts.push(`${i ? 'L' : 'M'}${PX(u).toFixed(1)},${PY(specY(u)).toFixed(1)}`);
  }

  const fadeIn = ramp(t, 0, 0.6);
  const fadeOut = 1 - ramp(t, UJI_DUR - 0.5, UJI_DUR);

  // posisi layar untuk label (kamera penampang)
  const scr = (x: number, y: number, pf = 1) => ({x: 960 + (x - camX * pf - 960 * (1 - pf)) * z, y: 540 + (y - camY) * z});
  const lblSlab = ramp(t, 5.0, 5.7) * (1 - ramp(t, 8.4, 8.9));
  const lblBeam = ramp(t, 9.6, 10.2) * (1 - ramp(t, 12.2, 12.6));
  const lblAbs = ramp(t, 11.6, 12.1) * (1 - ramp(t, 14.4, 14.9));

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 42%, #2f3239 0%, #1d1f25 55%, #0f1013 100%)', opacity: fadeIn * fadeOut, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Defs />
        {/* shot 1 */}
        {s1 > 0.001 ? (
          <g opacity={s1} transform={`translate(960 600) scale(${bz}) rotate(${brot}) translate(${-(bFocus.x - 960) * dive} ${-(bFocus.y - 560) * dive})`}>
            <ellipse cx={0} cy={330} rx={560} ry={70} fill="#3a3e48" opacity={0.35} />
            <Bottle t={t} />
          </g>
        ) : null}

        {/* shot 2–3 */}
        {s2 > 0.001 ? (
          <g opacity={s2} style={{filter: s2in < 1 ? `blur(${(1 - s2in) * 10}px)` : undefined}}>
            <Section t={t} camX={camX} camY={camY} z={z} beam={beam} absorbT={absorbT} />
          </g>
        ) : null}

        {/* shot 4 */}
        {s4 > 0.001 ? (
          <g opacity={s4} transform={`translate(960 560) scale(${sz}) translate(-960 -560)`}>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <line key={v} x1={PX(0)} x2={PX(1)} y1={PY(v)} y2={PY(v)} stroke="#ffffff" strokeOpacity={0.07} strokeWidth={2} />
            ))}
            <line x1={PX(0)} x2={PX(1)} y1={PY(0) + 30} y2={PY(0) + 30} stroke="#9aa1b3" strokeOpacity={0.5} strokeWidth={2} />
            {draw > 0 ? <path d={`${specPts.join(' ')} L${PX(draw)},${PY(0) + 30} L${PX(0)},${PY(0) + 30} Z`} fill="#ffb14a" opacity={0.08} /> : null}
            <g style={{filter: 'drop-shadow(0 0 10px rgba(255,190,80,0.85))'}}>
              <path d={specPts.join(' ')} fill="none" stroke="#ffc65a" strokeWidth={5} strokeLinejoin="round" />
              <path d={specPts.join(' ')} fill="none" stroke="#fff4d6" strokeWidth={1.6} strokeLinejoin="round" />
            </g>
            {draw > 0 && draw < 1 ? <circle cx={PX(draw)} cy={PY(specY(draw))} r={9} fill="#fff" style={{filter: 'drop-shadow(0 0 10px #ffd27a)'}} /> : null}
            {DIPS.filter((d) => d[3]).map(([c, h, , name], i) => {
              const o = ramp(draw, c + 0.02, c + 0.08);
              return (
                <g key={i} opacity={o}>
                  <line x1={PX(c)} x2={PX(c)} y1={PY(1 - h) + 14} y2={PY(1 - h) + 70} stroke="#fff" strokeOpacity={0.8} strokeWidth={2} />
                  <circle cx={PX(c)} cy={PY(1 - h) + 10} r={5} fill="#fff" />
                  <text x={PX(c)} y={PY(1 - h) + 100} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={26} letterSpacing={4} fill="#f1f3f8">
                    {name}
                  </text>
                </g>
              );
            })}
            <text x={PX(0)} y={PY(0) + 70} fontFamily={FONT.sans} fontSize={20} fill="#9aa1b3" letterSpacing={3}>
              BILANGAN GELOMBANG →
            </text>
          </g>
        ) : null}

        {/* debu melayang (paralaks) */}
        {DUST.map((p, i) => (
          <circle key={i} cx={(p.x - t * 14 * p.d + 1920) % 1920} cy={(p.y - t * 6 * p.d + 1080) % 1080} r={p.r} fill="#e8ecf5" opacity={0.1 + 0.2 * p.d * (0.5 + 0.5 * Math.sin(t * 2 + i))} />
        ))}
      </svg>

      {/* label penunjuk */}
      <Callout {...scr(520, SLAB.top + 4)} len={60} text="DINDING LUAR" o={lblSlab * s2} />
      <Callout {...scr(CHAINS[2].atoms[13].x, CHAINS[2].atoms[13].y + 20, 0.85 + 0.15)} len={90} side="down" text="RANTAI PET" o={lblSlab * s2} />
      <Callout {...scr(COLS[4] + 34, (SRC + SLAB.top) / 2 + 10)} len={70} side="right" text="SINAR INFRAMERAH" o={lblBeam * s2} />
      <Callout {...scr(ABS_ATOM.x + 22, ABS_ATOM.y, ABS_ATOM.pf)} len={300} side="right" text="C=O MENYERAP" o={lblAbs * s2} />

      {/* angka detektor ala referensi */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: numsOn, pointerEvents: 'none'}}>
        {COLS.map((cx, i) => {
          const p = scr(cx, RACK + 90);
          return (
            <div key={i} style={{position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)', fontFamily: FONT.mono, fontSize: 44, fontWeight: 600, color: nums[i] < 100 ? '#ffd27a' : '#eef1f7', textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>
              {nums[i]}
            </div>
          );
        })}
        <div style={{position: 'absolute', right: 70, bottom: 120, fontFamily: FONT.sans, fontSize: 18, color: 'rgba(210,214,226,0.6)'}}>% cahaya tembus · nilai ilustrasi</div>
      </div>

      <div style={{position: 'absolute', left: 48, bottom: 36, fontFamily: FONT.sans, fontSize: 18, color: 'rgba(200,205,218,0.5)'}}>ilustrasi diperbesar</div>

      {/* butiran film */}
      <Img
        src={staticFile('uji-grain.png')}
        style={{position: 'absolute', left: -((frame * 37) % 384), top: -((frame * 53) % 384), width: 1920 + 768, height: 1080 + 768, objectFit: 'none', opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />

      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 260, background: 'linear-gradient(180deg, rgba(14,15,18,0.92) 0%, rgba(14,15,18,0.7) 55%, rgba(14,15,18,0) 100%)', pointerEvents: 'none'}} />
      <Caption t={t} />
    </AbsoluteFill>
  );
};
