import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Arrow, Badge, Card, DrawPath, Glow, Label, Stage} from '../components/primitives';
import {nuToX, PE_PEAKS, PET_PEAKS, spectrumPath, type Peak, type PlotBox} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const Tile: React.FC<{x: number; y: number; title: string; p: number; children: React.ReactNode; accent: string}> = ({x, y, title, p, children, accent}) => (
  <g opacity={p} transform={`translate(0 ${(1 - p) * 30})`}>
    <rect x={x - 250} y={y - 180} width={500} height={360} rx={24} fill="rgba(14,20,42,0.7)" stroke={accent} strokeOpacity={0.5} strokeWidth={2} />
    <Label x={x - 220} y={y - 140} size={26} weight={600} anchor="start" color={accent}>
      {title}
    </Label>
    {children}
  </g>
);

export const Industry: React.FC = () => {
  const {t, cue} = useScene();
  const P1 = win(t, -1, cue(4) - 0.4, 0.5, 0.6);
  const P2 = win(t, cue(4) - 0.3, cue(5) - 0.2, 0.7, 0.6);
  const P3 = ramp(t, cue(5) - 0.1, cue(5) + 0.7);

  const tile1 = ramp(t, cue(1) - 0.2, cue(1) + 0.6, BACK);
  const match = ramp(t, cue(1) + 1.2, cue(1) + 2.4, EASE_IN_OUT);
  const tile2 = ramp(t, cue(2) - 0.2, cue(2) + 0.6, BACK);
  const tile3 = ramp(t, cue(3) - 0.2, cue(3) + 0.6, BACK);
  const age = ramp(t, cue(3) + 1.2, cue(3) + 5, EASE_IN_OUT);

  const b1: PlotBox = {x: 190, y: 370, w: 420, h: 170};
  const b2: PlotBox = {x: 750, y: 370, w: 420, h: 170};
  const b3: PlotBox = {x: 1310, y: 370, w: 420, h: 170};
  const contam: Peak[] = [...PE_PEAKS, [1735, 0.22, 10]];
  const aged: Peak[] = [...PE_PEAKS, [1715, 0.05 + 0.55 * age, 18]];

  // conveyor
  const belt = ramp(t, -0.4, 0.6) * (1 - tile1 * 0.0);

  // ATR
  const beam = ramp(t, cue(4) + 0.6, cue(4) + 2.2, EASE_IN_OUT);
  const press = ramp(t, cue(4) + 0.2, cue(4) + 0.9, EASE_IN_OUT);
  const zig: [number, number][] = [
    [560, 700],
    [700, 560],
    [840, 700],
    [980, 560],
    [1120, 700],
    [1260, 560],
    [1400, 700],
  ];
  const zigD = zig.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

  // P3
  const caution = ramp(t, cue(5), cue(5) + 0.7, BACK);
  const chips = (i: number) => ramp(t, cue(6) + i * 0.9, cue(6) + i * 0.9 + 0.5, BACK);
  const library = ramp(t, cue(7), cue(7) + 0.8);
  const libRows = [
    ['PET (referensi)', 0.97, C.mint],
    ['PET + aditif', 0.91, C.gold],
    ['PBT', 0.64, C.muted],
  ] as const;

  return (
    <AbsoluteFill>
      <Stage>
        {/* ===== P1: dasbor QC ===== */}
        <g opacity={P1}>
          <g opacity={belt}>
            <line x1={120} y1={760} x2={1800} y2={760} stroke={C.faint} strokeWidth={6} strokeLinecap="round" />
            {Array.from({length: 8}, (_, i) => {
              const x = ((i * 260 + t * 70) % 2080) - 140;
              return (
                <g key={i} transform={`translate(${x} 700)`}>
                  {/* karung pelet polimer */}
                  <path d="M-46,52 Q-56,-10 -34,-44 L-14,-52 L0,-62 L14,-52 L34,-44 Q56,-10 46,52 Z" fill={i % 2 ? '#2b3a63' : '#3a3220'} stroke={i % 2 ? C.cyan : C.gold} strokeOpacity={0.6} strokeWidth={2} />
                  <Label x={0} y={8} size={22} weight={700} color={i % 2 ? C.cyan : C.gold}>
                    {i % 2 ? 'PE' : 'PET'}
                  </Label>
                </g>
              );
            })}
          </g>
          <Tile x={400} y={460} title="identitas bahan baku" p={tile1} accent={C.mint}>
            <path d={spectrumPath(b1, PET_PEAKS)} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="6 6" opacity={0.8} />
            <g transform={`translate(${mix(30, 0, match)} ${mix(-20, 0, match)})`}>
              <path d={spectrumPath(b1, PET_PEAKS)} fill="none" stroke={C.gold} strokeWidth={3} />
            </g>
            <Label x={400} y={600} size={24} color={C.mint} weight={600} opacity={match}>
              cocok dengan referensi ✓
            </Label>
          </Tile>
          <Tile x={960} y={460} title="kontaminan" p={tile2} accent={C.red}>
            <path d={spectrumPath(b2, contam)} fill="none" stroke={C.ink} strokeWidth={3} />
            <circle cx={nuToX(b2, 1735)} cy={b2.y + b2.h - 0.22 * b2.h * 0.88} r={18} fill="none" stroke={C.red} strokeWidth={4} opacity={ramp(t, cue(2) + 0.6, cue(2) + 1)} />
            <Label x={960} y={600} size={24} color={C.red} weight={600} opacity={ramp(t, cue(2) + 0.6, cue(2) + 1)}>
              pita asing terdeteksi
            </Label>
          </Tile>
          <Tile x={1520} y={460} title="degradasi (oksidasi)" p={tile3} accent={C.amber}>
            <path d={spectrumPath(b3, aged)} fill="none" stroke={C.ink} strokeWidth={3} />
            <Glow x={nuToX(b3, 1715)} y={b3.y + b3.h - (0.05 + 0.55 * age) * b3.h * 0.88} r={50} color="gold" opacity={age} />
            <Label x={1520} y={600} size={24} color={C.amber} weight={600} font="mono">
              {`bulan ke-${Math.round(age * 12)} · C=O baru ↑`}
            </Label>
          </Tile>
        </g>

        {/* ===== P2: ATR ===== */}
        <g opacity={P2}>
          <path d="M520,720 L1440,720 L1300,540 L660,540 Z" fill={C.cyan} opacity={0.14} stroke={C.cyan} strokeWidth={3} />
          <Label x={980} y={760} size={24} color={C.cyan}>
            kristal ATR (intan / ZnSe)
          </Label>
          <g transform={`translate(0 ${mix(-120, 0, press)})`}>
            <rect x={760} y={500} width={440} height={40} rx={8} fill={C.gold} opacity={0.75} />
            <Label x={980} y={520} size={22} color="#1d1400" weight={700}>
              sampel plastik
            </Label>
            <rect x={940} y={380} width={80} height={110} rx={10} fill="#4a5266" />
            <Arrow x1={980} y1={300} x2={980} y2={370} color="ink" width={6} />
          </g>
          <DrawPath d={zigD} p={beam} stroke={C.red} width={6} glow len={2000} />
          {[700, 980, 1260].map((x, i) => (
            <Glow key={i} x={x} y={545} r={50} color="red" opacity={beam > 0.2 + i * 0.25 ? 0.7 + 0.3 * Math.sin(t * 8 + i) : 0} />
          ))}
          <Label x={1500} y={600} size={24} color={C.red} anchor="start" opacity={beam}>
            gelombang evanesen
          </Label>
          <Label x={1500} y={632} size={24} color={C.red} anchor="start" opacity={beam}>
            menembus ~1–2 µm
          </Label>
        </g>

        {/* ===== P3: kehati-hatian & pustaka ===== */}
        <g opacity={P3 * library}>
          <rect x={1060} y={300} width={700} height={400} rx={24} fill="rgba(14,20,42,0.75)" stroke={C.faint} strokeWidth={2} />
          <Label x={1100} y={345} size={26} weight={600} anchor="start" color={C.ink}>
            pencarian pustaka rujukan
          </Label>
          {libRows.map(([name, score, col], i) => {
            const p = ramp(t, cue(7) + 0.5 + i * 0.4, cue(7) + 1.4 + i * 0.4, EASE_IN_OUT);
            const y = 420 + i * 90;
            return (
              <g key={name} opacity={ramp(t, cue(7) + 0.3 + i * 0.4, cue(7) + 0.8 + i * 0.4)}>
                <Label x={1100} y={y} size={26} anchor="start" color={C.ink}>
                  {name}
                </Label>
                <rect x={1100} y={y + 24} width={560} height={14} rx={7} fill="#1a2140" />
                <rect x={1100} y={y + 24} width={560 * score * p} height={14} rx={7} fill={col} />
                <Label x={1720} y={y} size={26} anchor="end" color={col} font="mono" weight={600}>
                  {Math.round(score * 100 * p)}%
                </Label>
              </g>
            );
          })}
        </g>
      </Stage>

      <Badge x={1500} y={330} text="HITUNGAN MENIT" color={C.mint} opacity={P2 * ramp(t, cue(4) + 2.4, cue(4) + 3)} />
      <Card x={130} y={300} opacity={P3 * caution} scale={0.85 + 0.15 * caution} anchor="left" accent={C.amber}>
        <div style={{fontSize: 40, fontWeight: 700, color: C.amber}}>⚠ tafsirkan dengan hati-hati</div>
      </Card>
      {['aditif', 'campuran', 'kondisi sampel'].map((c, i) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            left: 130,
            top: 420 + i * 100,
            opacity: P3 * chips(i),
            translate: `${(1 - chips(i)) * -30}px 0px`,
            padding: '14px 28px',
            borderRadius: 16,
            border: `1.5px solid ${C.faint}`,
            background: 'rgba(12,18,40,0.8)',
            fontFamily: FONT.sans,
            fontSize: 32,
            color: C.ink,
          }}
        >
          <span style={{color: C.amber}}>●</span> {c} <span style={{color: C.muted, fontSize: 24}}>→ pita bergeser / tersembunyi</span>
        </div>
      ))}
      <div style={{position: 'absolute', left: 1410, top: 760, transform: 'translate(-50%,-50%)', display: 'flex', gap: 14, opacity: P3 * ramp(t, cue(7) + 2.6, cue(7) + 3.3)}}>
        {['DSC', 'TGA', 'Raman', 'NMR'].map((m) => (
          <div key={m} style={{padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${C.violet}`, color: C.violet, fontFamily: FONT.mono, fontSize: 24}}>
            {m}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
