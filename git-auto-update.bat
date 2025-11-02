@echo off
REM ==============================
REM  Auto Git Commit & Push Script (Safe)
REM  Project: e-aset-app
REM  Author: farhanop
REM ==============================

cd /d "C:\Users\farhanop\Documents\Projects\e-aset-app"

REM Konfigurasi user Git
git config user.name "farhanop"
git config user.email "farhanop@uigm.ac.id"

REM Pastikan .env tidak pernah diupload
if not exist ".gitignore" (
    echo .gitignore belum ada, membuat baru...
    echo .env>>.gitignore
) else (
    findstr /C:".env" .gitignore >nul 2>&1
    if errorlevel 1 (
        echo Menambahkan .env ke .gitignore...
        echo .env>>.gitignore
    )
)

REM Pastikan file .env tidak dalam staging
git reset HEAD .env >nul 2>&1

REM Cek status repo
echo --------------------------------------
echo 🔍 Memeriksa perubahan di repository...
git status

REM Tambahkan semua perubahan kecuali .env
echo --------------------------------------
echo ➕ Menambahkan file yang berubah (kecuali .env)...
git add --all
git reset .env >nul 2>&1

REM Buat pesan commit dengan tanggal dan jam otomatis
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set TANGGAL=%%a-%%b-%%c
for /f "tokens=1 delims= " %%a in ('time /t') do set JAM=%%a
set PESAN=Auto update %TANGGAL% %JAM%

REM Commit
git commit -m "%PESAN%" >nul 2>&1

REM Push ke GitHub
echo --------------------------------------
echo 🚀 Mengirim ke GitHub...
git push origin main

echo.
echo ✅ Proyek e-aset-app berhasil diupdate ke GitHub (tanpa .env).
echo --------------------------------------
pause
