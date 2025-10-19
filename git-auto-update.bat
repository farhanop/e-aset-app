@echo off
REM ==============================
REM  Auto Git Commit & Push Script
REM  Project: e-aset-app
REM  Author: farhanop
REM ==============================

cd /d "C:\Users\farhanop\Documents\Projects\e-aset-app"

REM Konfigurasi user Git (hanya perlu sekali, tapi aman kalau dijalankan berulang)
git config user.name "farhanop"
git config user.email "farhanop@uigm.ac.id"

REM Cek status repo
echo --------------------------------------
echo 🔍 Memeriksa perubahan di repository...
git status

REM Tambahkan semua perubahan
echo --------------------------------------
echo ➕ Menambahkan semua file yang berubah...
git add .

REM Buat pesan commit dengan tanggal otomatis
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set TANGGAL=%%a-%%b-%%c
for /f "tokens=1 delims= " %%a in ('time /t') do set JAM=%%a
set PESAN=Auto update %TANGGAL% %JAM%

git commit -m "%PESAN%"

REM Push ke GitHub
echo --------------------------------------
echo 🚀 Mengirim ke GitHub...
git push origin main

echo.
echo ✅ Proyek e-aset-app berhasil diupdate ke GitHub.
echo --------------------------------------
pause
