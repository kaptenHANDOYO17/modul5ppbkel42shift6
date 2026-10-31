# Cara Pakai (Modul 5 – PWA II + Tugas)

## Sekali klik

| File | Fungsi |
|---|---|
| **`0-SEMUA-OTOMATIS.bat`** | `npm install` → `npm run build` → commit & push ke GitHub → `npm run dev` + buka browser |
| `1-JALANKAN.bat` | `npm install` lalu `npm run dev` (buka browser) |
| `2-PRODUKSI.bat` | `npm run build` + `npm run preview` (cek PWA mode produksi) |
| `3-PUSH-KE-GITHUB.bat` | Commit lalu push ke https://github.com/kaptenHANDOYO17/modul5ppbkel42shift6 |
| `4-DEPLOY-VERCEL.bat` | (Opsional) deploy langsung ke Vercel |

Yang perlu terpasang di laptop: **Node.js** dan **Git**.
Kalau repo sudah di-import di Vercel, setiap push otomatis memicu deploy ulang.

## Tugas — di mana & bagaimana demo-nya

| # | Tugas | Implementasi | Cara demo |
|---|---|---|---|
| 1 | Share link unik | `components/common/ShareButton.jsx`, `utils/share.js`, deep link di `App.jsx` | Buka produk → **Share** (atau ikon share di kartu) → Copy / WhatsApp. Link `/?gun=<id>` langsung membuka detail produk itu. |
| 2 | Lazy load | `React.lazy` + `Suspense` di `App.jsx`; `loading="lazy"` pada gambar | `npm run build` → setiap halaman jadi chunk JS sendiri (CartPage-xxx.js, ProfilePage-xxx.js, …). DevTools → Network: chunk baru diunduh saat halaman dibuka. |
| 3 | Query caching | TanStack Query: `lib/queryClient.js`, `hooks/useGuns.js`, `hooks/useReviews.js` (persist ke localStorage) | Bar **"Cached · updated … · Refresh"** di katalog. Pindah tab lalu kembali → tidak ada request ulang (cek Network). Reload/offline → data tetap muncul dari cache. |
| 4 | About & Contact jadi section di Profile | `pages/About.jsx`, `pages/Contact.jsx` dirender di `ProfilePage.jsx` | Menu About/Contact hilang dari navbar; muncul di bawah halaman **Profile**. |
| 5 | Lihat semua draft di Profile | Section **Saved drafts** di `ProfilePage.jsx` | Add Hardware → isi → **Save Draft** → Profile: draft muncul, bisa **Continue** / hapus. |
| 6 | Soft delete / arsip | `stores/archiveStore.js`, `pages/ArchivePage.jsx`, section **Archive** di Profile | Ikon 🗃️ di kartu / tombol **Archive** di detail → item hilang dari katalog. Profile → **Open Archive** → **Restore** atau **Delete** permanen. |
| 7 | CRUD review + 👍/👎 | `components/gun/ReviewSection.jsx`, `hooks/useReviews.js` | Detail produk → tulis review (Create) → **Edit** / **Delete** pada review milikmu (Update/Delete) → 👍/👎 di setiap review. |
| 8 | Edit nama & bio di page baru | `pages/EditProfilePage.jsx` | Profile → **Edit Profile** → halaman terpisah → Save. |
| 9 | Keranjang + checkout ke WA | `stores/cartStore.js`, `pages/CartPage.jsx`, `config/store.js` | **Add to Cart** → menu **Cart** → atur jumlah → **Checkout via WhatsApp** → terbuka chat ke 0895-3781-69126 dengan pesan *"Hi aku mau pesan ...."* berisi daftar pesanan & total. |

Catatan: data tambahan (arsip, keranjang, vote review) disimpan di localStorage,
mengikuti pola favorites di modul. Review dicoba ke server Supabase dulu; kalau
server menolak (RLS) atau offline, perubahan tetap tersimpan di perangkat.

Di HP: buka link Vercel → menu Share/⋮ → **Add to Home Screen / Install**.
