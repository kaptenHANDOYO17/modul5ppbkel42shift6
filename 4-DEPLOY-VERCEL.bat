@echo off
title Bore ^& Barrel PWA - Deploy Vercel
cd /d "%~dp0"
echo ==================================================
echo   Deploy langsung ke Vercel (opsional)
echo   Cara modul: import repo GitHub di vercel.com/new
echo   Cara cepat: file ini (login Vercel lewat browser)
echo ==================================================
where node >nul 2>nul || (echo [X] Node.js belum terpasang. & pause & exit /b 1)
call npx --yes vercel@latest --prod --yes
pause
