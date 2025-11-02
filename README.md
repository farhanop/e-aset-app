# 🏢 e-ASET — Sistem Manajemen Aset Digital

e-ASET adalah aplikasi berbasis web yang dirancang untuk mengelola aset institusi (barang, inventaris, dan pengguna) secara efisien dan terintegrasi.  
Dibangun menggunakan **React + TypeScript (Vite)** di sisi frontend dan **NestJS** untuk backend API, dengan autentikasi JWT serta dukungan upload foto profil pengguna.

---

## 🚀 Fitur Utama

### 🔐 Autentikasi & Manajemen Pengguna

- Login dan logout berbasis JWT.
- Role-based access control (Admin, User, dan lainnya).
- Update profil & ubah kata sandi.
- Upload dan hapus foto profil.
- Manajemen sesi (hapus sesi aktif lainnya).

### 🗃️ Manajemen Aset

- Tambah, ubah, hapus, dan lihat data aset.
- Klasifikasi aset berdasarkan kategori, lokasi, dan status.
- Upload foto atau dokumen pendukung aset.
- Pencarian dan filter aset secara dinamis.

### 📊 Dashboard Interaktif

- Statistik aset, total nilai aset, dan status penggunaan.
- Komponen interaktif menggunakan chart dan kartu ringkasan (StatCard).
- Mode gelap dan terang (Theme Context).

### ⚙️ Teknologi Pendukung

- **Frontend:** React (Vite), TailwindCSS, Framer Motion, React Router, React Toastify
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, Multer (upload file)
- **Server:** Nginx reverse proxy (frontend + backend)
- **Deploy:** Linux server atau Docker-ready

---

## 🧩 Arsitektur Aplikasi

e-aset-app/
│
├── frontend/ # React + TypeScript (Vite)
│ ├── src/
│ │ ├── api/axios.ts # Konfigurasi API dan interceptor token
│ │ ├── components/ # Komponen UI (Header, Sidebar, Footer, dll)
│ │ ├── contexts/ # ThemeContext & AuthContext
│ │ ├── pages/ # Halaman utama (Dashboard, Profile, Aset)
│ │ ├── types/ # Definisi tipe (User, Aset, dsb)
│ │ └── App.tsx # Routing utama
│ └── .env # Konfigurasi URL backend
│
├── backend/ # NestJS API
│ ├── src/
│ │ ├── auth/ # Login, Register, Profile, JWT guard
│ │ ├── users/ # Modul pengguna
│ │ ├── assets/ # Modul aset
│ │ ├── database/ # Konfigurasi TypeORM
│ │ └── main.ts # Entry point aplikasi NestJS
│ └── .env # Variabel lingkungan server
│
└── nginx/
└── e-aset.conf # Konfigurasi reverse proxy

yaml
Copy code

---

## ⚙️ Instalasi & Menjalankan Aplikasi

### 1️⃣ Clone Repository

```bash
git clone https://github.com/farhanop/e-aset-app.git
cd e-aset-app
2️⃣ Jalankan Backend (NestJS)
Masuk ke direktori backend:

bash
Copy code
cd backend
npm install
cp .env.example .env
Atur konfigurasi di .env:

env
Copy code
APP_NAME=eAset
APP_URL=http://localhost:3000
JWT_SECRET=your_secret
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=e_aset
Lalu jalankan:

bash
Copy code
npm run start:dev
3️⃣ Jalankan Frontend (Vite React)
Masuk ke direktori frontend:

bash
Copy code
cd ../frontend
npm install
cp .env.example .env
Atur koneksi ke backend:

env
Copy code
VITE_BACKEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
Lalu jalankan:

bash
Copy code
npm run dev
Aplikasi akan berjalan di http://localhost:5173

🧰 Build & Deployment
Build frontend:
bash
Copy code
cd frontend
npm run build
Output build akan disimpan di frontend/dist.

Build backend:
bash
Copy code
cd backend
npm run build
Deploy bersama Nginx:

nginx
Copy code
server {
    listen 80;
    server_name aset.local;

    root /var/www/e-aset-app/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
    }
}
👥 Kontributor
Farhan O.P — Fullstack Developer / Project Owner

🧾 Lisensi
Aplikasi ini dirilis di bawah lisensi MIT.
Silakan digunakan, dimodifikasi, dan dikembangkan sesuai kebutuhan.

📬 Kontak
Untuk kolaborasi atau laporan bug:
📧 farhanop.dev@gmail.com
🌐 GitHub

yaml
Copy code

---

Kalau kamu mau, saya bisa tambahkan:
- Badge status build & teknologi (React, NestJS, PostgreSQL, dll)
- Screenshot dashboard (jika kamu punya)
- Panduan Docker Compose (jika kamu mau jalankan full stack otomatis)

Apakah kamu ingin versi README dengan badge dan screenshot agar tampil profesional di GitHub?







```
