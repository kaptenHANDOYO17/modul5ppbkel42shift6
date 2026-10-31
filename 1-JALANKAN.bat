@echo off
title Bore ^& Barrel PWA - Jalankan
cd /d "%~dp0"
echo ==================================================
echo   MODUL 5 PWA - Install + Jalankan (mode dev)
echo ==================================================

where node >nul 2>nul || (
  echo [X] Node.js belum terpasang. Download di https://nodejs.org lalu jalankan ulang file ini.
  start https://nodejs.org
  pause & exit /b 1
)

if not exist ".env" (
  echo [+] Membuat file .env ...
  > .env echo VITE_API_BASE_URL=https://sxunubxupdxyupnebuid.supabase.co
  >> .env echo VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TXg9-r3ZVI8YZMzE90nwsQ_PU9GAmzg
)

if not exist "node_modules" (
  echo [+] Install dependencies, tunggu sebentar...
  call npm install || (echo [X] npm install gagal & pause & exit /b 1)
)

echo [+] Menjalankan server dev, browser akan terbuka otomatis.
echo     Tutup jendela ini untuk menghentikan server.
call npm run dev -- --open
pause
