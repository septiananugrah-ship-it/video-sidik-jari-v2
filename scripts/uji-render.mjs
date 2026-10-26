// Render adegan uji gaya vektor: still di detik tertentu, atau video pratinjau.
//   CHROME_PATH=... node scripts/uji-render.mjs stills <out-dir> 2 6 10 14 17
//   CHROME_PATH=... node scripts/uji-render.mjs video <out.mp4> [scale]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const [mode = 'stills', out = 'out/uji', ...rest] = process.argv.slice(2);
const browserExecutable = process.env.CHROME_PATH ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const comp = await selectComposition({serveUrl, id: 'UjiGayaVektor', browserExecutable, puppeteerInstance});
if (mode === 'stills') {
  mkdirSync(out, {recursive: true});
  for (const s of rest.map(Number)) {
    const file = path.join(out, `uji-${String(s).replace('.', '_')}s.jpg`);
    await renderStill({serveUrl, composition: comp, frame: Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps)), output: file, browserExecutable, puppeteerInstance, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5});
    console.log(file);
  }
} else {
  await renderMedia({serveUrl, composition: comp, codec: 'h264', crf: 20, outputLocation: out, browserExecutable, scale: Number(rest[0] ?? 0.5), concurrency: 2});
  console.log(out);
}
await puppeteerInstance.close({silent: true});
