@echo off
title Bore ^& Barrel PWA - Build Produksi
cd /d "%~dp0"
where node >nul 2>nul || (echo [X] Node.js belum terpasang. & start https://nodejs.org & pause & exit /b 1)
if not exist "node_modules" call npm install
echo [+] Build produksi (npm run build)...
call npm run build || (echo [X] Build gagal & pause & exit /b 1)
echo [+] Membuka hasil build di browser (npm run preview)...
call npm run preview -- --open
pause
