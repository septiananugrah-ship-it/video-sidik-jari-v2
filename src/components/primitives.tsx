import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ATOM, C, FONT, H, W} from '../theme';

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
};

/** Definisi gradien & filter bersama. Pasang sekali di setiap <Stage>. */
export const Defs: React.FC = () => (
  <defs>
    {Object.entries(ATOM).map(([el, a]) => (
      <React.Fragment key={el}>
        <radialGradient id={`atom-${el}`} cx="36%" cy="32%" r="72%">
          <stop offset="0%" stopColor={shade(a.fill, 0.75)} />
          <stop offset="28%" stopColor={shade(a.fill, 0.2)} />
          <stop offset="70%" stopColor={a.fill} />
          <stop offset="100%" stopColor={shade(a.fill, -0.6)} />
        </radialGradient>
        <radialGradient id={`glow-${el}`}>
          <stop offset="0%" stopColor={a.glow} stopOpacity="0.55" />
          <stop offset="45%" stopColor={a.glow} stopOpacity="0.16" />
          <stop offset="100%" stopColor={a.glow} stopOpacity="0" />
        </radialGradient>
      </React.Fragment>
    ))}
    {[
      ['gold', C.gold],
      ['cyan', C.cyan],
      ['violet', C.violet],
      ['red', C.red],
      ['mint', C.mint],
      ['white', '#ffffff'],
    ].map(([k, col]) => (
      <radialGradient key={k} id={`soft-${k}`}>
        <stop offset="0%" stopColor={col} stopOpacity="0.9" />
        <stop offset="35%" stopColor={col} stopOpacity="0.35" />
        <stop offset="100%" stopColor={col} stopOpacity="0" />
      </radialGradient>
    ))}
    <linearGradient id="spring-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fff6dc" />
      <stop offset="50%" stopColor={C.gold} />
      <stop offset="100%" stopColor="#8a5a10" />
    </linearGradient>
    <linearGradient id="bond-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#c8d3ef" />
      <stop offset="55%" stopColor="#7b87a8" />
      <stop offset="100%" stopColor="#2b3247" />
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="blur-soft">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    {[
      ['ink', C.ink],
      ['gold', C.gold],
      ['cyan', C.cyan],
      ['red', C.red],
      ['mint', C.mint],
      ['violet', C.violet],
      ['muted', C.muted],
    ].map(([k, col]) => (
      <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 L2.5,5 Z" fill={col} />
      </marker>
    ))}
  </defs>
);

/** Kanvas SVG penuh 1920×1080 untuk sebuah scene. */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <Defs />
      {children}
    </svg>
  </AbsoluteFill>
);

export const Atom: React.FC<{
  x: number;
  y: number;
  el: keyof typeof ATOM | string;
  r?: number;
  label?: string | null;
  opacity?: number;
  glow?: number;
  charge?: string;
}> = ({x, y, el, r, label, opacity = 1, glow = 1, charge}) => {
  const a = ATOM[el] ?? ATOM.C;
  const R = r ?? a.r;
  const f = useCurrentFrame();
  const pulse = 0.8 + 0.2 * Math.sin((f / 30) * 2.2 + x * 0.011 + y * 0.017); // pendar atom "bernapas"
  const text = label === undefined ? el : label;
  return (
    <g opacity={opacity}>
      {glow > 0 ? <circle cx={x} cy={y} r={R * 2.3 * (0.96 + 0.04 * pulse)} fill={`url(#glow-${el in ATOM ? el : 'C'})`} opacity={glow * pulse} /> : null}
      <circle cx={x} cy={y} r={R} fill={`url(#atom-${el in ATOM ? el : 'C'})`} />
      {/* cahaya tepi (rim light) dari bawah-kanan: memberi kesan bola 3D yang disinari panggung */}
      <path
        d={`M${x + R * 0.95},${y + R * 0.3} A${R},${R} 0 0 1 ${x - R * 0.3},${y + R * 0.95}`}
        fill="none"
        stroke={a.glow}
        strokeWidth={Math.max(1.5, R * 0.07)}
        strokeLinecap="round"
        opacity={0.55}
      />
      <ellipse cx={x - R * 0.32} cy={y - R * 0.38} rx={R * 0.3} ry={R * 0.18} fill="#fff" opacity={0.45} transform={`rotate(-30 ${x - R * 0.32} ${y - R * 0.38})`} />
      {text ? (
        <text
          x={x}
          y={y + R * 0.02}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT.sans}
          fontWeight={700}
          fontSize={R * 0.78}
          fill={el === 'H' ? '#1d2440' : '#ffffff'}
          opacity={0.92}
        >
          {text}
        </text>
      ) : null}
      {charge ? (
        <text x={x + R * 0.85} y={y - R * 0.9} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={R * 0.75} fill={C.ink}>
          {charge}
        </text>
      ) : null}
    </g>
  );
};

