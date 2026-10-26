import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {SidikJariMolekul, SidikJariMolekul2K, SingleScene, defaultVideoProps} from './Composition';
import {Thumbnail} from './Thumbnail';
import {UJI_DUR, UJI_FPS, UjiGayaVektor} from './uji/UjiGayaVektor';
import {FPS, TIMELINE, TOTAL_FRAMES} from './timeline.ts';
import './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SidikJariMolekul"
      component={SidikJariMolekul}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES}
      defaultProps={defaultVideoProps}
    />
    <Composition
      id="SidikJariMolekul2K"
      component={SidikJariMolekul2K}
      width={2560}
      height={1440}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES}
      defaultProps={defaultVideoProps}
    />
    <Composition id="UjiGayaVektor" component={UjiGayaVektor} width={1920} height={1080} fps={UJI_FPS} durationInFrames={UJI_DUR * UJI_FPS} />
    <Still id="Thumbnail" component={Thumbnail} width={2560} height={1440} />
    <Folder name="Adegan">
      {TIMELINE.scenes.map((s) => (
        <Composition
          key={s.id}
          id={`Adegan-${String(s.index).padStart(2, '0')}-${s.id}`}
          component={SingleScene}
          width={1920}
          height={1080}
          fps={FPS}
          durationInFrames={Math.round(s.duration * FPS)}
          defaultProps={{sceneId: s.id}}
        />
      ))}
    </Folder>
  </>
);
