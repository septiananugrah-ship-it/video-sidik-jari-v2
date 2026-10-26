# Konteks repo (untuk asisten AI)

- **v2** dari video "Sidik Jari Molekul" (Kimia Kuantum Gerak Vibrasi) milik **Yayan** — salinan video Claude yang pertama (repo `Claude-Video-Kimia` tetap utuh, jangan diubah dari sini). Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Gaya v2: **tetap gaya asli** (biru tua + emas–sian, atom bercahaya, kartu kaca biru) dengan palet lebih segar. Yayan menolak versi studio arang abu-abu (warna jadi luntur/layu) — jangan kembali ke sana. Arah pengembangan: animasi jauh lebih banyak & terus bergerak, ilustrasi vektor lebih kaya (lihat teknik di `src/uji/UjiGayaVektor.tsx`: penampang, kolom sinar, angka detektor, lengkung energi emas), tetapi warnanya segar.
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah perubahan masuk ke `main`, berhenti dan minta Yayan menekan *Run workflow* sendiri.
- Voice-over: suara klon Yayan, disalin dari `Claude-Video-Kimia` terbaru (naskah identik). Kalau naskah diubah, baris itu harus dibuat ulang lewat workflow voice-over (Yayan yang menjalankan).

## Primitif efek (`src/components/primitives.tsx`)

- `Spark` — partikel bercahaya (inti putih + halo + jejak opsional) untuk bola/atom/titik yang bergerak.
- `Ripple` — riak cincin yang mengembang (foton diserap, simpul menyala).
- `Motes` — debu cahaya berkelip di sekitar objek fokus.
- `Atom` punya cahaya tepi; `Card` punya garis aksen atas + kilau sapuan saat muncul.

## QA

- `CHROME_PATH=<headless-shell> node scripts/qa-lines.mjs <dir> [sceneId ...]` — still di akhir setiap baris narasi (±220 still). Lebih andal daripada 2–3 still per adegan untuk menemukan label yang bertabrakan.
- Dua proses paralel boleh, tapi jangan mengedit berkas saat proses bundling berjalan.
- **Uji kemulusan (glitch):** `node scripts/qa-film.mjs out/a.mp4 <frameAwal> <frameAkhir> 0.25` (±12 fps di mesin 2 inti; seluruh film ±45 menit, pecah per 6000 frame) lalu `python3 scripts/qa-glitch.py out/a.mp4 <frameAwal>`. Lonjakan tunggal beda antar-frame = pop/loncatan; abaikan keyframe encoder (sudah dikecualikan skrip). Periksa dengan mengekstrak frame f-1 dan f.

## Aturan kemulusan (pelajaran v2)

- `EASE` bawaan sekarang ease-out lembut (0.3, 0.05, 0.15, 1). Versi lama (0.16, 1, 0.3, 1) melompat di frame pertama — terutama terasa saat subtitle/elemen memudar keluar. Untuk fade keluar pakai `EASE_IN_OUT`.
- Jangan pernah mengganti teks, warna, filter (`glow`), atau elemen berdasarkan ambang (`x > 0.5 ? A : B`, `t > c ? 1 : 0.55`). Selalu bersilang-pudar dua versi atau `interpolateColors`.
- Siklus berulang (`% 1`: asap, gelembung, cincin) pakai `cyc(ph)` dari `anim.ts` agar tidak muncul mendadak di awal siklus. Hindari gerak gigi gergaji (`(t * k) % n`) pada posisi yang terlihat.
- Jangan pakai CSS `filter: blur()` pada lapisan seluruh adegan: Chrome menerapkannya mendadak (tajam → kabur dalam 1 frame). Transisi bab cukup opacity + skala + kilatan.
- `SceneShell` memakai `willChange: 'transform'` agar teks yang ikut bergeser/ber-skala halus tidak meloncat 1 piksel (teks tetap tajam).
- Kisi latar heksagonal harus dibungkus dengan periode tepat (√3·r horizontal, 3r vertikal), kalau tidak ada loncatan berkala.

