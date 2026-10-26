import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Atom, Bond, Card, DrawPath, Glow, Label, Stage} from '../components/primitives';
import {absorbance, nuToX, PE_PEAKS, PET_PEAKS, Sheet, spectrumPath, SpectrumAxes, type Peak, type PlotBox} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const PE_BOX: PlotBox = {x: 780, y: 200, w: 980, h: 220};
const PET_BOX: PlotBox = {x: 780, y: 525, w: 980, h: 220};

const Marker: React.FC<{box: PlotBox; peaks: Peak[]; nu: number; label: string; p: number; color: string; dy?: number; dx?: number}> = ({box, peaks, nu, label, p, color, dy = 0, dx = 0}) => {
  if (p <= 0) return null;
  const x = nuToX(box, nu);
  const y = box.y + box.h - Math.min(1.08, absorbance(peaks, nu)) * box.h * 0.88;
  return (
    <g opacity={p}>
      <circle cx={x} cy={y} r={10 + 6 * (1 - p)} fill="none" stroke={color} strokeWidth={3.5} />
      <line x1={x} y1={y - 14} x2={x + dx * 0.55} y2={y - 36 + dy} stroke={color} strokeWidth={2} />
      <Label x={x + dx} y={y - 54 + dy} size={22} color={color} weight={600} font="mono">
        {label}
      </Label>
    </g>
  );
};

const Hex: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  const pts = Array.from({length: 6}, (_, k) => {
    const a = (Math.PI / 3) * k;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return (
    <g>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.ink} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.8} />
    </g>
  );
};

