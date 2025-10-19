import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from "../contexts/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Tipe data untuk Aset
interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  lokasi: { nama_ruangan: string };
  status_aset: string;
  kondisi_terakhir: string;
}

// Tipe data untuk statistik dashboard
interface DashboardStats {
  totalAset: number;
  asetTersedia: number;
  asetDipinjam: number;
  asetDiperbaiki: number;
  totalLokasi: number;
  totalKategori: number;
}

// Fungsi caching untuk mengurangi permintaan API
const fetchWithCache = async <T,>(
  key: string, 
  fetcher: () => Promise<T>, 
  cacheTime = 5 * 60 * 1000 // 5 menit
): Promise<T> => {
  if (typeof window === 'undefined') {
    return fetcher();
  }

  try {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < cacheTime) {
        return data;
      }
    }

    const data = await fetcher();
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    return data;
  } catch (error) {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      return data;
    }
    throw error;
  }
};

export function DashboardPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAset: 0,
    asetTersedia: 0,
    asetDipinjam: 0,
    asetDiperbaiki: 0,
    totalLokasi: 0,
    totalKategori: 0,
  });
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch data aset dengan caching
        const assetsData = await fetchWithCache('dashboard-assets', () => 
          api.get('/assets').then(res => res.data.data || res.data)
        );
        
        if (!Array.isArray(assetsData)) {
          throw new Error('Format data aset tidak valid');
        }

        // Hitung statistik dari data aset
        const totalAset = assetsData.length;
        const asetTersedia = assetsData.filter(asset => asset.status_aset === 'Tersedia').length;
        const asetDipinjam = assetsData.filter(asset => asset.status_aset === 'Dipinjam').length;
        const asetDiperbaiki = assetsData.filter(asset => asset.status_aset === 'Diperbaiki').length;
        
        let totalLokasi = 0;
        try {
          // Fetch data lokasi dengan caching
          const lokasiData = await fetchWithCache('dashboard-lokasi', () => 
            api.get('/master-data/lokasi').then(res => res.data.data || res.data)
          );
          totalLokasi = Array.isArray(lokasiData) ? lokasiData.length : 0;
        } catch (lokasiError) {
          console.warn('Gagal mengambil data lokasi:', lokasiError);
          totalLokasi = 0;
        }

        let totalKategori = 0;
        try {
          // Fetch data kategori dengan caching
          const kategoriData = await fetchWithCache('dashboard-kategori', () => 
            api.get('/master-data/kategori-item').then(res => res.data.data || res.data)
          );
          totalKategori = Array.isArray(kategoriData) ? kategoriData.length : 0;
        } catch (kategoriError) {
          console.warn('Gagal mengambil data kategori:', kategoriError);
          totalKategori = 0;
        }
        
        // Set statistik
        setStats({
          totalAset,
          asetTersedia,
          asetDipinjam,
          asetDiperbaiki,
          totalLokasi,
          totalKategori,
        });
        
        // Ambil 5 aset terbaru untuk ditampilkan
        const sortedAssets = [...assetsData]
          .sort((a, b) => b.id_aset - a.id_aset)
          .slice(0, 5);
        
        setRecentAssets(sortedAssets);
      } catch (err: any) {
        console.error("Gagal mengambil data dashboard", err);
        const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat data dashboard. Silakan refresh halaman.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Fungsi untuk membersihkan cache
  const clearCache = () => {
    localStorage.removeItem('dashboard-assets');
    localStorage.removeItem('dashboard-lokasi');
    localStorage.removeItem('dashboard-kategori');
    window.location.reload();
  };

  // Komponen untuk kartu statistik
  const StatCard = ({ title, value, icon, color, link }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: string;
    link?: string;
  }) => (
    <Link 
      to={link || '#'} 
      className={`block rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            {value}
          </p>
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <span className={`text-sm font-medium ${
            theme === "dark" ? "text-blue-400" : "text-blue-600"
          }`}>
            Lihat Detail →
          </span>
        </div>
      )}
    </Link>
  );

  // Skeleton loading untuk kartu statistik
  const StatCardSkeleton = () => (
    <div className={`rounded-lg shadow-md p-6 ${
      theme === "dark" ? "bg-gray-800" : "bg-white"
    }`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700">
          <Skeleton width={24} height={24} />
        </div>
        <div className="ml-4 w-full">
          <Skeleton width={100} height={16} />
          <Skeleton width={60} height={24} className="mt-1" />
        </div>
      </div>
      <div className="mt-4">
        <Skeleton width={80} height={14} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Dashboard
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array(3).fill(0).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        
        <div className={`rounded-lg shadow-md p-6 mb-8 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}>
              Aset Terbaru
            </h2>
          </div>
          
          <div className="space-y-4">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Skeleton width={40} height={40} className="rounded-full mr-4" />
                  <div>
                    <Skeleton width={150} height={16} />
                    <Skeleton width={100} height={14} className="mt-1" />
                  </div>
                </div>
                <Skeleton width={60} height={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 rounded-lg ${
        theme === "dark" ? "bg-red-900/20" : "bg-red-50"
      }`}>
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-md ${
              theme === "dark" 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            Coba Lagi
          </button>
          <button 
            onClick={clearCache}
            className={`px-4 py-2 rounded-md ${
              theme === "dark" 
                ? "bg-gray-600 hover:bg-gray-700" 
                : "bg-gray-500 hover:bg-gray-600"
            } text-white`}
          >
            Hapus Cache & Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Dashboard
        </h1>
        <div className="text-sm">
          <span className={`${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Aset" 
          value={stats.totalAset} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m8-4v10l-8 4m0-10l-8 4m8 4v10M4 7v10" />
            </svg>
          }
          color="bg-blue-500"
          link="/assets"
        />
        
        <StatCard 
          title="Aset Tersedia" 
          value={stats.asetTersedia} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-green-500"
          link="/assets?status=Tersedia"
        />
        
        <StatCard 
          title="Aset Dipinjam" 
          value={stats.asetDipinjam} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-yellow-500"
          link="/assets?status=Dipinjam"
        />
        
        <StatCard 
          title="Aset Diperbaiki" 
          value={stats.asetDiperbaiki} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          }
          color="bg-red-500"
          link="/assets?status=Diperbaiki"
        />
      </div>
      
      {/* Kartu Statistik Baris Kedua */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Lokasi" 
          value={stats.totalLokasi} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h-4a1 1 0 00-1 1v5m4 0h4" />
            </svg>
          }
          color="bg-purple-500"
          link="/master-data?tab=lokasi"
        />
        
        <StatCard 
          title="Total Kategori" 
          value={stats.totalKategori} 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h0a2 2 0 010 4zm0 0v8m0 0a2 2 0 104 0m-4 0a2 2 0 110-4h0a2 2 0 00-2 2v8zm0 0h14m0 0a2 2 0 104 0m-4 0a2 2 0 110-4h0a2 2 0 00-2 2v8z" />
            </svg>
          }
          color="bg-indigo-500"
          link="/master-data?tab=kategori"
        />
        
        <StatCard 
          title="Laporan" 
          value="Lihat" 
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="bg-teal-500"
          link="/reports/by-location"
        />
      </div>
      
      {/* Aset Terbaru */}
      <div className={`rounded-lg shadow-md p-6 mb-8 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Aset Terbaru
          </h2>
          <Link 
            to="/assets" 
            className={`text-sm font-medium ${
              theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
            }`}
          >
            Lihat Semua →
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentAssets.length > 0 ? (
            recentAssets.map((asset) => (
              <div 
                key={asset.id_aset} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                } transition-colors`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m8-4v10l-8 4m0-10l-8 4m8 4v10M4 7v10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {asset.item.nama_item}
                    </p>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {asset.kode_aset} • {asset.lokasi?.nama_ruangan || 'Lokasi tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.status_aset === 'Tersedia' 
                      ? theme === "dark" 
                        ? "bg-green-800 text-green-100" 
                        : "bg-green-100 text-green-800"
                      : asset.status_aset === 'Dipinjam'
                      ? theme === "dark" 
                        ? "bg-yellow-800 text-yellow-100" 
                        : "bg-yellow-100 text-yellow-800"
                      : theme === "dark" 
                        ? "bg-red-800 text-red-100" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {asset.status_aset}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.kondisi_terakhir === 'Baik' 
                      ? theme === "dark" 
                        ? "bg-green-800 text-green-100" 
                        : "bg-green-100 text-green-800"
                      : theme === "dark" 
                        ? "bg-red-800 text-red-100" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {asset.kondisi_terakhir}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center p-8 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}>
                Belum ada aset terdaftar
              </h3>
              <p className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Mulai dengan mendaftarkan aset baru.
              </p>
              <div className="mt-6">
                <Link
                  to="/assets/new"
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    theme === "dark" 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-blue-500 hover:bg-blue-600"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Daftarkan Aset Baru
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}