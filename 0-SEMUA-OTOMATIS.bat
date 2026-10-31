@echo off
title Bore ^& Barrel PWA - Semua Otomatis
cd /d "%~dp0"
echo ==================================================
echo   SEMUA OTOMATIS: install - build - push - jalankan
echo ==================================================

where node >nul 2>nul || (echo [X] Node.js belum terpasang. & start https://nodejs.org & pause & exit /b 1)
where git >nul 2>nul || (echo [X] Git belum terpasang. & start https://git-scm.com/download/win & pause & exit /b 1)

if not exist ".env" (
  > .env echo VITE_API_BASE_URL=https://sxunubxupdxyupnebuid.supabase.co
  >> .env echo VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TXg9-r3ZVI8YZMzE90nwsQ_PU9GAmzg
)

echo.
echo [1/4] npm install ...
call npm install --no-audit --no-fund || (echo [X] npm install gagal & pause & exit /b 1)

echo.
echo [2/4] npm run build (cek tidak ada error) ...
call npm run build || (echo [X] Build gagal & pause & exit /b 1)

echo.
echo [3/4] Commit + push ke GitHub ...
git add .
git diff --cached --quiet || git commit -m "chore: update project dari laptop"
git push -u origin main
if errorlevel 1 (
  echo [!] Push langsung gagal, coba gabungkan dengan isi GitHub dulu...
  git pull origin main --allow-unrelated-histories --no-edit -X ours
  git push -u origin main || echo [!] Push gagal - cek login GitHub. Lanjut menjalankan aplikasi.
)

echo.
echo [4/4] Menjalankan aplikasi, browser akan terbuka...
echo       Vercel otomatis deploy ulang setelah push (kalau repo sudah di-import).
call npm run dev -- --open
pause
