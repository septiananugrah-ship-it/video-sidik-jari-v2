import '@fontsource/outfit/300.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/source-serif-4/400-italic.css';
import '@fontsource/source-serif-4/600-italic.css';
import '@fontsource/source-serif-4/400.css';

export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#040815',
  bg2: '#0c1838',
  ink: '#eef2ff',
  muted: '#8c96bb',
  faint: '#3a4466',
  gold: '#ffc93c',
  amber: '#ff8a2e',
  cyan: '#38dcff',
  blue: '#4f86ff',
  violet: '#a98bff',
  mint: '#3ef5b0',
  red: '#ff4d6d',
  pink: '#ff72d8',
};

export const FONT = {
  sans: 'Outfit, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  serif: '"Source Serif 4", Georgia, serif',
};

// Warna atom (konvensi CPK, disesuaikan untuk latar gelap)
export const ATOM: Record<string, {fill: string; glow: string; r: number}> = {
  H: {fill: '#f6f8ff', glow: '#c2d6ff', r: 30},
  D: {fill: '#c9b8ff', glow: '#a083ff', r: 34},
  C: {fill: '#4a5266', glow: '#8ea0c8', r: 42},
  O: {fill: '#ff4560', glow: '#ff8a9a', r: 42},
  N: {fill: '#4a7dff', glow: '#9fb8ff', r: 42},
  Cl: {fill: '#36e07a', glow: '#8dffb5', r: 52},
};

export const MOOD_TINT: Record<string, string> = {
  mystery: '#1c2f6e',
  title: '#4a2f0a',
  wonder: '#0b4466',
  build: '#152c63',
  quantum: '#341c70',
  tension: '#3d1430',
  bright: '#3a2408',
  resolve: '#0d4a42',
  outro: '#1a1f3a',
};
