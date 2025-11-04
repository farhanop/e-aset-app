// src/utils/navigation.test.tsx
// Manual test checklist untuk developer

export const navigationTestChecklist = [
  {
    test: "User dapat login dengan kredensial valid",
    steps: [
      "1. Buka halaman login",
      "2. Masukkan username dan password",
      "3. Klik tombol login",
      "4. Verifikasi redirect ke dashboard",
    ],
    expected: "Redirect ke dashboard, token tersimpan di localStorage",
  },
  {
    test: "User tidak dapat mengakses halaman protected tanpa login",
    steps: [
      "1. Hapus token dari localStorage",
      "2. Coba akses /dashboard langsung",
      "3. Verifikasi redirect ke login",
    ],
    expected: "Redirect ke halaman login",
  },
  {
    test: "Navigation sidebar berfungsi dengan benar",
    steps: [
      "1. Login ke aplikasi",
      "2. Klik setiap menu di sidebar",
      "3. Verifikasi halaman berubah sesuai menu",
    ],
    expected: "Halaman berubah sesuai menu yang diklik",
  },
  {
    test: "Logout berfungsi dengan benar",
    steps: [
      "1. Login ke aplikasi",
      "2. Klik tombol logout di header",
      "3. Verifikasi redirect ke login",
      "4. Verifikasi token dihapus dari localStorage",
    ],
    expected: "Redirect ke login dan token terhapus",
  },
];
