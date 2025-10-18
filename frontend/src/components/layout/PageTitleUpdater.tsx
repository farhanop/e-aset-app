// src/components/layout/PageTitleUpdater.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Komponen ini akan mengubah judul tab browser (document.title)
 * secara otomatis sesuai dengan halaman (route) yang sedang dibuka.
 */
export function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const routeTitleMap: Record<string, string> = {
      "/": "Beranda - E-Aset IGM",
      "/login": "Login - E-Aset IGM",
      "/dashboard": "Dashboard - E-Aset IGM",
      "/users": "Manajemen Pengguna - E-Aset IGM",
      "/roles": "Hak Akses - E-Aset IGM",
      "/master-data": "Master Data - E-Aset IGM",
      "/transactions": "Transaksi Aset - E-Aset IGM",
      "/reports": "Laporan Aset - E-Aset IGM",
      "/reports/by-location": "Laporan Berdasarkan Lokasi - E-Aset IGM",
      "/settings": "Pengaturan - E-Aset IGM",
      "/assets": "Data Aset - E-Aset IGM",
      "/assets/new": "Tambah Aset Baru - E-Aset IGM",
      "/qr-generator": "Generator QR Code - E-Aset IGM",
    };

    document.title = routeTitleMap[location.pathname] || "E-Aset IGM";
  }, [location]);

  return null;
}