/** Pegas heliks semi-3D: lilitan belakang gelap, lilitan depan emas mengilap (kesan kedalaman). */
export const Spring: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  coils?: number;
  amp?: number;
  width?: number;
  opacity?: number;
  color?: string;
}> = ({x1, y1, x2, y2, coils = 9, amp = 18, width = 6, opacity = 1, color}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const lead = Math.min(22, len * 0.1);
  const back: string[] = [];
  const front: string[] = [];
  const steps = Math.max(40, Math.round(coils * 24));
  let cur: string[] = [];
  let curFront: boolean | null = null;
  const push = (isFront: boolean) => (isFront ? front : back).push(cur.join(' '));
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const a = u * coils * Math.PI * 2;
    const ease = Math.min(1, Math.min(u, 1 - u) * 14);
    const sAx = lead + (len - 2 * lead) * u + Math.sin(a) * amp * 0.3 * ease;
    const off = Math.cos(a) * amp * ease;
    const px = x1 + ux * sAx + nx * off;
    const py = y1 + uy * sAx + ny * off;
    const isFront = Math.sin(a) >= 0;
    if (curFront === null) curFront = isFront;
    if (isFront !== curFront) {
      push(curFront);
      cur = [cur[cur.length - 1].replace('L', 'M')];
      curFront = isFront;
    }
    cur.push(`${cur.length ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  if (curFront !== null) push(curFront);
  const ends = `M${x1},${y1} L${x1 + ux * lead},${y1 + uy * lead} M${x2 - ux * lead},${y2 - uy * lead} L${x2},${y2}`;
  const main = color ?? '#e6b95e';
  return (
    <g opacity={opacity}>
      <path d={ends} fill="none" stroke={main} strokeWidth={width} strokeLinecap="round" />
      {back.map((d, i) => (
        <path key={`b${i}`} d={d} fill="none" stroke={color ? color : '#6b4c16'} strokeOpacity={color ? 0.45 : 1} strokeWidth={width * 0.85} strokeLinecap="round" />
      ))}
      {front.map((d, i) => (
        <g key={`f${i}`}>
          <path d={d} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={width + 3} strokeLinecap="round" />
          <path d={d} fill="none" stroke={main} strokeWidth={width} strokeLinecap="round" />
          <path d={d} fill="none" stroke="#fff6da" strokeOpacity={0.7} strokeWidth={Math.max(1, width * 0.28)} strokeLinecap="round" transform={`translate(${-ny * width * 0.25} ${nx * width * 0.25 - width * 0.2})`} />
        </g>
      ))}
    </g>
  );
};

/** Ikatan kimia (tunggal/rangkap) berbentuk batang. */
export const Bond: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  order?: number;
  width?: number;
  opacity?: number;
  color?: string;
}> = ({x1, y1, x2, y2, order = 1, width = 12, opacity = 1, color}) => {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const gap = width * 1.15;
  const offsets = order === 1 ? [0] : order === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap];
  const w = order === 1 ? width : width * 0.62;
  return (
    <g opacity={opacity}>
      {offsets.map((o, i) => (
        <g key={i}>
          <line x1={x1 + nx * o} y1={y1 + ny * o} x2={x2 + nx * o} y2={y2 + ny * o} stroke="#0b0f1c" strokeWidth={w + 3} strokeLinecap="round" />
          <line x1={x1 + nx * o} y1={y1 + ny * o} x2={x2 + nx * o} y2={y2 + ny * o} stroke={color ?? '#8b97b8'} strokeWidth={w} strokeLinecap="round" />
          <line
            x1={x1 + nx * (o - w * 0.18)}
            y1={y1 + ny * (o - w * 0.18)}
            x2={x2 + nx * (o - w * 0.18)}
            y2={y2 + ny * (o - w * 0.18)}
            stroke="#fff"
            strokeOpacity={0.35}
            strokeWidth={w * 0.25}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
};

export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: 'ink' | 'gold' | 'cyan' | 'red' | 'mint' | 'violet' | 'muted';
  width?: number;
  opacity?: number;
  dash?: string;
  both?: boolean;
}> = ({x1, y1, x2, y2, color = 'ink', width = 4, opacity = 1, dash, both}) => {
  const col = color === 'muted' ? C.muted : C[color === 'ink' ? 'ink' : color];
  if (Math.hypot(x2 - x1, y2 - y1) < 2) return null;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={col}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      opacity={opacity}
      markerEnd={`url(#arrow-${color})`}
      markerStart={both ? `url(#arrow-${color})` : undefined}
    />
  );
};

/** Teks SVG dengan gaya konsisten. */
export const Label: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  opacity?: number;
  font?: 'sans' | 'mono' | 'serif';
  italic?: boolean;
  spacing?: number;
}> = ({x, y, children, size = 30, color = C.ink, anchor = 'middle', weight = 500, opacity = 1, font = 'sans', italic, spacing}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    dominantBaseline="central"
    fontFamily={FONT[font]}
    fontSize={size}
    fontWeight={weight}
    fill={color}
    opacity={opacity}
    fontStyle={italic ? 'italic' : undefined}
    letterSpacing={spacing}
    style={{paintOrder: 'stroke', stroke: 'rgba(4,6,12,0.85)', strokeWidth: size * 0.12}}
  >
    {children}
  </text>
);

