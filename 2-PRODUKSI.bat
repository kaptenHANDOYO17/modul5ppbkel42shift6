@echo off
title Bore ^& Barrel PWA - Build Produksi
cd /d "%~dp0"
where node >nul 2>nul || (echo [X] Node.js belum terpasang. & start https://nodejs.org & pause & exit /b 1)
call npm install --no-audit --no-fund
echo [+] Build produksi (npm run build)...
call npm run build || (echo [X] Build gagal & pause & exit /b 1)
echo [+] Membuka hasil build di browser (npm run preview)...
call npm run preview -- --open
pause
