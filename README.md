Tahap 1: Persiapan Server Ubuntu 🐧
Login ke Server via SSH:

Bash

ssh username@alamat_ip_server
Update Sistem:

Bash

sudo apt update && sudo apt upgrade -y
Install Node.js dan npm: Kita gunakan NVM (Node Version Manager) untuk kemudahan mengelola versi Node.js.

Bash

# Instal curl (jika belum ada)
sudo apt install curl -y

# Download dan jalankan skrip instalasi NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Muat NVM ke sesi terminal saat ini
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Verifikasi instalasi NVM
nvm --version

# Instal versi LTS (Long Term Support) terbaru dari Node.js
nvm install --lts

# Verifikasi instalasi Node.js dan npm
node -v
npm -v
Install MySQL Server:

Bash

sudo apt install mysql-server -y

# Jalankan skrip keamanan (opsional tapi direkomendasikan)
sudo mysql_secure_installation
# Ikuti petunjuk di layar (atur password root, hapus user anonim, dll.)

# Cek status MySQL
sudo systemctl status mysql
Install Nginx (Web Server / Reverse Proxy):

Bash

sudo apt install nginx -y

# Cek status Nginx
sudo systemctl status nginx
Install PM2 (Process Manager):

Bash

sudo npm install pm2 -g
Tahap 2: Setup Database 🗄️
Login ke MySQL:

Bash

sudo mysql -u root -p
# Masukkan password root MySQL yang Anda atur
Buat Database dan User: Ganti password_kuat_anda dengan password yang aman.

SQL

CREATE DATABASE db_aset;
CREATE USER 'easet_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON db_aset.* TO 'easet_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
(Nanti) Anda perlu mengimpor skema database Anda (file .sql) ke database db_aset ini.

Tahap 3: Deploy Backend (NestJS) ⚙️
Buat Direktori Aplikasi:

Bash

sudo mkdir -p /var/www/easet-app
sudo chown $USER:$USER /var/www/easet-app # Berikan izin ke user Anda
cd /var/www/easet-app
Dapatkan Kode Backend:

Jika via Git:

Bash

git clone https://github.com/username/e-aset-app.git . # Ganti URL repo
cd backend
Jika via Upload (misal: SCP atau SFTP): Upload folder backend Anda ke /var/www/easet-app/ di server, lalu masuk ke foldernya:

Bash

cd /var/www/easet-app/backend
Instal Dependensi:

Bash

npm install --production # Hanya instal dependensi produksi
Konfigurasi Environment:

Buat file .env di dalam folder backend.

Isi dengan konfigurasi database dan JWT secret Anda:

Code snippet

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=easet_user
DB_PASSWORD=password_kuat_anda
DB_DATABASE=db_aset

# JWT
JWT_SECRET=rahasia_jwt_anda_yang_sangat_kuat # Ganti dengan secret acak yang kuat
JWT_EXPIRATION_TIME=30m # Sesuaikan jika perlu

# Aplikasi
PORT=3000 # Port internal untuk backend
NODE_ENV=production
PENTING: Pastikan Anda menggunakan secret JWT yang sama seperti saat development atau generate yang baru dan kuat.

Impor Skema Database:

Jika Anda punya file schema.sql, unggah ke server (misalnya ke /tmp/).

Impor ke database:

Bash

sudo mysql -u easet_user -p db_aset < /tmp/schema.sql
Build Aplikasi Backend:

Bash

npm run build
Jalankan dengan PM2:

Bash

pm2 start dist/main.js --name "easet-backend"
Simpan Konfigurasi PM2 untuk Startup Otomatis:

Bash

pm2 startup # Ikuti instruksi (salin & jalankan perintah yang muncul)
pm2 save
Verifikasi Backend: Coba akses dari server itu sendiri (jika curl terinstal):

Bash