/** Kartu HTML (untuk rumus & catatan) yang diposisikan absolut. */
export const Card: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  opacity?: number;
  scale?: number;
  anchor?: 'center' | 'left' | 'right';
  accent?: string;
  style?: React.CSSProperties;
  plain?: boolean;
}> = ({x, y, children, opacity = 1, scale = 1, anchor = 'center', accent = C.gold, style, plain}) => {
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${scale})`,
        transformOrigin: anchor === 'center' ? '50% 50%' : anchor === 'left' ? '0% 50%' : '100% 50%',
        opacity,
        padding: plain ? 0 : '18px 30px',
        borderRadius: 18,
        background: plain ? undefined : 'linear-gradient(160deg, rgba(22,30,58,0.82), rgba(8,11,24,0.82))',
        border: plain ? undefined : `1px solid ${accent}55`,
        boxShadow: plain ? undefined : `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px ${accent}18`,
        color: C.ink,
        fontFamily: FONT.sans,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {plain ? null : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            pointerEvents: 'none',
            background: `linear-gradient(105deg, transparent ${-30 + opacity * 130}%, rgba(255,240,200,0.10) ${-15 + opacity * 130}%, transparent ${0 + opacity * 130}%)`,
          }}
        />
      )}
      {plain ? null : (
        <div style={{position: 'absolute', left: 24, right: 24, top: -1, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.9}} />
      )}
      {children}
    </div>
  );
};

/** Variabel matematika bergaya miring. */
export const V: React.FC<{children: React.ReactNode; color?: string}> = ({children, color}) => (
  <span style={{fontFamily: FONT.serif, fontStyle: 'italic', color}}>{children}</span>
);

export const Badge: React.FC<{
  x: number;
  y: number;
  text: string;
  color: string;
  opacity?: number;
  scale?: number;
  icon?: string;
}> = ({x, y, text, color, opacity = 1, scale = 1, icon}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      padding: '10px 22px',
      borderRadius: 999,
      background: `${color}22`,
      border: `2px solid ${color}`,
      color,
      fontFamily: FONT.sans,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 1.5,
      whiteSpace: 'nowrap',
      boxShadow: `0 0 30px ${color}44`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}
  >
    {icon ? <span style={{fontSize: 24}}>{icon}</span> : null}
    {text}
  </div>
);

/** Lingkaran cahaya lembut. */
export const Glow: React.FC<{x: number; y: number; r: number; color?: 'gold' | 'cyan' | 'violet' | 'red' | 'mint' | 'white'; opacity?: number}> = ({
  x,
  y,
  r,
  color = 'gold',
  opacity = 1,
}) => <circle cx={x} cy={y} r={r} fill={`url(#soft-${color})`} opacity={opacity} />;

/** Path yang tergambar progresif (0..1). */
export const DrawPath: React.FC<{
  d: string;
  p: number;
  stroke: string;
  width?: number;
  opacity?: number;
  len?: number;
  glow?: boolean;
  dash?: string;
  fill?: string;
}> = ({d, p, stroke, width = 4, opacity = 1, len = 4000, glow, dash, fill = 'none'}) => {
  if (p <= 0) return null;
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      filter={glow ? 'url(#glow)' : undefined}
      strokeDasharray={dash ?? `${len} ${len}`}
      strokeDashoffset={dash ? undefined : len * (1 - p)}
      pathLength={dash ? undefined : len}
    />
  );
};

