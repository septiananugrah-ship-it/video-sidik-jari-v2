import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp, sample, smoothPath} from '../anim';
import {DrawPath, Glow, Stage} from '../components/primitives';
import {Fingerprint} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const Letters: React.FC<{text: string; t: number; start: number; step: number; style: React.CSSProperties}> = ({text, t, start, step, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', ...style}}>
    {text.split('').map((ch, i) => {
      const p = ramp(t, start + i * step, start + i * step + 0.9);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            opacity: p,
            translate: `0px ${(1 - p) * 40}px`,
            filter: `blur(${(1 - p) * 12}px)`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

export const Title: React.FC = () => {
  const {t} = useScene();
  const fp = ramp(t, 0, 4.5, EASE_IN_OUT);
  const sweep = ramp(t, 2.2, 4.2, EASE_IN_OUT);
  const sub = ramp(t, 2.6, 3.6);
  const line = ramp(t, 1.8, 3.2, EASE_IN_OUT);
  const waves = [0, 1, 2].map((k) =>
    smoothPath(
      sample((x) => 860 + Math.sin(x * (0.012 + k * 0.006) + t * (1.2 + k * 0.5) + k) * (18 + k * 8), 0, 1920, 200).map(([x, y]) => [x, y]),
    ),
  );
  return (
    <AbsoluteFill>
      <Stage>
        <Glow x={960} y={470} r={600} color="gold" opacity={0.22 * fp} />
        <Fingerprint x={960} y={470} scale={1.55} p={fp} opacity={0.32} width={2.5} />
        {waves.map((d, k) => (
          <DrawPath key={k} d={d} p={ramp(t, 0.6 + k * 0.3, 3 + k * 0.3)} stroke={[C.cyan, C.gold, C.violet][k]} width={2} opacity={0.35} len={2600} />
        ))}
      </Stage>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <Letters
            text="SIDIK JARI"
            t={t}
            start={0.4}
            step={0.07}
            style={{fontFamily: FONT.sans, fontWeight: 300, fontSize: 92, letterSpacing: 34, color: C.ink, marginRight: -34}}
          />
          <Letters
            text="MOLEKUL"
            t={t}
            start={0.9}
            step={0.09}
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 210,
              letterSpacing: 6,
              lineHeight: 1,
              color: C.gold,
              textShadow: `0 0 60px rgba(255,194,74,0.45)`,
            }}
          />
          {/* kilau cahaya melintas */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.35) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        <div style={{width: 640 * line, height: 2, margin: '34px 0 26px', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 38,
            fontWeight: 400,
            color: C.muted,
            letterSpacing: 1,
            opacity: sub,
            translate: `0px ${(1 - sub) * 16}px`,
          }}
        >
          Kimia kuantum di balik getaran molekul &amp; spektroskopi FTIR
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
