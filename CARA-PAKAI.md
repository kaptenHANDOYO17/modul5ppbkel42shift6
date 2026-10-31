# Cara Pakai (Modul 5 – PWA II)

Semua kode dari modul sudah terpasang. Cukup double-click file `.bat` sesuai urutan:

| File | Fungsi |
|---|---|
| `1-JALANKAN.bat` | Buat `.env`, `npm install`, lalu `npm run dev` dan buka browser |
| `2-PRODUKSI.bat` | `npm run build` + `npm run preview` (cek PWA mode produksi) |
| `3-PUSH-KE-GITHUB.bat` | Commit, buat repo GitHub baru, lalu `git push -u origin main` |
| `4-DEPLOY-VERCEL.bat` | (Opsional) deploy langsung ke Vercel tanpa lewat dashboard |

Yang perlu terpasang di laptop: **Node.js** dan **Git**.

Setelah push, deploy sesuai modul: buka https://vercel.com/new → login GitHub →
Import repo → Deploy. File `.env` ikut ter-commit, jadi tidak perlu isi
Environment Variables di Vercel.

Di HP: buka link Vercel → menu Share/⋮ → **Add to Home Screen / Install**.
