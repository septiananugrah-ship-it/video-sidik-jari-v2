# Sidik Jari Molekul v2

Salinan dari repo `Claude-Video-Kimia` (video Claude yang pertama) untuk dikembangkan jadi animasi yang lebih padat dan hidup, tetap dengan gaya aslinya: langit biru tua, aksen emas–sian yang segar, atom bercahaya, pegas heliks emas, partikel berjejak, riak cahaya, dan subtitle kata-per-kata bergaris emas. Palet warna dibuat sedikit lebih segar daripada versi pertama.

**Voice-over:** suara klon Yayan (ElevenLabs `eleven_v4`), disalin dari repo `Claude-Video-Kimia` terbaru; naskahnya identik, jadi timing tetap sinkron (±18:53).


Film edukasi **kimia kuantum** tentang getaran molekul dan spektroskopi FTIR, dibuat ulang dari nol dengan [Remotion](https://remotion.dev).
1920 × 1080 / 2560 × 1440 · 30 FPS · **±16 menit** · 16 bab + pembuka, judul, peta video, dan penutup.

> Gaya visual terinspirasi video referensi "sarang lebah": panggung gelap, objek yang bertransformasi dengan mulus, kisi heksagonal halus, dan subtitle kata-per-kata dengan kata kunci yang disorot emas.

## Alur cerita

Topik tugas: **Kimia Kuantum Gerak Vibrasi** — mencakup tiga bagian wajib (prinsip & teori dasar · implementasi dalam kimia · penerapan di industri). Daftar bab bertimecode untuk deskripsi YouTube/LMS ada di `naskah/BAB_YOUTUBE.txt`.

| Waktu | Bagian | Bab |
|---|---|---|
| 00:00 | — | Pembuka: dua plastik kembar · Judul · Peta video |
| 01:08 | 1 · Teori dasar | 01 Tidak ada yang benar-benar diam · 02 Ikatan kimia sebagai pegas · 03 Kekakuan dan massa (+ contoh hitungan k H–Cl ≈ 480 N/m) |
| 04:10 | 1 · Teori dasar | 04 Lanskap energi · 05 Lompatan kuantum · 06 Awan kemungkinan · 07 Energi titik nol · 08 Bertemu cahaya inframerah · 09 Pegas yang tidak sempurna (overtone, Boltzmann) |
| 09:20 | 2 · Implementasi kimia | 10 Banyak atom, banyak irama (CO₂) · 11 Di dalam alat FTIR · 12 Membaca spektrum · 13 PE lawan PET |
| 13:09 | 3 · Industri | 14 FTIR di laboratorium mutu · 15 Dari sensor gas hingga farmasi (NDIR, polimorf, NIR) |
| 14:59 | — | 16 Merangkai semuanya · Penutup & rujukan |

Narasi: suara ElevenLabs (Bagas, `eleven_v4`), ±16 menit. Thumbnail 2560×1440: `preview/thumbnail.png` (komposisi `Thumbnail`).

## Naskah & voice-over

- **`naskah/NASKAH_VOICEOVER.md`** — naskah teleprompter: timecode tiap baris, perkiraan durasi baca, jeda setelah baris, dan kata kunci (tebal) yang perlu ditekankan. Ikuti ini saat merekam suara.
- `naskah/naskah-polos.txt` — teks narasi polos per bab.
- `naskah/narasi.srt` — subtitle (bisa diunggah ke YouTube).

Timing dihitung otomatis dari jumlah suku kata (±5,3 suku kata/detik ≈ 120–125 kata/menit — tempo narator edukasi yang tenang) ditambah jeda tanda baca dan jeda antar-baris yang diatur di naskah. **Seluruh animasi menempel pada penanda baris dan kata**, jadi jika naskah diubah, visual, subtitle, dan musik ikut bergeser.

### Mengubah naskah

Edit `src/script.ts` (teks, kata yang disorot `hl`, dan `pause` sesudah baris), lalu:

```bash
npm run timeline   # perbarui naskah VO, SRT, dan peta musik
npm run music      # sintesis ulang backsound agar pas dengan durasi baru
```

### Voice-over

**Rekam sendiri (disarankan):** baca `naskah/NASKAH_VOICEOVER.md` sambil memutar video (subtitle berfungsi sebagai teleprompter), lalu tumpuk rekaman di editor video. Atau rekam per baris dengan nama `public/voiceover/<kode-baris>.mp3` (mis. `hook-00.mp3`), kemudian:

```bash
npm run voiceover -- --measure   # ukur rekaman → src/voiceover.ts; timeline menyesuaikan durasi asli
npm run timeline && npm run music
npx remotion render src/index.ts SidikJariMolekul out/final.mp4 --props='{"voiceover":true,"musicVolume":0.35}'
```

**ElevenLabs (opsional):** isi kunci API, maka setiap baris dibuat otomatis (model `eleven_multilingual_v2`, bahasa Indonesia):

```bash
ELEVENLABS_API_KEY=xxxx ELEVENLABS_VOICE_ID=<voice-id> npm run voiceover
npm run timeline && npm run music
```

## Musik

`public/music.mp3` adalah backsound **orisinal** yang disintesis oleh `scripts/make-music.py` (numpy + ffmpeg, tanpa sampel berlisensi). Setiap bab punya suasana sendiri — misterius, megah, penuh rasa ingin tahu, "kuantum" yang berkilau, tegang, cerah, dan resolusi — dengan *whoosh* lembut di setiap pergantian bab dan dentuman pada judul. Kenyaringan ±−21 LUFS agar aman ditimpa narasi.

## Menjalankan

```bash
npm ci
npm run dev          # Remotion Studio: pilih "SidikJariMolekul", atau folder "Adegan" untuk tiap bab
npm run render       # ekspor MP4 1080p ke out/
npm run render:preview   # pratinjau cepat 960×540
```

Props komposisi: `showCaptions` (subtitle on/off), `musicVolume` (0–1), `voiceover` (putar file di `public/voiceover/`).
### Render 2K di GitHub Actions (untuk diunduh)

1. Buka tab **Actions** → **Render Sidik Jari Molekul 2K 30FPS** → **Run workflow**.
2. Pilih branch, resolusi **2k** (2560×1440, 30 FPS) atau 1080p, lalu jalankan.
3. Film dipotong menjadi 12 bagian yang dirender paralel (masing-masing diverifikasi jumlah framenya), lalu job *assemble* menggabungkannya tanpa re-encode dan menambahkan audio.
4. Setelah selesai (±30–45 menit), unduh artefak **sidik-jari-molekul-2k-30fps** di halaman run tersebut (ZIP berisi MP4 H.264 + AAC, ±450 MB).

Versi 2K adalah komposisi `SidikJariMolekul2K`: seluruh desain 1920×1080 diperbesar 4/3 sebagai vektor, sehingga teks, garis, dan atom tetap tajam (bukan upscale gambar). Lokal: `node --experimental-strip-types scripts/render-chunk.ts` (dengan `CHUNK`/`CHUNKS`) lalu `./scripts/assemble.sh`.

Di lingkungan Linux tanpa Chrome lengkap, arahkan Remotion ke *headless shell*: `CHROME_PATH=/path/ke/headless_shell npm run render`.

## Poles visual (Oktober 2026)

Tanpa mengubah naskah (voice-over tetap sinkron): bola dan titik yang bergerak kini berupa partikel bercahaya berjejak (`Spark`) — di grafik Hooke, lanskap energi, tanjakan klasik vs tangga kuantum, sumur fungsi gelombang, dan lompatan v = 0 → 1; foton yang diserap HCl memicu riak cahaya (`Ripple`) dan debu cahaya (`Motes`); CO₂ di atmosfer beriak merah saat menyerap panas; atom H meninggalkan bayangan gerak saat berosilasi; simpul rangkuman menyala dengan riak; sidik jari pembuka dikelilingi debu emas; atom diberi cahaya tepi dan kartu rumus diberi garis aksen + kilau. Gerak global: partikel cahaya melayang naik di seluruh film (`Drift`), kamera berayun halus, pendar atom bernapas, dan kartu rumus melayang pelan. Dua tabrakan tata letak diperbaiki (kartu hukum Hooke vs sumbu grafik, kartu efek rumah kaca vs heading bab).

## Struktur kode

```
src/script.ts            naskah: scene, baris, kata kunci, jeda
src/timeline.ts          naskah → waktu scene/baris/kata (tanpa dependensi Remotion)
src/SceneContext.tsx     useScene(): waktu lokal + cue(i), wordOf(i, "kata") untuk sinkronisasi
src/Composition.tsx      susunan film: latar, scene + transisi kamera, heading bab, subtitle, audio
src/components/          latar & grain, subtitle kata-per-kata, heading bab, primitif (atom, pegas, ikatan, panah, kartu), visual sains (spektrum, foton, fungsi gelombang, sidik jari)
src/scenes/              satu file per bab
scripts/                 export-timeline, make-music.py, generate-voiceover, qa-stills
```

Semua gerak digerakkan oleh frame (`useCurrentFrame` → detik → `interpolate`/easing), tanpa animasi CSS, sehingga render deterministik.

## Catatan ilmiah

Model bola-pegas dan parabola adalah pendekatan; kurva fungsi gelombang memakai fungsi Hermite osilator harmonik sebenarnya. Angka acuan: H³⁵Cl ≈ 2886 cm⁻¹, D³⁵Cl ≈ 2091 cm⁻¹; CO₂ ν₃ ≈ 2349 cm⁻¹, ν₂ ≈ 667 cm⁻¹, ν₁ ≈ 1388 cm⁻¹ (aktif Raman); PET C=O ≈ 1715 cm⁻¹, C–O ≈ 1240/1095 cm⁻¹; PE C–H ≈ 2915/2848, 1470, 720 cm⁻¹. Spektrum di layar bersifat skematis untuk tujuan edukasi.
