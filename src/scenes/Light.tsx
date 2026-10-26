import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, sample, smoothPath, win} from '../anim';
import {Arrow, Atom, Badge, Bond, Card, Glow, Label, Motes, Ripple, Spark, Spring, Stage, V} from '../components/primitives';
import {PhotonPacket} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const lin = Easing.linear;

const SpectrumBar: React.FC<{p: number; t: number}> = ({p, t}) => {
  const x0 = 260;
  const x1 = 1660;
  const y = 250;
  const wave = smoothPath(
    sample((x) => y - 60 + 22 * Math.sin((x - x0) ** 0.62 * 1.5 - t * 4), x0, mix(x0, x1, p), 300).map(([x, yy]) => [x, yy]),
  );
  return (
    <g opacity={p}>
      <defs>
        <linearGradient id="emgrad" x1="0" x2="1">
          <stop offset="0" stopColor="#6a3cff" />
          <stop offset="0.17" stopColor="#8a5cff" />
          <stop offset="0.2" stopColor="#4f7dff" />
          <stop offset="0.24" stopColor="#4fdc7a" />
          <stop offset="0.28" stopColor="#ffe14a" />
          <stop offset="0.33" stopColor="#ff5a3a" />
          <stop offset="0.38" stopColor="#a8202a" />
          <stop offset="0.72" stopColor="#3a0a14" />
          <stop offset="1" stopColor="#1a1c2a" />
        </linearGradient>
      </defs>
      <path d={wave} fill="none" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2.5} />
      <rect x={x0} y={y} width={(x1 - x0) * p} height={30} rx={15} fill="url(#emgrad)" />
      <rect x={760} y={y - 8} width={540} height={46} rx={23} fill="none" stroke={C.amber} strokeWidth={3} opacity={ramp(p, 0.7, 1)} filter="url(#glow)" />
      <Label x={380} y={y + 64} size={24} color={C.muted}>
        UV
      </Label>
      <Label x={630} y={y + 64} size={24} color={C.muted}>
        tampak
      </Label>
      <Label x={1030} y={y + 64} size={30} color={C.amber} weight={700}>
        INFRAMERAH
      </Label>
      <Label x={1480} y={y + 64} size={24} color={C.muted}>
        gelombang mikro
      </Label>
    </g>
  );
};

