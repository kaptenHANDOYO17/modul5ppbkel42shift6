@echo off
setlocal EnableDelayedExpansion
title Bore ^& Barrel PWA - Push ke GitHub
cd /d "%~dp0"
echo ==================================================
echo   Push project ke repository GitHub baru
echo ==================================================

where git >nul 2>nul || (
  echo [X] Git belum terpasang. Download di https://git-scm.com lalu jalankan ulang.
  start https://git-scm.com/download/win
  pause & exit /b 1
)

if not exist ".git" git init -b main

rem --- identitas git (hanya jika belum diatur) ---
for /f "delims=" %%e in ('git config user.email') do set GITMAIL=%%e
if "!GITMAIL!"=="" (
  set /p GITNAME=Nama untuk commit git: 
  set /p GITMAIL=Email akun GitHub: 
  git config user.name "!GITNAME!"
  git config user.email "!GITMAIL!"
)

git branch -M main
git add .
git diff --cached --quiet || git commit -m "feat: modul 5 PWA terintegrasi API"

rem --- buang remote bawaan repo modul (SekarBnY) ---
for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set ORIGIN=%%u
echo !ORIGIN! | find /i "SekarBnY" >nul && (
  git remote remove origin
  set ORIGIN=
)

if "!ORIGIN!"=="" (
  set REPONAME=modul5-pwa
  set /p REPONAME=Nama repository baru [modul5-pwa]: 

  rem Jalur 1: GitHub CLI (buat repo + push otomatis)
  where gh >nul 2>nul && gh auth status >nul 2>nul && (
    gh repo create "!REPONAME!" --public --source . --remote origin --push && goto :done
  )

  rem Jalur 2: buat repo lewat browser, lalu tempel link-nya
  echo.
  echo Halaman GitHub "New repository" akan terbuka.
  echo  - Isi nama: !REPONAME!   - JANGAN centang "Add a README"
  echo  - Klik "Create repository", lalu copy link .git-nya
  start https://github.com/new?name=!REPONAME!
  echo.
  set /p REPOURL=Tempel link repo di sini lalu Enter: 
  git remote add origin "!REPOURL!"
)

echo [+] Push ke GitHub (kalau diminta login, login lewat browser yang muncul)...
git push -u origin main || (echo [X] Push gagal. Cek link repo / login GitHub. & pause & exit /b 1)

:done
echo.
echo [OK] Selesai! Project sudah ada di GitHub.
for /f "delims=" %%u in ('git remote get-url origin') do echo      %%u
echo      Langkah berikut: buka https://vercel.com/new lalu Import repo ini.
pause
