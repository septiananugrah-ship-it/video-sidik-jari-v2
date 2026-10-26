import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {Fingerprint} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const REFS = [
  'NIST Chemistry WebBook — spektrum IR HCl & CO₂',
  'NIST CCCBDB — frekuensi vibrasi eksperimen',
  'P. Atkins & J. de Paula, Physical Chemistry',
  'D. Pavia dkk., Introduction to Spectroscopy',
  'D. Skoog dkk., Principles of Instrumental Analysis (NDIR, NIR, ATR)',
];

export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const a = ramp(t, 0, 1.6);
  const fp = ramp(t, 0, 5, EASE_IN_OUT);
  const refs = ramp(t, 2.4, 3.4);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={960} y={380} r={500} color="gold" opacity={0.2} />
        <Fingerprint x={960} y={400} scale={1.25} p={fp} opacity={0.22} />
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
        <div style={{fontFamily: FONT.sans, fontSize: 30, letterSpacing: 18, color: C.ink, fontWeight: 300, opacity: a}}>SIDIK JARI</div>
        <div style={{fontFamily: FONT.sans, fontSize: 110, fontWeight: 800, color: C.gold, lineHeight: 1.05, opacity: a, textShadow: '0 0 50px rgba(255,194,74,0.4)'}}>
          MOLEKUL
        </div>
        <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 34, color: C.ink, opacity: ramp(t, 1.2, 2.2)}}>Terima kasih telah menonton</div>
        <div style={{marginTop: 70, textAlign: 'center', opacity: refs}}>
          <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.muted, marginBottom: 14}}>RUJUKAN</div>
          {REFS.map((r) => (
            <div key={r} style={{fontFamily: FONT.sans, fontSize: 24, color: C.muted, lineHeight: 1.6}}>
              {r}
            </div>
          ))}
          <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 20, color: C.faint}}>
            Ilustrasi bersifat skematis · spektrum disederhanakan untuk tujuan edukasi
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
