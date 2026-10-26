import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Arrow, Atom, Card, DrawPath, Glow, Label, Spark, Stage, V} from '../components/primitives';
import {parabolaPath, psiPath, samplePsi2, type Well, wellX, wellY} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';
import {LEVEL_COLORS, LevelLine} from './Ladder';

const NODES: number[][] = [[], [0], [-0.7071, 0.7071], [-1.2247, 0, 1.2247]];

export const Wave: React.FC = () => {
  const {t, cue, fps} = useScene();
  const cloudPhase = ramp(t, cue(7) - 0.4, cue(7) + 1.2, EASE_IN_OUT);
  const W: Well = {cx: mix(800, 620, cloudPhase), base: 800, sx: 118, sy: 100};

  const base = ramp(t, -0.4, 0.8);
  const ballOn = win(t, cue(0), cue(2) - 0.2, 0.5, 0.5);
  const traj = win(t, cue(1) - 0.2, cue(2), 0.4, 0.5);
  const cross = ramp(t, cue(1) + 1.0, cue(1) + 1.6);
  const squared = ramp(t, cue(3) + 0.3, cue(3) + 1.8, EASE_IN_OUT);
  const zeroHl = win(t, cue(4), cue(5) - 0.1, 0.4, 0.4);
  const nodes = ramp(t, cue(5) + 0.6, cue(5) + 1.3);
  const spread = win(t, cue(6) + 0.4, cue(7) + 0.2, 0.6, 0.6);
  const cloud = ramp(t, cue(8) - 0.6, cue(8) + 0.6);

  const e1 = 1.5;
  const xiTurn = Math.sqrt(2 * e1);
  const ballXi = xiTurn * Math.sin(2 * Math.PI * 0.5 * t);

  const sampleStep = Math.floor((t * fps) / 2);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={base}>
          <path d={parabolaPath(W, 4.4)} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={4} />
          {[0, 1, 2, 3].map((v) => (
            <LevelLine key={v} w={W} v={v} p={1} color={LEVEL_COLORS[v]} label labelX={wellX(W, -3.85)} glow={v === 0 ? zeroHl : 0} />
          ))}
        </g>

        {/* bola klasik + lintasannya */}
        <g opacity={ballOn}>
          <g opacity={traj}>
            <line x1={wellX(W, -xiTurn)} y1={wellY(W, e1) - 40} x2={wellX(W, xiTurn)} y2={wellY(W, e1) - 40} stroke={C.ink} strokeWidth={3} strokeDasharray="10 10" />
            <g opacity={cross}>
              <line x1={wellX(W, -0.6)} y1={wellY(W, e1) - 80} x2={wellX(W, 0.6)} y2={wellY(W, e1)} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
              <line x1={wellX(W, 0.6)} y1={wellY(W, e1) - 80} x2={wellX(W, -0.6)} y2={wellY(W, e1)} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
            </g>
          </g>
          <Glow x={wellX(W, ballXi)} y={wellY(W, e1) - 20} r={50} color="gold" opacity={0.5} />
          <Spark x={wellX(W, ballXi)} y={wellY(W, e1) - 20} r={17} color={C.gold} trail={Array.from({length: 7}, (_, k) => [wellX(W, xiTurn * Math.sin(2 * Math.PI * 0.5 * (t - (k + 1) * 0.035))), wellY(W, e1) - 20] as [number, number])} />
          <Label x={wellX(W, 0)} y={wellY(W, e1) - 120} size={60} weight={700} opacity={1 - traj}>
            ?
          </Label>
        </g>

        {/* fungsi gelombang */}
        {[0, 1, 2, 3].map((v) => {
          const p = ramp(t, cue(2) + v * 0.35, cue(2) + v * 0.35 + 1.2, EASE_IN_OUT);
          if (p <= 0) return null;
          const breathe = mix(Math.cos(2 * Math.PI * 0.35 * (v + 0.5) * t), 1, squared);
          const d = psiPath(W, v, 62 * breathe * (1 - squared) + 70 * squared, squared);
          const y = wellY(W, v + 0.5);
          return (
            <g key={v}>
              {squared > 0 ? <path d={`${d} L${wellX(W, Math.sqrt(2 * (v + 0.5)) + 1.1)},${y} L${wellX(W, -Math.sqrt(2 * (v + 0.5)) - 1.1)},${y} Z`} fill={LEVEL_COLORS[v]} opacity={0.18 * squared} /> : null}
              <DrawPath d={d} p={p} stroke={LEVEL_COLORS[v]} width={4} glow len={2500} />
            </g>
          );
        })}

        {/* simpul */}
        <g opacity={nodes}>
          {NODES.map((xs, v) =>
            xs.map((xi, k) => (
              <g key={`${v}-${k}`}>
                <circle cx={wellX(W, xi)} cy={wellY(W, v + 0.5)} r={16} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5 + 0.5 * Math.sin(t * 5 + k)} />
                <circle cx={wellX(W, xi)} cy={wellY(W, v + 0.5)} r={6} fill="#fff" />
              </g>
            )),
          )}
        </g>
        {/* sebaran makin lebar */}
        <g opacity={spread}>
          {[0, 1, 2, 3].map((v) => {
            const half = Math.sqrt(2 * (v + 0.5)) + 0.5;
            const y = wellY(W, v + 0.5) + 22;
            return <Arrow key={v} x1={wellX(W, -half)} y1={y} x2={wellX(W, half)} y2={y} color="muted" width={2} both opacity={0.8} />;
          })}
        </g>
        {/* panah puncak v=0 */}
        <g opacity={zeroHl}>
          <Arrow x1={wellX(W, 1.8)} y1={wellY(W, 0.5) - 160} x2={wellX(W, 0.15)} y2={wellY(W, 0.5) - 80} color="gold" width={4} />
          <Label x={wellX(W, 1.9)} y={wellY(W, 0.5) - 180} size={28} color={C.gold} anchor="start" weight={600}>
            peluang terbesar di tengah
          </Label>
        </g>

        {/* awan kemungkinan */}
        <g opacity={cloud}>
          <Glow x={1520} y={520} r={260} color="violet" opacity={0.25} />
          <line x1={1340} y1={520} x2={1580} y2={520} stroke={C.faint} strokeWidth={8} strokeLinecap="round" />
          {Array.from({length: 220}, (_, i) => {
            const xi = samplePsi2(0, i * 13.7 + sampleStep * 0.917);
            const yj = (rand(i * 3.3 + sampleStep * 1.31) - 0.5) * 60;
            return <circle key={i} cx={1590 + xi * 70} cy={520 + yj * Math.exp(-xi * xi * 0.3)} r={3.2} fill={i % 4 ? C.cyan : C.violet} opacity={0.75} />;
          })}
          <Atom x={1340} y={520} el="Cl" r={58} />
          <Label x={1590} y={420} size={30} color={C.ink} weight={600}>
            posisi H
          </Label>
        </g>
      </Stage>

      <Card x={1520} y={250} opacity={win(t, cue(2) + 0.4, cue(7) - 0.4, 0.6, 0.6)} accent={C.cyan}>
        <div style={{display: 'grid', justifyItems: 'center'}}>
          <div style={{gridArea: '1 / 1', opacity: 1 - ramp(squared, 0.3, 0.7), textAlign: 'center'}}>
            <div style={{fontSize: 46}}>
              <V color={C.cyan}>ψ</V>
              <sub style={{fontSize: 26}}>v</sub>(<V>x</V>)
            </div>
            <div style={{fontSize: 22, color: C.muted}}>fungsi gelombang</div>
          </div>
          <div style={{gridArea: '1 / 1', opacity: ramp(squared, 0.3, 0.7), textAlign: 'center'}}>
            <div style={{fontSize: 46}}>
              |<V color={C.gold}>ψ</V>
              <sub style={{fontSize: 26}}>v</sub>|² = peluang
            </div>
            <div style={{fontSize: 22, color: C.muted}}>di mana atom mungkin ditemukan</div>
          </div>
        </div>
      </Card>
      <Card x={1520} y={560} opacity={win(t, cue(5) + 0.6, cue(7) - 0.4, 0.5, 0.5)} accent="#ffffff">
        <div style={{fontSize: 32}}>
          ● <span style={{fontWeight: 600}}>simpul</span> <span style={{color: C.muted}}>· peluang = 0</span>
        </div>
      </Card>
      <Card x={1520} y={760} opacity={cloud} scale={0.85 + 0.15 * ramp(t, cue(8), cue(8) + 0.6, BACK)} accent={C.violet}>
        <div style={{fontSize: 36, color: C.violet, fontWeight: 600}}>awan kemungkinan</div>
      </Card>
    </AbsoluteFill>
  );
};