export const PePet: React.FC = () => {
  const {t, cue} = useScene();
  const sheets = ramp(t, -0.4, 0.8);
  const toIcons = ramp(t, cue(1) - 0.6, cue(1) + 0.6, EASE_IN_OUT);
  const peStruct = ramp(t, cue(1), cue(1) + 1.2, EASE_IN_OUT);
  const peAxes = ramp(t, cue(1) + 0.3, cue(1) + 1.4);
  const peSpec = ramp(t, cue(2) - 0.3, cue(2) + 2.2, EASE_IN_OUT);
  const mCH = ramp(t, cue(2) + 1.4, cue(2) + 2);
  const m1470 = ramp(t, cue(3) + 0.6, cue(3) + 1.2);
  const m720 = ramp(t, cue(3) + 3.2, cue(3) + 3.8);
  const petStruct = ramp(t, cue(4), cue(4) + 1.2, EASE_IN_OUT);
  const ester = ramp(t, cue(4) + 1.6, cue(4) + 2.2);
  const ring = ramp(t, cue(4) + 3.2, cue(4) + 3.8);
  const petSpec = ramp(t, cue(5) - 0.4, cue(5) + 2.2, EASE_IN_OUT);
  const m1715 = ramp(t, cue(5) + 1.6, cue(5) + 2.3, BACK);
  const mCO = ramp(t, cue(6) + 0.8, cue(6) + 1.4);
  const missing = ramp(t, cue(7), cue(7) + 0.8);
  const final = ramp(t, cue(8) + 1.4, cue(8) + 2.2, BACK);

  const x1715 = nuToX(PE_BOX, 1715);
  const petPeakY = PET_BOX.y + PET_BOX.h - absorbance(PET_PEAKS, 1715) * PET_BOX.h * 0.88;

  // struktur PE (unit ulang)
  const peC = [
    [300, 330],
    [450, 330],
  ];
  // struktur PET (skeletal)
  const P = {
    oa: [165, 670],
    ca: [220, 635],
    oad: [220, 572],
    ring: [328, 650],
    cb: [436, 635],
    obd: [436, 572],
    ob: [491, 670],
    c1: [546, 635],
    c2: [601, 670],
  } as Record<string, number[]>;

  return (
    <AbsoluteFill>
      {/* lembar plastik menjadi ikon */}
      <AbsoluteFill style={{opacity: sheets * (1 - toIcons)}}>
        <Sheet x={mix(760, 150, toIcons)} y={mix(470, 330, toIcons)} w={300} h={380} t={t} tint={C.cyan} rotY={14} seed={0.3} scale={1 - 0.7 * toIcons} />
        <Sheet x={mix(1160, 150, toIcons)} y={mix(470, 650, toIcons)} w={300} h={380} t={t} tint={C.gold} rotY={-14} seed={1.9} scale={1 - 0.7 * toIcons} />
      </AbsoluteFill>
      <Stage>
        {/* label kiri */}
        <g opacity={toIcons}>
          <Label x={140} y={240} size={46} weight={800} color={C.cyan}>
            PE
          </Label>
          <Label x={140} y={520} size={46} weight={800} color={C.gold}>
            PET
          </Label>
        </g>

        {/* struktur PE */}
        <g opacity={peStruct}>
          <path d="M240,250 L225,250 L225,410 L240,410" fill="none" stroke={C.ink} strokeWidth={4} />
          <path d="M510,250 L525,250 L525,410 L510,410" fill="none" stroke={C.ink} strokeWidth={4} />
          <Label x={545} y={420} size={26} font="serif" italic>
            n
          </Label>
          <Bond x1={200} y1={330} x2={peC[0][0]} y2={330} width={9} />
          <Bond x1={peC[0][0]} y1={330} x2={peC[1][0]} y2={330} width={9} />
          <Bond x1={peC[1][0]} y1={330} x2={550} y2={330} width={9} />
          {peC.map(([x, y], i) => (
            <g key={i}>
              <Bond x1={x} y1={y} x2={x} y2={y - 72} width={7} />
              <Bond x1={x} y1={y} x2={x} y2={y + 72} width={7} />
              <Atom x={x} y={y - 72} el="H" r={20} />
              <Atom x={x} y={y + 72} el="H" r={20} />
              <Atom x={x} y={y} el="C" r={30} />
            </g>
          ))}
        </g>

        {/* struktur PET */}
        <g opacity={petStruct}>
          <path d="M140,560 L125,560 L125,720 L140,720" fill="none" stroke={C.ink} strokeWidth={4} />
          <path d="M630,560 L645,560 L645,720 L630,720" fill="none" stroke={C.ink} strokeWidth={4} />
          <Label x={662} y={730} size={26} font="serif" italic>
            n
          </Label>
          <g opacity={ester}>
            <Glow x={200} y={640} r={110} color="gold" opacity={0.7} />
            <Glow x={456} y={640} r={110} color="gold" opacity={0.7} />
          </g>
          <g opacity={ring}>
            <Glow x={P.ring[0]} y={P.ring[1]} r={100} color="violet" opacity={0.7} />
          </g>
          {[
            ['oa', 'ca'],
            ['ca', 'ring'],
            ['ring', 'cb'],
            ['cb', 'ob'],
            ['ob', 'c1'],
            ['c1', 'c2'],
          ].map(([a, b]) => {
            const A = P[a];
            const B = P[b];
            const ax = a === 'ring' ? P.ring[0] + 54 : A[0];
            const ay = a === 'ring' ? P.ring[1] : A[1];
            const bx = b === 'ring' ? P.ring[0] - 54 : B[0];
            const by = b === 'ring' ? P.ring[1] : B[1];
            return <line key={a + b} x1={ax} y1={ay} x2={bx} y2={by} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
          })}
          <line x1={140} y1={685} x2={P.oa[0]} y2={P.oa[1]} stroke={C.ink} strokeWidth={4} />
          <line x1={P.c2[0]} y1={P.c2[1]} x2={630} y2={640} stroke={C.ink} strokeWidth={4} />
          {['ca', 'cb'].map((k) => (
            <g key={k}>
              <line x1={P[k][0] - 7} y1={P[k][1]} x2={P[k][0] - 7} y2={P[k][1] - 56} stroke={C.ink} strokeWidth={4} />
              <line x1={P[k][0] + 7} y1={P[k][1]} x2={P[k][0] + 7} y2={P[k][1] - 56} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
          <Hex cx={P.ring[0]} cy={P.ring[1]} r={54} />
          {['oa', 'oad', 'obd', 'ob'].map((k) => (
            <Atom key={k} x={P[k][0]} y={P[k][1]} el="O" r={20} />
          ))}
          <Label x={300} y={760} size={22} color={C.gold} opacity={ester}>
            gugus ester
          </Label>
        </g>

        {/* spektrum PE */}
        <SpectrumAxes box={PE_BOX} p={peAxes} label="" yLabel="" ticks={[4000, 3000, 2000, 1500, 1000, 500]} />
        <DrawPath d={spectrumPath(PE_BOX, PE_PEAKS)} p={peSpec} stroke={C.cyan} width={3.5} len={6000} />
        {final > 0.001 ? <DrawPath d={spectrumPath(PE_BOX, PE_PEAKS)} p={peSpec} stroke={C.cyan} width={3.5} glow opacity={Math.min(1, final)} len={6000} /> : null}
        <Marker box={PE_BOX} peaks={PE_PEAKS} nu={2915} label="2915 / 2848" p={mCH} color={C.cyan} />
        <Marker box={PE_BOX} peaks={PE_PEAKS} nu={1467} label="1470" p={m1470} color={C.cyan} />
        <Marker box={PE_BOX} peaks={PE_PEAKS} nu={720} label="720" p={m720} color={C.cyan} />

        {/* spektrum PET */}
        <SpectrumAxes box={PET_BOX} p={ramp(t, cue(4) + 0.3, cue(4) + 1.3)} label="" yLabel="" ticks={[4000, 3000, 2000, 1500, 1000, 500]} />
        <g opacity={m1715}>
          <rect x={x1715 - 22} y={PET_BOX.y - 10} width={44} height={PET_BOX.h + 10} fill={C.gold} opacity={0.14} />
          <Glow x={x1715} y={petPeakY} r={120} color="gold" opacity={0.55} />
        </g>
        <DrawPath d={spectrumPath(PET_BOX, PET_PEAKS)} p={petSpec} stroke={C.gold} width={3.5} len={6000} />
        {final > 0.001 ? <DrawPath d={spectrumPath(PET_BOX, PET_PEAKS)} p={petSpec} stroke={C.gold} width={3.5} glow opacity={Math.min(1, final)} len={6000} /> : null}
        <Marker box={PET_BOX} peaks={PET_PEAKS} nu={1715} label="C=O 1715" p={m1715} color={C.gold} dy={-4} dx={-62} />
        <Marker box={PET_BOX} peaks={PET_PEAKS} nu={1240} label="1240" p={mCO} color={C.amber} dy={20} />
        <Marker box={PET_BOX} peaks={PET_PEAKS} nu={1095} label="1095" p={ramp(t, cue(6) + 2, cue(6) + 2.6)} color={C.amber} dy={30} dx={52} />

        {/* garis 1715 melintasi keduanya */}
        <g opacity={missing}>
          <line x1={x1715} y1={PE_BOX.y - 10} x2={x1715} y2={PET_BOX.y + PET_BOX.h} stroke={C.gold} strokeWidth={2.5} strokeDasharray="8 8" />
          <circle cx={x1715} cy={PE_BOX.y + PE_BOX.h - 6} r={26} fill="none" stroke={C.red} strokeWidth={4} />
          <Label x={x1715 - 40} y={PE_BOX.y + PE_BOX.h - 50} size={24} color={C.red} weight={600} anchor="end">
            ✕ tidak ada C=O
          </Label>
        </g>
      </Stage>
      <Card x={400} y={850} opacity={final} scale={0.8 + 0.2 * final} accent={C.gold} style={{padding: '10px 28px'}}>
        <div style={{fontSize: 34, fontWeight: 700, fontFamily: FONT.sans}}>
          <span style={{color: C.cyan}}>PE</span> <span style={{color: C.muted}}>≠</span> <span style={{color: C.gold}}>PET</span>
          <span style={{color: C.muted, fontWeight: 400, fontSize: 26}}> · sidik jari berbeda</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