curl http://localhost:3000
# Anda seharusnya melihat pesan error atau respons default NestJS (bukan "Connection refused")
Tahap 4: Deploy Frontend (React/Vite) ✨
Dapatkan Kode Frontend:

Jika via Git: (Anda sudah clone di langkah backend)

Bash

cd /var/www/easet-app/frontend
Jika via Upload: Upload folder frontend Anda ke /var/www/easet-app/ di server, lalu masuk ke foldernya:

Bash

cd /var/www/easet-app/frontend
Instal Dependensi:

Bash

npm install
Konfigurasi URL API:

Buka file konfigurasi Axios Anda (misalnya src/api/axios.ts).

Pastikan baseURL tidak menunjuk ke http://localhost:3000 lagi. Idealnya, atur agar relatif ke domain, misalnya /api atau kosongkan saja jika Anda memanggil langsung ke /api/endpoint.

TypeScript

// Contoh di src/api/axios.ts
const apiClient = axios.create({
  baseURL: '/api', // Akan diarahkan oleh Nginx nanti
  // ...
});
Jika Anda menggunakan variabel environment (.env), pastikan VITE_API_BASE_URL=/api.

Build Aplikasi Frontend:

Bash

npm run build
Ini akan membuat folder dist di dalam frontend.

(Opsional) Jalankan dengan PM2 Serve (jika tidak ingin Nginx serve langsung):

Ini berguna jika Anda ingin PM2 mengelola server statisnya.

Bash

# Jalankan PM2 serve untuk folder 'dist' di port 8080 (contoh)
pm2 serve dist 8080 --name "easet-frontend" --spa
pm2 save # Simpan agar otomatis start
Jika menggunakan cara ini, Nginx nanti akan di-proxy ke port ini (misal, 8080).

Tahap 5: Konfigurasi Nginx (Reverse Proxy) 🚪
Buat File Konfigurasi Nginx:

Bash

sudo nano /etc/nginx/sites-available/easet-app
Isi Konfigurasi: Ganti alamat_ip_server_anda dengan IP server Anda di jaringan lokal.

Nginx

server {
    listen 80;
    server_name alamat_ip_server_anda; # Gunakan IP server jika tidak ada domain

    # Lokasi root untuk frontend
    root /var/www/easet-app/frontend/dist; # Path ke folder build frontend
    index index.html;

    # Rute utama untuk menyajikan frontend React
    location / {
        try_files $uri $uri/ /index.html; # Penting untuk React Router
    }

    # Rute untuk meneruskan permintaan API ke backend NestJS
    location /api {
        proxy_pass http://localhost:3000; # Teruskan ke backend yang berjalan di port 3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # (Jika menggunakan PM2 Serve untuk frontend di port 8080)
    # Ganti blok 'location /' di atas dengan ini:
    # location / {
    #     proxy_pass http://localhost:8080; # Teruskan ke PM2 Serve frontend
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    # }
}
Aktifkan Konfigurasi:

Bash

# Hapus link default jika ada
sudo rm /etc/nginx/sites-enabled/default

# Buat link simbolik ke konfigurasi baru Anda
sudo ln -s /etc/nginx/sites-available/easet-app /etc/nginx/sites-enabled/
Test dan Restart Nginx:

Bash

sudo nginx -t # Pastikan tidak ada error
sudo systemctl restart nginx
Tahap 6: Konfigurasi Firewall 🔥
Izinkan koneksi masuk ke port 80 (HTTP).

Bash

sudo ufw allow 80/tcp
sudo ufw enable # Jika firewall belum aktif
sudo ufw status # Verifikasi
Tahap 7: Akses Aplikasi 🖥️
Sekarang, dari komputer lain di jaringan lokal Anda:

Buka browser.

Masukkan alamat IP server Anda di address bar: http://alamat_ip_server_anda

Aplikasi E-Aset Anda seharusnya sudah bisa diakses!

Selesai! Aplikasi Anda sekarang berjalan di server Ubuntu lokal Anda dan akan start otomatis jika server di-restart.