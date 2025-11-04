#!/bin/bash
cd /var/www/e-aset-app || { echo "❌ Folder tidak ditemukan"; exit 1; }

git config user.name "farhanop"
git config user.email "farhanop@uigm.ac.id"

if [ ! -f ".gitignore" ]; then
  echo ".env" > .gitignore
elif ! grep -q ".env" .gitignore; then
  echo ".env" >> .gitignore
fi

git restore --staged .env 2>/dev/null

if [ -n "$(git status --porcelain)" ]; then
  git add --all
  git restore --staged .env
  git commit -m "Auto update $(date '+%Y-%m-%d %H:%M')"
  git push origin main
  echo "✅ Update sukses dikirim ke GitHub."
else
  echo "⚠️ Tidak ada perubahan untuk di-commit."
fi
