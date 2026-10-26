import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Arrow, Atom, Card, Glow, Label, Motes, Spark, Spring as SpringShape, Stage, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const CLOUD = Array.from({length: 140}, (_, i) => ({
  a: rand(i * 1.3) * Math.PI * 2,
  r: 0.25 + rand(i * 2.7) * 0.85,
  s: 0.15 + rand(i * 3.9) * 0.5,
  side: rand(i * 7.1) > 0.45 ? 1 : 0,
}));

export const Spring: React.FC = () => {
  const {t, cue} = useScene();

  // Simpangan atom H dari posisi setimbang (px).
  const pull = ramp(t, cue(2) + 0.2, cue(2) + 1.4, EASE_IN_OUT);
  const push = ramp(t, cue(3) + 0.1, cue(3) + 1.3, EASE_IN_OUT);
  const t0 = cue(4) - 0.1;
  const released = t >= t0;
  const A = 85;
  let x = mix(mix(0, 95, pull), -70, push);
  if (released) {
    const blend = ramp(t, t0, t0 + 0.6);
    x = mix(-70, A * -Math.cos(2 * Math.PI * 0.55 * (t - t0)), blend);
  }

  const graphOn = win(t, cue(5) - 0.4, cue(7) - 0.2, 0.8, 0.8);
  const shift = -230 * graphOn;
  const cloud = ramp(t, cue(8) - 0.2, cue(8) + 1.2);
  const springOpacity = 1 - 0.85 * ramp(t, cue(7), cue(8), EASE_IN_OUT) + 0.45 * ramp(t, cue(9), cue(9) + 1);
  const intro = ramp(t, cue(0) - 0.6, cue(0) + 0.8, BACK);
  const scale = 1 + 0.12 * ramp(t, cue(7) - 0.3, cue(8), EASE_IN_OUT);

  const clX = 760 + shift;
  const hX0 = 1160 + shift;
  const hX = hX0 + x;
  const y = 520;

  const eqLine = win(t, cue(1), cue(4) + 1.5, 0.6, 0.8);
  const force = ramp(t, cue(2) + 0.4, cue(2) + 1) * (1 - ramp(t, cue(7) - 0.4, cue(7)));

  // posisi lampau (untuk jejak gerak) — hanya saat berosilasi bebas
  const xAt = (dt: number) => (released ? mix(-70, A * -Math.cos(2 * Math.PI * 0.55 * (t - dt - t0)), ramp(t - dt, t0, t0 + 0.6)) : x);
  const ghosts = released ? [1, 2, 3, 4].map((k) => xAt(k * 0.05)) : [];

  // Grafik F terhadap x
  const g = {cx: 1450, cy: 500, s: 2.2};
  const dot = {x: g.cx + x * g.s, y: g.cy + x * g.s * 0.85};

  return (
    <AbsoluteFill>
      <Stage>
        <g transform={`translate(${960} ${y}) scale(${scale}) translate(${-960} ${-y})`} opacity={intro}>
          {/* awan elektron */}
          <g opacity={cloud}>
            <ellipse cx={(clX + hX) / 2} cy={y} rx={(hX - clX) / 2 + 150} ry={150} fill="url(#soft-violet)" opacity={0.75} />
            {CLOUD.map((p, i) => {
              const cx = p.side ? hX : clX;
              const R = (p.side ? 95 : 140) * p.r;
              const a = p.a + t * p.s * 2;
              const bridge = Math.sin(a * 2) > 0.6 ? 0.5 : 0;
              return (
                <circle
                  key={i}
                  cx={mix(cx + Math.cos(a) * R, (clX + hX) / 2, bridge * 0.6)}
                  cy={y + Math.sin(a) * R * 0.75}
                  r={2.6}
                  fill={i % 3 ? C.cyan : C.violet}
                  opacity={0.7}
                />
              );
            })}
          </g>

          {/* posisi setimbang */}
          <g opacity={eqLine}>
            <line x1={hX0} y1={y - 150} x2={hX0} y2={y + 150} stroke={C.muted} strokeWidth={2} strokeDasharray="8 10" />
            <circle cx={hX0} cy={y} r={34} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
            <Arrow x1={clX + 6} y1={y + 120} x2={hX0 - 6} y2={y + 120} color="muted" width={2.5} both />
            <Label x={(clX + hX0) / 2} y={y + 158} size={30} color={C.ink} font="serif" italic>
              r₀
            </Label>
          </g>

          <SpringShape x1={clX + 40} y1={y} x2={hX - 26} y2={y} coils={10} amp={22} width={7} opacity={springOpacity} />
          <Atom x={clX} y={y} el="Cl" r={66} />
          {ghosts.map((gx, k) => (
            <circle key={k} cx={hX0 + gx} cy={y} r={36 - k * 3} fill="#cfdcff" opacity={0.16 - k * 0.035} />
          ))}
          <Motes x={(clX + hX0) / 2} y={y} rx={420} ry={190} t={t} n={46} color={C.gold} opacity={0.55 * intro * (1 - cloud)} seed={2} />
          <Atom x={hX} y={y} el="H" r={38} />

          {/* gaya pemulih */}
          {Math.abs(x) > 6 ? (
            <g opacity={force}>
              <Arrow x1={hX} y1={y - 90} x2={hX - x * 1.5} y2={y - 90} color="red" width={7} />
              <Label x={hX - x * 0.75} y={y - 130} size={30} color={C.red} font="serif" italic weight={600}>
                F
              </Label>
            </g>
          ) : null}
          <g opacity={win(t, cue(2), cue(3) - 0.2, 0.3, 0.3)}>
            <Label x={hX + 90} y={y - 40} size={30} color={C.gold} weight={600} anchor="start">
              tarik →
            </Label>
          </g>
          <g opacity={win(t, cue(3) + 0.1, cue(4) - 0.1, 0.3, 0.3)}>
            <Label x={hX + 70} y={y - 40} size={30} color={C.gold} weight={600} anchor="start">
              ← dorong
            </Label>
          </g>
        </g>

        {/* grafik Hooke */}
        <g opacity={graphOn}>
          <Glow x={g.cx} y={g.cy} r={300} color="cyan" opacity={0.12} />
          <Arrow x1={g.cx - 230} y1={g.cy} x2={g.cx + 240} y2={g.cy} color="muted" width={2.5} />
          <Arrow x1={g.cx} y1={g.cy + 220} x2={g.cx} y2={g.cy - 230} color="muted" width={2.5} />
          <Label x={g.cx + 250} y={g.cy + 34} size={26} color={C.muted} anchor="end" font="serif" italic>
            x
          </Label>
          <Label x={g.cx + 24} y={g.cy - 228} size={26} color={C.muted} anchor="start" font="serif" italic>
            F
          </Label>
          <line
            x1={g.cx - 100 * g.s}
            y1={g.cy - 100 * g.s * 0.85}
            x2={g.cx - 100 * g.s + 200 * g.s * ramp(t, cue(5), cue(5) + 1.5)}
            y2={g.cy - 100 * g.s * 0.85 + 200 * g.s * 0.85 * ramp(t, cue(5), cue(5) + 1.5)}
            stroke={C.cyan}
            strokeWidth={5}
            strokeLinecap="round"
            filter="url(#glow)"
          />
          <line x1={dot.x} y1={g.cy} x2={dot.x} y2={dot.y} stroke={C.red} strokeWidth={3} strokeDasharray="5 6" />
          <Spark
            x={dot.x}
            y={dot.y}
            r={12}
            color={C.gold}
            trail={[1, 2, 3, 4, 5, 6].map((k) => [g.cx + xAt(k * 0.04) * g.s, g.cy + xAt(k * 0.04) * g.s * 0.85] as [number, number])}
          />
        </g>
      </Stage>

      <Card x={g.cx} y={182} opacity={win(t, cue(6) - 0.2, cue(7) - 0.2, 0.5, 0.6) * graphOn} scale={0.9 + 0.1 * ramp(t, cue(6), cue(6) + 0.5, BACK)}>
        <div style={{fontSize: 64, letterSpacing: 1}}>
          <V color={C.red}>F</V> = −<V color={C.gold}>k</V> <V color={C.cyan}>x</V>
        </div>
        <div style={{fontSize: 22, color: C.muted, textAlign: 'center', marginTop: 4}}>hukum Hooke</div>
      </Card>

      <Card x={960} y={240} opacity={win(t, cue(8) + 0.6, 999, 0.6, 0.6)} accent={C.violet}>
        <div style={{fontSize: 30}}>
          ikatan = <span style={{color: C.violet, fontWeight: 600}}>awan elektron</span> yang dibagi dua inti
        </div>
      </Card>
    </AbsoluteFill>
  );
};
