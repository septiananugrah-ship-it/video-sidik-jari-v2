// Pratinjau potongan film utama: node scripts/preview-range.mjs <out.mp4> <detikMulai> <detikSelesai> [scale]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [out, a, b, sc = '0.5'] = process.argv.slice(2);
const browserExecutable = process.env.CHROME_PATH ?? null;
const inputProps = {showCaptions: true, musicVolume: 0.5, voiceover: false};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'SidikJariMolekul', inputProps, browserExecutable});
await renderMedia({serveUrl, composition, codec: 'h264', crf: 22, outputLocation: out, inputProps, browserExecutable, scale: Number(sc), concurrency: 2, frameRange: [Math.round(Number(a) * 30), Math.round(Number(b) * 30) - 1]});
console.log(out);
