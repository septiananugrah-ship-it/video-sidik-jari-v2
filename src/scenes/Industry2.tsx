import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, cyc, EASE_IN_OUT, mix, ramp, rand, sample, smoothPath, win} from '../anim';
import {Atom, Badge, Bond, Card, DrawPath, Glow, Label, Stage} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

/* ---------- ikon sederhana ---------- */
const Chimney: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>
    {[0, 1, 2].map((k) => {
      const ph = (t * 0.45 + k / 3) % 1;
      return <circle key={k} cx={x + 20 + ph * 30} cy={y - 90 - ph * 60} r={10 + ph * 16} fill={C.muted} opacity={cyc(ph) * 0.5} />;
    })}
    <rect x={x - 60} y={y - 20} width={120} height={60} rx={4} fill="#3a4466" />
    <rect x={x + 8} y={y - 90} width={26} height={72} fill="#4a5470" />
  </g>
);
const Building: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 45} y={y - 90} width={90} height={130} rx={4} fill="#3a4466" />
    {Array.from({length: 12}, (_, k) => (
      <rect key={k} x={x - 33 + (k % 3) * 25} y={y - 78 + Math.floor(k / 3) * 28} width={16} height={16} rx={2} fill={C.gold} opacity={0.55} />
    ))}
  </g>
);
const Tank: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>
    <rect x={x - 40} y={y - 90} width={80} height={130} rx={30} fill="#2b3a63" stroke={C.cyan} strokeOpacity={0.5} strokeWidth={2} />
    {Array.from({length: 7}, (_, k) => {
      const ph = (t * 0.6 + rand(k) ) % 1;
      return <circle key={k} cx={x - 20 + rand(k * 3) * 40} cy={y + 25 - ph * 100} r={4} fill={C.cyan} opacity={0.75 * cyc(ph)} />;
    })}
  </g>
);
const Pill: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`rotate(-30 ${x} ${y})`}>
    <rect x={x - 70} y={y - 28} width={140} height={56} rx={28} fill="#ffffff" />
    <path d={`M${x},${y - 28} L${x + 42},${y - 28} A28,28 0 0 1 ${x + 42},${y + 28} L${x},${y + 28} Z`} fill={C.violet} />
  </g>
);
const Leaf: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M${x},${y + 50} C${x - 70},${y} ${x - 40},${y - 70} ${x + 30},${y - 80} C${x + 40},${y - 10} ${x + 20},${y + 30} ${x},${y + 50} Z`} fill={C.mint} opacity={0.85} />
    <path d={`M${x},${y + 50} Q${x + 5},${y - 20} ${x + 28},${y - 74}`} stroke="#0b3a2a" strokeWidth={3} fill="none" />
  </g>
);

/* ---------- molekul CO2 kecil ---------- */
const MiniCO2: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const dx = Math.cos(a) * 26;
  const dy = Math.sin(a) * 26;
  return (
    <g>
      <Bond x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} order={2} width={6} />
      <Atom x={x - dx} y={y - dy} el="O" r={12} label="" glow={0} />
      <Atom x={x} y={y} el="C" r={11} label="" glow={0} />
      <Atom x={x + dx} y={y + dy} el="O" r={12} label="" glow={0} />
    </g>
  );
};

const lattice = (x: number, y: number, kind: 0 | 1, color: string) =>
  Array.from({length: 16}, (_, k) => {
    const i = k % 4;
    const j = Math.floor(k / 4);
    const ox = kind ? (j % 2) * 22 : 0;
    return <circle key={k} cx={x - 66 + i * 44 + ox} cy={y - 66 + j * 44} r={10} fill={color} opacity={0.85} />;
  });

export const Industry2: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const pIntro = win(t, -1, cue(1) - 0.3, 0.6, 0.5);
  const pA = win(t, cue(1) - 0.2, cue(4) - 0.4, 0.7, 0.6);
  const pB = win(t, cue(4) - 0.2, cue(5) - 0.4, 0.7, 0.6);
  const pC = win(t, cue(5) - 0.2, cue(6) - 0.4, 0.7, 0.6);
  const pD = ramp(t, cue(6) - 0.2, cue(6) + 0.6);

  // NDIR: makin banyak CO2 → makin sedikit cahaya
  const conc = ramp(t, cue(2), cue(3) - 0.2, EASE_IN_OUT);
  const nMol = Math.round(mix(4, 26, conc));
  const ppm = Math.round(mix(400, 5000, conc) / 10) * 10;
  const transmitted = mix(0.85, 0.22, conc);
  const tube = {x0: 470, x1: 1230, y: 440, h: 130};
  const apps = [
    {at: wordOf(3, 'cerobong'), x: 560, label: 'emisi cerobong'},
    {at: wordOf(3, 'gedung'), x: 960, label: 'kualitas udara gedung'},
    {at: wordOf(3, 'fermentasi'), x: 1360, label: 'fermentasi'},
  ];

  const nir = smoothPath(
    sample(
      (nu) =>
        0.55 * Math.exp(-(((nu - 5200) / 260) ** 2)) +
        0.35 * Math.exp(-(((nu - 6900) / 300) ** 2)) +
        0.42 * Math.exp(-(((nu - 5800) / 160) ** 2)) +
        0.3 * Math.exp(-(((nu - 4650) / 140) ** 2)) +
        0.08,
      4000,
      9000,
      300,
    ).map(([nu, a]) => [880 + ((9000 - nu) / 5000) * 840, 640 - a * 380]),
  );

  return (
    <AbsoluteFill>
      <Stage>
        {/* pembuka: tiga sektor */}
        <g opacity={pIntro}>
          <Chimney x={600} y={520} t={t} />
          <Pill x={960} y={500} />
          <Leaf x={1320} y={500} />
        </g>

        {/* ===== NDIR ===== */}
        <g opacity={pA}>
          <Glow x={360} y={tube.y} r={110} color="red" opacity={0.7 + 0.2 * Math.sin(t * 6)} />
          <circle cx={360} cy={tube.y} r={34} fill="#ff8a5a" />
          <Label x={360} y={tube.y + 80} size={22} color={C.muted}>
            lampu IR
          </Label>
          <rect x={tube.x0} y={tube.y - tube.h / 2} width={tube.x1 - tube.x0} height={tube.h} rx={20} fill="rgba(79,214,255,0.06)" stroke={C.cyan} strokeOpacity={0.6} strokeWidth={3} />
          <defs>
            <linearGradient id="ndirbeam" x1="0" x2="1">
              <stop offset="0" stopColor={C.red} stopOpacity={0.75} />
              <stop offset="1" stopColor={C.red} stopOpacity={0.75 * transmitted} />
            </linearGradient>
          </defs>
          <rect x={395} y={tube.y - 18} width={1000} height={36} fill="url(#ndirbeam)" />
          {Array.from({length: nMol}, (_, k) => (
            <MiniCO2
              key={k}
              x={tube.x0 + 40 + rand(k * 2.3) * (tube.x1 - tube.x0 - 80) + Math.sin(t * 0.8 + k) * 14}
              y={tube.y - 42 + rand(k * 5.7) * 84 + Math.cos(t * 0.7 + k) * 8}
              a={t * (0.5 + rand(k)) + k}
            />
          ))}
          <rect x={1268} y={tube.y - 60} width={22} height={120} rx={4} fill={C.violet} opacity={0.75} />
          <Label x={1279} y={tube.y - 84} size={20} color={C.violet} font="mono">
            filter 4,26 µm
          </Label>
          <path d={`M1350,${tube.y - 40} L1430,${tube.y - 40} L1416,${tube.y + 40} L1364,${tube.y + 40} Z`} fill="#3a4466" stroke={C.ink} strokeWidth={2} />
          <Label x={1390} y={tube.y + 80} size={22} color={C.muted}>
            detektor
          </Label>
          {/* meter */}
          <rect x={1540} y={tube.y - 120} width={36} height={240} rx={18} fill="#1a2140" />
          <rect x={1540} y={tube.y + 120 - 240 * transmitted} width={36} height={240 * transmitted} rx={18} fill={C.red} />
          <Label x={1558} y={tube.y + 150} size={20} color={C.muted}>
            cahaya
          </Label>
          <Label x={850} y={tube.y - 110} size={34} color={C.ink} weight={700} font="mono" opacity={ramp(t, cue(2), cue(2) + 0.5)}>
            {`CO₂ ${ppm.toLocaleString('id-ID')} ppm`}
          </Label>
          {/* aplikasi */}
          {apps.map((a, i) => {
            const p = ramp(t, a.at - 0.2, a.at + 0.5, BACK);
            return (
              <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 30})`}>
                {i === 0 ? <Chimney x={a.x} y={710} t={t} /> : i === 1 ? <Building x={a.x} y={710} /> : <Tank x={a.x} y={710} t={t} />}
                <Label x={a.x} y={780} size={24} color={C.ink} weight={600}>
                  {a.label}
                </Label>
              </g>
            );
          })}
        </g>

        {/* ===== Farmasi: polimorf ===== */}
        <g opacity={pB}>
          <Pill x={330} y={470} />
          <Label x={330} y={580} size={26} color={C.ink} weight={600}>
            bahan baku obat
          </Label>
          <g>{lattice(720, 380, 0, C.violet)}</g>
          <Label x={720} y={490} size={24} color={C.violet} weight={600}>
            bentuk I
          </Label>
          <g opacity={ramp(t, cue(4) + 2.5, cue(4) + 3.2)}>
            {lattice(720, 640, 1, C.pink)}
            <Label x={720} y={750} size={24} color={C.pink} weight={600}>
              bentuk II
            </Label>
          </g>
          {[0, 1].map((k) => {
            const d = smoothPath(
              sample(
                (u) =>
                  (k ? 640 : 380) +
                  50 -
                  110 *
                    (Math.exp(-(((u - 0.3) / 0.025) ** 2)) +
                      0.7 * Math.exp(-(((u - (k ? 0.52 : 0.48)) / 0.02) ** 2)) +
                      0.5 * Math.exp(-(((u - (k ? 0.74 : 0.7)) / 0.025) ** 2))),
                0,
                1,
                240,
              ).map(([u, v]) => [960 + u * 760, v]),
            );
            return (
              <DrawPath key={k} d={d} p={ramp(t, cue(4) + (k ? 2.8 : 0.6), cue(4) + (k ? 4.2 : 2))} stroke={k ? C.pink : C.violet} width={3.5} len={2400} />
            );
          })}
          <Label x={1340} y={250} size={24} color={C.muted}>
            spektrum IR sedikit berbeda → bentuk kristal dapat dibedakan
          </Label>
        </g>

        {/* ===== Pangan: NIR ===== */}
        <g opacity={pC}>
          <Leaf x={420} y={440} />
          <ellipse cx={420} cy={560} rx={110} ry={26} fill="#5a4a2a" opacity={0.7} />
          {Array.from({length: 14}, (_, k) => (
            <ellipse key={k} cx={340 + (k % 7) * 26} cy={548 + Math.floor(k / 7) * 14} rx={10} ry={6} fill={C.gold} opacity={0.8} />
          ))}
          <Label x={420} y={630} size={24} color={C.ink} weight={600}>
            biji-bijian · daun · susu
          </Label>
          <line x1={880} y1={640} x2={1720} y2={640} stroke={C.muted} strokeWidth={2} />
          <DrawPath d={nir} p={ramp(t, cue(5) + 0.4, cue(5) + 2.6, EASE_IN_OUT)} stroke={C.mint} width={4} glow len={2600} />
          {[
            [6900, 'air (O–H)'],
            [5800, 'lemak (C–H)'],
            [4650, 'protein (N–H)'],
          ].map(([nu, l], i) => {
            const x = 880 + ((9000 - (nu as number)) / 5000) * 840;
            const at = wordOf(5, i === 0 ? 'air' : i === 1 ? 'lemak' : 'protein');
            return (
              <g key={i} opacity={ramp(t, at - 0.1, at + 0.5)}>
                <line x1={x} y1={300} x2={x} y2={640} stroke={C.mint} strokeWidth={2} strokeDasharray="6 8" />
                <Label x={x} y={282} size={22} color={C.mint} weight={600}>
                  {l as string}
                </Label>
              </g>
            );
          })}
          <Label x={1300} y={680} size={22} color={C.muted}>
            inframerah dekat 9000 → 4000 cm⁻¹ · pita overtone & kombinasi
          </Label>
        </g>

        {/* ===== Penutup: satu prinsip ===== */}
        <g opacity={pD}>
          {[
            {x: 560, el: <Chimney x={560} y={520} t={t} />, l: 'gas & lingkungan'},
            {x: 960, el: <Pill x={960} y={500} />, l: 'farmasi'},
            {x: 1360, el: <Leaf x={1360} y={500} />, l: 'pangan'},
          ].map((it, i) => {
            const p = ramp(t, cue(6) + i * 0.25, cue(6) + 0.6 + i * 0.25, BACK);
            return (
              <g key={i} opacity={p}>
                <Glow x={it.x} y={490} r={160} color="gold" opacity={0.25} />
                {it.el}
                <Label x={it.x} y={640} size={28} color={C.ink} weight={600}>
                  {it.l}
                </Label>
              </g>
            );
          })}
        </g>
      </Stage>

      <Card x={960} y={260} opacity={pIntro * ramp(t, 0.2, 0.9)} accent={C.amber}>
        <div style={{fontSize: 34}}>
          di luar laboratorium <span style={{color: C.amber, fontWeight: 600}}>plastik</span>…
        </div>
      </Card>
      <Card x={960} y={210} opacity={pA * ramp(t, cue(1), cue(1) + 0.6)} accent={C.red}>
        <div style={{fontSize: 30}}>
          sensor gas <span style={{color: C.red, fontWeight: 700}}>NDIR</span> <span style={{color: C.muted}}>· Non-Dispersive InfraRed</span>
        </div>
      </Card>
      <Badge x={330} y={680} text="IDENTITAS & POLIMORF" color={C.violet} opacity={pB * ramp(t, cue(4) + 1, cue(4) + 1.6)} />
      <Badge x={420} y={720} text="TANPA MERUSAK SAMPEL" color={C.mint} opacity={pC * ramp(t, wordOf(5, 'merusak') - 0.1, wordOf(5, 'merusak') + 0.5)} />
      <Card x={960} y={760} opacity={pD * ramp(t, cue(6) + 1, cue(6) + 1.6)} accent={C.gold}>
        <div style={{fontSize: 32, fontFamily: FONT.sans}}>
          satu prinsip kuantum <span style={{color: C.gold, fontWeight: 700}}>→</span> banyak sektor industri
        </div>
      </Card>
    </AbsoluteFill>
  );
};