export const Light: React.FC = () => {
  const {t, cue} = useScene();
  const P1 = win(t, -1, cue(6) + 0.2, 0.5, 0.8);
  const P2 = ramp(t, cue(6) + 0.4, cue(7) + 0.4, EASE_IN_OUT);

  const diagram = ramp(t, cue(0) + 0.3, cue(0) + 1.2);
  const bar = win(t, cue(1) - 0.2, cue(3) - 0.4, 1.2, 0.6);
  const ehv = win(t, cue(2), cue(5) - 0.3, 0.6, 0.5);

  // foton yang cocok
  const tArrive = cue(3) + 2.4;
  const gp = ramp(t, cue(3) - 0.2, tArrive, lin);
  const gOpacity = ramp(t, cue(3) - 0.2, cue(3) + 0.2) * (1 - ramp(t, tArrive - 0.1, tArrive + 0.3));
  const absorbed = ramp(t, tArrive - 0.1, tArrive + 0.6);
  // foton yang tidak cocok
  const cp = ramp(t, cue(4) - 0.3, cue(4) + 3.4, lin);
  const cOpacity = ramp(cp, 0, 0.06) * (1 - ramp(cp, 0.94, 1));
  const rules = ramp(t, cue(5), cue(5) + 0.8);

  const amp = mix(8, 26, absorbed);
  const s = amp * Math.sin(2 * Math.PI * 0.9 * t);
  const molX = 780;
  const molY = 560;

  // diagram tingkat energi
  const lv = [720, 570, 420];
  const dX = 1420;
  const jumpP = ramp(t, tArrive, tArrive + 0.6, EASE_IN_OUT);
  const dotY = mix(lv[0], lv[1], jumpP);

  // ---------- fase 2: dipol ----------
  const sP2 = 30 * Math.sin(2 * Math.PI * 0.8 * t);
  const dipoleCard = ramp(t, cue(7) + 0.4, cue(7) + 1.1, BACK);
  const active = ramp(t, cue(8) + 1.2, cue(8) + 1.8, BACK);
  const right = ramp(t, cue(9), cue(9) + 0.9);
  const passP = ramp(t, cue(10) - 0.6, cue(10) + 2.4, lin);
  const inactive = ramp(t, cue(10) + 0.6, cue(10) + 1.2, BACK);

  return (
    <AbsoluteFill>
      <Stage>
        {/* ========== Fase 1 ========== */}
        <g opacity={P1}>
          <SpectrumBar p={bar} t={t} />
          {/* molekul HCl */}
          <g opacity={ramp(t, -0.5, 0.6)}>
            <Glow x={molX + 100} y={molY} r={220} color="gold" opacity={0.4 * absorbed * (0.7 + 0.3 * Math.sin(t * 6))} />
            <Spring x1={molX} y1={molY} x2={molX + 210 + s} y2={molY} coils={7} amp={15} width={5} />
            <Atom x={molX} y={molY} el="Cl" r={58} />
            <Atom x={molX + 210 + s} y={molY} el="H" r={32} />
          </g>
          <Ripple x={molX + 105} y={molY} p={ramp(t, tArrive - 0.15, tArrive + 1.6)} r={300} color={C.gold} rings={3} width={4} />
          <Motes x={molX + 105} y={molY} rx={300} ry={170} t={t} n={50} color={C.gold} opacity={absorbed * P1} seed={5} />
          <PhotonPacket x={mix(-100, molX + 150, gp)} y={molY} wavelength={64} color={C.gold} opacity={gOpacity} phase={-t * 12} />
          <PhotonPacket x={mix(-200, 2150, cp)} y={molY + 6} wavelength={30} color={C.cyan} opacity={cOpacity} phase={-t * 18} amp={22} />

          {/* diagram tingkat */}
          <g opacity={diagram}>
            {lv.map((y, i) => (
              <g key={i}>
                <line x1={dX} y1={y} x2={dX + 260} y2={y} stroke={[C.gold, C.cyan, C.violet][i]} strokeWidth={4} />
                <Label x={dX + 290} y={y} size={26} anchor="start" font="serif" italic color={[C.gold, C.cyan, C.violet][i]}>
                  v = {i}
                </Label>
              </g>
            ))}
            <Spark
              x={dX + 70}
              y={dotY - 14}
              r={11}
              color={C.gold}
              trail={[1, 2, 3, 4, 5].map((k) => [dX + 70, mix(lv[0], lv[1], ramp(t - k * 0.04, tArrive, tArrive + 0.6, EASE_IN_OUT)) - 14] as [number, number])}
            />
            <Ripple x={dX + 70} y={lv[1] - 14} p={ramp(t, tArrive + 0.45, tArrive + 1.6)} r={90} color={C.cyan} rings={2} />
            <g opacity={ramp(t, tArrive - 0.2, tArrive + 0.3)}>
              <Arrow x1={dX + 130} y1={lv[0] - 6} x2={dX + 130} y2={lv[1] + 8} color="mint" width={5} />
              <Label x={dX + 170} y={(lv[0] + lv[1]) / 2} size={34} color={C.mint} weight={700}>
                ✓
              </Label>
            </g>
            <g opacity={ramp(t, cue(4) + 0.6, cue(4) + 1.2)}>
              <Arrow x1={dX + 200} y1={lv[0] - 6} x2={dX + 200} y2={lv[0] - 70} color="red" width={4} dash="8 8" />
              <Label x={dX + 236} y={lv[0] - 40} size={30} color={C.red} weight={700}>
                ✕
              </Label>
            </g>
            <g opacity={rules}>
              <Arrow x1={dX + 40} y1={lv[0] - 6} x2={dX + 40} y2={lv[2] + 8} color="red" width={4} dash="8 8" />
              <Label x={dX + 6} y={(lv[0] + lv[2]) / 2 - 20} size={30} color={C.red} weight={700}>
                ✕
              </Label>
            </g>
          </g>
        </g>

        {/* ========== Fase 2 ========== */}
        <g opacity={P2}>
          {/* HCl + dipol */}
          <g transform={`translate(${mix(0, -120, right)} 0)`}>
            {active > 0
              ? [0, 1, 2, 3].map((k) => {
                  const ph = (t * 0.9 + k / 4) % 1;
                  return <circle key={k} cx={600} cy={500} r={120 + ph * 260} fill="none" stroke={C.mint} strokeWidth={2.5} opacity={cyc(ph) * 0.5 * active} />;
                })
              : null}
            <Spring x1={480} y1={500} x2={720 + sP2} y2={500} coils={7} amp={15} width={5} />
            <Atom x={480} y={500} el="Cl" r={66} charge="δ−" />
            <Atom x={720 + sP2} y={500} el="H" r={36} charge="δ+" />
            <Arrow x1={720 + sP2} y1={640} x2={480 - (sP2 * 0.8)} y2={640} color="gold" width={7} />
            <line x1={720 + sP2} y1={628} x2={720 + sP2} y2={652} stroke={C.gold} strokeWidth={5} />
            <Label x={600} y={690} size={34} color={C.gold} font="serif" italic weight={600}>
              μ berubah
            </Label>
          </g>
          {/* N2 dan O2 */}
          <g opacity={right}>
            {[
              {el: 'N', order: 3, y: 400, name: 'N₂'},
              {el: 'O', order: 2, y: 650, name: 'O₂'},
            ].map((m, i) => {
              const sv = 20 * Math.sin(2 * Math.PI * (0.9 + i * 0.2) * t);
              return (
                <g key={i}>
                  <Bond x1={1200 - sv} y1={m.y} x2={1440 + sv} y2={m.y} order={m.order} width={14} />
                  <Atom x={1200 - sv} y={m.y} el={m.el} r={50} />
                  <Atom x={1440 + sv} y={m.y} el={m.el} r={50} />
                  <Label x={1580} y={m.y - 18} size={34} weight={700} anchor="start">
                    {m.name}
                  </Label>
                  <Label x={1580} y={m.y + 22} size={26} color={C.muted} anchor="start" font="serif" italic>
                    μ = 0 selalu
                  </Label>
                </g>
              );
            })}
            <PhotonPacket x={mix(900, 2100, passP)} y={400} wavelength={60} color={C.amber} opacity={ramp(passP, 0, 0.08) * (1 - ramp(passP, 0.9, 1))} phase={-t * 12} />
            <PhotonPacket x={mix(900, 2100, ramp(t, cue(10) - 0.3, cue(10) + 2.7, lin))} y={650} wavelength={60} color={C.amber} opacity={ramp(passP, 0.08, 0.16) * (1 - ramp(passP, 0.9, 1))} phase={-t * 12} />
          </g>
        </g>
      </Stage>

      <Card x={1560} y={300} opacity={P1 * ehv} scale={0.85 + 0.15 * ehv} accent={C.gold}>
        <div style={{fontSize: 52}}>
          <V color={C.gold}>E</V>
          <sub style={{fontSize: 26}}>foton</sub> = <V>h</V>
          <V color={C.cyan}>ν</V>
        </div>
      </Card>
      <Card x={1560} y={300} opacity={P1 * rules} scale={0.85 + 0.15 * rules} accent={C.mint}>
        <div style={{fontSize: 50}}>
          Δ<V>v</V> = ±1
        </div>
        <div style={{fontSize: 22, color: C.muted, textAlign: 'center'}}>aturan seleksi (harmonik)</div>
      </Card>
      <Card x={600 + mix(0, -120, right)} y={250} opacity={P2 * dipoleCard} scale={0.85 + 0.15 * dipoleCard} accent={C.gold}>
        <div style={{fontSize: 34}}>
          syarat 2: <span style={{color: C.gold, fontWeight: 600}}>momen dipol harus berubah</span>
        </div>
      </Card>
      <Badge x={600 + mix(0, -120, right)} y={790} text="AKTIF INFRAMERAH ✓" color={C.mint} opacity={P2 * active} scale={0.8 + 0.2 * active} />
      <Badge x={1320} y={790} text="REGANGAN TIDAK AKTIF IR ✕" color={C.red} opacity={P2 * inactive} scale={0.8 + 0.2 * inactive} />
    </AbsoluteFill>
  );
};
