import type React from 'react';
import {Co2} from './Co2';
import {Frequency} from './Frequency';
import {Ftir} from './Ftir';
import {Hook} from './Hook';
import {Industry} from './Industry';
import {Industry2} from './Industry2';
import {Ladder} from './Ladder';
import {Landscape} from './Landscape';
import {Light} from './Light';
import {Outro} from './Outro';
import {Overtone} from './Overtone';
import {PePet} from './PePet';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Spectrum} from './Spectrum';
import {Spring} from './Spring';
import {Title} from './Title';
import {Wave} from './Wave';
import {Zoom} from './Zoom';
import {Zpe} from './Zpe';

// Pemetaan id scene di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  zoom: Zoom,
  spring: Spring,
  frequency: Frequency,
  landscape: Landscape,
  ladder: Ladder,
  wave: Wave,
  zpe: Zpe,
  light: Light,
  overtone: Overtone,
  co2: Co2,
  ftir: Ftir,
  spectrum: Spectrum,
  pepet: PePet,
  industry: Industry,
  industry2: Industry2,
  recap: Recap,
  outro: Outro,
};
