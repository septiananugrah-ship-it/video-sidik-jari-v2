import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, sample, smoothPath, win} from '../anim';
import {Atom, Bond, Card, DrawPath, Glow, Motes, Ripple, Stage} from '../components/primitives';
import {Fingerprint, Sheet} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab pembuka: dua lembar plastik kembar → getaran → sidik jari.
export const Hook: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const sheetsIn = ramp(t, 0.2, 1.8);
  const sheetsAway = ramp(t, cue(4) - 0.2, cue(5) + 0.4, EASE_IN_OUT);
  const traits = ramp(t, cue(1), cue(1) + 0.6);
  const traitsOut = ramp(t, cue(2) - 0.3, cue(2) + 0.2);
  const pe = ramp(t, wordOf(2, 'polietilena'), wordOf(2, 'polietilena') + 0.5, BACK);
  const pet = ramp(t, wordOf(2, 'PET'), wordOf(2, 'PET') + 0.5, BACK);
  const eq = win(t, cue(3), cue(4) - 0.2, 0.4, 0.4);

  const waveP = ramp(t, wordOf(5, 'bergetar') - 0.6, cue(6) + 0.6, EASE_IN_OUT);
  const waveOut = ramp(t, cue(7) - 0.3, cue(7) + 1.2, EASE_IN_OUT);
  const fpP = ramp(t, cue(7) - 0.2, cue(7) + 3.6, EASE_IN_OUT);
  const mol = win(t, cue(4) - 0.1, cue(7) + 0.2, 0.9, 1);
  const vib = 0.25 + 0.75 * ramp(t, cue(5), cue(5) + 1.2);

  // Gelombang "irama" yang berubah frekuensi di sepanjang layar.
  const wave = smoothPath(
    sample((x) => 540 + Math.sin(x * 0.028 + t * 3.2) * 48 * Math.sin((x / 1920) * Math.PI) * (0.6 + 0.4 * Math.sin(x * 0.004 + t)), 80, 1840, 260).map(
      ([x, y]) => [x, y],
    ),
  );

  // Molekul kecil yang bergetar (rantai C–C–C dengan H).
  const atoms: [number, number, string][] = [
    [810, 560, 'C'],
    [960, 500, 'C'],
    [1110, 560, 'C'],
    [760, 640, 'H'],
    [780, 470, 'H'],
    [960, 405, 'H'],
    [1140, 470, 'H'],
    [1160, 640, 'H'],
  ];
  const disp = (i: number) => {
    const f = atoms[i][2] === 'H' ? 2.4 : 1.1;
    const a = (atoms[i][2] === 'H' ? 16 : 7) * vib;
    return [a * Math.sin(t * f * 2 * Math.PI + i * 1.7), a * Math.cos(t * f * 2 * Math.PI * 0.8 + i * 2.3)];
  };
  const pos = atoms.map(([x, y], i) => [x + disp(i)[0], y + disp(i)[1]] as [number, number]);
  const bonds: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [0, 4],
    [1, 5],
    [2, 6],
    [2, 7],
  ];

  const sheetY = 440 + (1 - sheetsIn) * 120 - sheetsAway * 40;
  const spread = mix(250, 520, sheetsAway);

  return (
    <AbsoluteFill>
      {/* Lembar plastik */}
      <AbsoluteFill style={{opacity: sheetsIn * (1 - sheetsAway * 0.92), filter: `blur(${(1 - sheetsIn) * 10 + sheetsAway * 6}px)`}}>
        <Sheet x={960 - spread} y={sheetY} t={t} tint={C.cyan} rotY={18} seed={0.3} scale={1 - sheetsAway * 0.25} />
        <Sheet x={960 + spread} y={sheetY} t={t} tint={C.gold} rotY={-18} seed={1.9} scale={1 - sheetsAway * 0.25} />
      </AbsoluteFill>

      <Stage>
        {/* tanda sama dengan / tanya */}
        <g opacity={traits * (1 - traitsOut)}>
          <Glow x={960} y={470} r={120} color="white" opacity={0.25} />
        </g>
        {/* Gelombang getaran */}
        <g opacity={1 - waveOut}>
          <DrawPath d={wave} p={waveP} stroke={C.cyan} width={5} glow len={3000} />
        </g>
        {/* Molekul kecil */}
        <Motes x={960} y={540} rx={380} ry={230} t={t} n={40} color={C.cyan} opacity={mol * 0.7 * (1 - waveOut)} seed={3} />
        <g opacity={mol * 0.95}>
          {bonds.map(([a, b], i) => (
            <Bond key={i} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} width={10} />
          ))}
          {pos.map((p, i) => (
            <Atom key={i} x={p[0]} y={p[1]} el={atoms[i][2]} label={null} r={atoms[i][2] === 'H' ? 22 : 34} />
          ))}
        </g>
        {/* Sidik jari */}
        <Ripple x={960} y={480} p={ramp(t, cue(7) + 2.6, cue(7) + 4.6)} r={480} color={C.gold} rings={3} width={3} />
        <Motes x={960} y={480} rx={430} ry={330} t={t} n={60} color={C.gold} opacity={fpP} seed={1} />
        <Fingerprint x={960} y={480} scale={1.15} p={fpP} opacity={ramp(t, cue(7) - 0.2, cue(7) + 0.4)} />
        <Glow x={960} y={480} r={420} color="gold" opacity={0.18 * fpP} />
      </Stage>

      {/* Ciri-ciri yang sama */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 470,
          transform: 'translate(-50%,-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          alignItems: 'center',
          opacity: traits * (1 - traitsOut),
        }}
      >
        {['tipis', 'ringan', 'bening'].map((w, i) => {
          const p = ramp(t, cue(1) + i * 0.75, cue(1) + i * 0.75 + 0.5, BACK);
          return (
            <div
              key={w}
              style={{
                fontFamily: FONT.sans,
                fontWeight: 600,
                fontSize: 34,
                color: C.ink,
                padding: '8px 26px',
                borderRadius: 999,
                border: `1.5px solid ${C.muted}`,
                background: 'rgba(10,16,36,0.7)',
                opacity: p,
                scale: String(0.7 + 0.3 * p),
              }}
            >
              = {w}
            </div>
          );
        })}
      </div>

      {/* Label PE / PET */}
      <Card x={960 - spread} y={800} opacity={pe * (1 - sheetsAway)} scale={0.8 + 0.2 * pe} accent={C.cyan}>
        <div style={{fontSize: 44, fontWeight: 700, color: C.cyan, textAlign: 'center'}}>PE</div>
        <div style={{fontSize: 22, color: C.muted}}>polietilena</div>
      </Card>
      <Card x={960 + spread} y={800} opacity={pet * (1 - sheetsAway)} scale={0.8 + 0.2 * pet} accent={C.gold}>
        <div style={{fontSize: 44, fontWeight: 700, color: C.gold, textAlign: 'center'}}>PET</div>
        <div style={{fontSize: 22, color: C.muted}}>polietilena tereftalat</div>
      </Card>

      {/* "?" di tengah */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 470,
          transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * eq})`,
          opacity: eq,
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: 190,
          color: C.ink,
          textShadow: `0 0 40px ${C.violet}`,
        }}
      >
        ?
      </div>
    </AbsoluteFill>
  );
};
