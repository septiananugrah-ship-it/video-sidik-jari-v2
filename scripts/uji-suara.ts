// Uji model suara: buat beberapa baris dengan model pilihan TANPA menimpa voice-over yang ada.
//
//   ELEVENLABS_API_KEY=xxx ELEVENLABS_VOICE_ID=xxx ELEVENLABS_MODEL=eleven_v4_turbo UJI_BARIS="hook-02,spring-06" node --experimental-strip-types scripts/uji-suara.ts
//
// Hasil di out/uji/: <kode>-<model>.mp3 (baru) dan <kode>-lama.mp3 (salinan rekaman yang sudah ada) untuk dibandingkan.
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {SCRIPT} from '../src/script.ts';
import {lineKey} from '../src/timeline.ts';

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
const modelId = process.env.ELEVENLABS_MODEL || 'eleven_v4_turbo';
const keys = (process.env.UJI_BARIS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!apiKey || !voiceId) throw new Error('ELEVENLABS_API_KEY dan ELEVENLABS_VOICE_ID wajib diisi.');
if (!keys.length) throw new Error('UJI_BARIS kosong.');

mkdirSync('out/uji', {recursive: true});
let chars = 0;
for (const key of keys) {
  const scene = SCRIPT.find((s) => s.lines.some((_, i) => lineKey(s.id, i) === key));
  if (!scene) throw new Error(`Kode baris tidak dikenal: ${key}`);
  const i = scene.lines.findIndex((_, j) => lineKey(scene.id, j) === key);
  const line = scene.lines[i];
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg'},
    body: JSON.stringify({
      text: line.text,
      model_id: modelId,
      ...(modelId.includes('multilingual_v2') ? {} : {language_code: 'id'}),
      previous_text: scene.lines[i - 1]?.text,
      next_text: scene.lines[i + 1]?.text,
      voice_settings: {stability: 0.55, similarity_boost: 0.75, style: 0, speed: 0.95},
    }),
  });
  if (!res.ok) throw new Error(`${key}: ${res.status} ${await res.text()}`);
  writeFileSync(`out/uji/${key}-${modelId}.mp3`, Buffer.from(await res.arrayBuffer()));
  const old = `public/voiceover/${key}.mp3`;
  if (existsSync(old)) copyFileSync(old, `out/uji/${key}-lama.mp3`);
  chars += line.text.length;
  console.log(`✓ ${key} (${line.text.length} karakter): ${line.text}`);
}
console.log(`Selesai: ${keys.length} baris, ${chars} karakter dengan ${modelId}.`);