/** Partikel bercahaya: inti putih, halo berlapis, jejak opsional (titik-titik yang memudar). */
export const Spark: React.FC<{
  x: number;
  y: number;
  r?: number;
  color?: string;
  opacity?: number;
  trail?: [number, number][];
  halo?: number;
}> = ({x, y, r = 10, color = C.cyan, opacity = 1, trail, halo = 1}) => {
  if (opacity <= 0.001) return null;
  return (
    <g opacity={opacity}>
      {trail?.map(([tx, ty], i) => (
        <circle key={i} cx={tx} cy={ty} r={r * (1 - i / (trail.length + 1)) * 0.75} fill={color} opacity={0.4 * (1 - i / trail.length)} />
      ))}
      <circle cx={x} cy={y} r={r * 3.4} fill={color} opacity={0.07 * halo} />
      <circle cx={x} cy={y} r={r * 2} fill={color} opacity={0.18 * halo} />
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r * 0.5} fill="#fff" opacity={0.85} />
    </g>
  );
};

/** Riak cahaya: cincin yang mengembang & memudar (p: 0..1), untuk foton diserap / dipancarkan. */
export const Ripple: React.FC<{x: number; y: number; p: number; r?: number; color?: string; rings?: number; width?: number}> = ({
  x,
  y,
  p,
  r = 160,
  color = C.gold,
  rings = 3,
  width = 3,
}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <g>
      {Array.from({length: rings}, (_, i) => {
        const q = p * 1.35 - i * 0.17;
        if (q <= 0 || q >= 1) return null;
        return <circle key={i} cx={x} cy={y} r={r * q} fill="none" stroke={color} strokeWidth={width * (1 - q) + 0.5} opacity={(1 - q) * 0.85} />;
      })}
      <circle cx={x} cy={y} r={r * 0.35} fill={`url(#soft-white)`} opacity={0.5 * Math.sin(Math.PI * p)} />
    </g>
  );
};

/** Debu bintang di sekitar objek (titik halus berkelip, deterministik). */
export const Motes: React.FC<{x: number; y: number; rx: number; ry: number; t: number; n?: number; color?: string; opacity?: number; seed?: number}> = ({
  x,
  y,
  rx,
  ry,
  t,
  n = 40,
  color = C.gold,
  opacity = 1,
  seed = 0,
}) => {
  if (opacity <= 0.001) return null;
  const rnd = (k: number) => {
    const s = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  return (
    <g opacity={opacity}>
      {Array.from({length: n}, (_, i) => {
        const a = rnd(i) * Math.PI * 2 + t * (0.05 + rnd(i + 3) * 0.12) * (rnd(i + 9) > 0.5 ? 1 : -1);
        const d = 0.35 + 0.65 * Math.sqrt(rnd(i + 5));
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (1.2 + rnd(i + 7) * 2) + i));
        return <circle key={i} cx={x + Math.cos(a) * rx * d} cy={y + Math.sin(a) * ry * d - 12 * Math.sin(t * (0.4 + rnd(i + 2) * 0.6) + i)} r={0.8 + rnd(i + 1) * 2.2} fill={color} opacity={tw * 0.7} />;
      })}
    </g>
  );
};
