import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
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
  asetRusak: number;
  totalLokasi: number;
  totalKategori: number;
  totalGedung: number;
  totalUnitKerja: number;
}

// Fungsi caching untuk mengurangi permintaan API
const fetchWithCache = async <T,>(
  key: string,
  fetcher: () => Promise<T>,
  cacheTime = 5 * 60 * 1000 // 5 menit
): Promise<T> => {
  if (typeof window === "undefined") {
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
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
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
    asetRusak: 0,
    totalLokasi: 0,
    totalKategori: 0,
    totalGedung: 0,
    totalUnitKerja: 0,
  });
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false); // State untuk mengontrol visibilitas panduan

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch data aset dengan caching
        const assetsData = await fetchWithCache("dashboard-assets", () =>
          api.get("/assets").then((res) => res.data.data || res.data)
        );

        if (!Array.isArray(assetsData)) {
          throw new Error("Format data aset tidak valid");
        }

        // Hitung statistik dari data aset
        const totalAset = assetsData.length;
        const asetTersedia = assetsData.filter(
          (asset) => asset.status_aset === "Tersedia"
        ).length;
        const asetDipinjam = assetsData.filter(
          (asset) => asset.status_aset === "Dipinjam"
        ).length;
        const asetDiperbaiki = assetsData.filter(
          (asset) => asset.status_aset === "Dalam Perbaikan"
        ).length;
        const asetRusak = assetsData.filter(
          (asset) => asset.kondisi_terakhir === "Rusak"
        ).length;

        let totalLokasi = 0;
        try {
          const lokasiData = await fetchWithCache("dashboard-lokasi", () =>
            api
              .get("/master-data/lokasi")
              .then((res) => res.data.data || res.data)
          );
          totalLokasi = Array.isArray(lokasiData) ? lokasiData.length : 0;
        } catch (lokasiError) {
          console.warn("Gagal mengambil data lokasi:", lokasiError);
          totalLokasi = 0;
        }

        let totalKategori = 0;
        try {
          const kategoriData = await fetchWithCache("dashboard-kategori", () =>
            api
              .get("/master-data/kategori-item")
              .then((res) => res.data.data || res.data)
          );
          totalKategori = Array.isArray(kategoriData) ? kategoriData.length : 0;
        } catch (kategoriError) {
          console.warn("Gagal mengambil data kategori:", kategoriError);
          totalKategori = 0;
        }

        let totalGedung = 0;
        try {
          const gedungData = await fetchWithCache("dashboard-gedung", () =>
            api
              .get("/master-data/gedung")
              .then((res) => res.data.data || res.data)
          );
          totalGedung = Array.isArray(gedungData) ? gedungData.length : 0;
        } catch (gedungErr) {
          console.warn("Gagal mengambil data gedung:", gedungErr);
          totalGedung = 0;
        }

        let totalUnitKerja = 0;
        try {
          const unitKerjaData = await fetchWithCache(
            "dashboard-unit-kerja",
            () =>
              api
                .get("/master-data/unit-kerja")
                .then((res) => res.data.data || res.data)
          );
          totalUnitKerja = Array.isArray(unitKerjaData)
            ? unitKerjaData.length
            : 0;
        } catch (unitErr) {
          console.warn("Gagal mengambil data unit kerja:", unitErr);
          totalUnitKerja = 0;
        }

        // Set statistik
        setStats({
          totalAset,
          asetTersedia,
          asetDipinjam,
          asetDiperbaiki,
          asetRusak,
          totalLokasi,
          totalKategori,
          totalGedung,
          totalUnitKerja,
        });

        // Ambil 5 aset terbaru untuk ditampilkan
        const sortedAssets = [...assetsData]
          .sort((a, b) => b.id_aset - a.id_aset)
          .slice(0, 5);

        setRecentAssets(sortedAssets);
      } catch (err: any) {
        console.error("Gagal mengambil data dashboard", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Gagal memuat data dashboard. Silakan refresh halaman.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fungsi untuk membersihkan cache
  const clearCache = () => {
    localStorage.removeItem("dashboard-assets");
    localStorage.removeItem("dashboard-lokasi");
    localStorage.removeItem("dashboard-kategori");
    localStorage.removeItem("dashboard-gedung");
    localStorage.removeItem("dashboard-unit-kerja");
    window.location.reload();
  };

  // Komponen untuk kartu statistik dengan link - Tampilan Baru yang Lebih Menarik
  const StatCard = ({
    title,
    value,
    description,
    icon,
    color,
    link,
    gradient,
    progress,
  }: {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ReactNode;
    color: string;
    link?: string;
    gradient?: boolean;
    progress?: boolean;
  }) => {
    const cardContent = (
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
          gradient
            ? `bg-gradient-to-br ${color} text-white`
            : theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        } shadow-xl`}
      >
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 ${
            gradient
              ? "bg-gradient-to-br from-white/10 to-transparent"
              : theme === "dark"
              ? "bg-gradient-to-br from-gray-700/30 to-transparent"
              : "bg-gradient-to-br from-gray-100/70 to-transparent"
          }`}
        ></div>

        {/* Icon Background */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-xl ${
            gradient
              ? "bg-white/20"
              : theme === "dark"
              ? "bg-gray-600/40"
              : "bg-gray-300/60"
          }`}
        ></div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-white/40"></div>

        {/* Content */}
        <div className="relative p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <p
                className={`text-sm font-medium mb-2 ${
                  gradient
                    ? "text-white/90"
                    : theme === "dark"
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {title}
              </p>
              <div className="flex items-baseline">
                <p
                  className={`text-4xl font-bold mb-2 ${
                    gradient
                      ? "text-white"
                      : theme === "dark"
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {value}
                </p>
                {title === "Total Aset" && (
                  <span
                    className={`ml-2 text-sm ${
                      gradient
                        ? "text-white/70"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    items
                  </span>
                )}
              </div>
              {description && (
                <p
                  className={`text-sm ${
                    gradient
                      ? "text-white/80"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {description}
                </p>
              )}
            </div>
            <div
              className={`p-4 rounded-2xl ${
                gradient
                  ? "bg-white/20 backdrop-blur-sm"
                  : theme === "dark"
                  ? "bg-gray-700/60 backdrop-blur-sm"
                  : "bg-gray-100/80 backdrop-blur-sm"
              } shadow-lg`}
            >
              {icon}
            </div>
          </div>

          {/* Progress bar untuk beberapa statistik */}
          {progress && typeof value === "number" && stats.totalAset > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1">
                <span
                  className={
                    gradient
                      ? "text-white/80"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }
                >
                  Progress
                </span>
                <span
                  className={
                    gradient
                      ? "text-white/80"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }
                >
                  {((value / stats.totalAset) * 100).toFixed(1)}%
                </span>
              </div>
              <div
                className={`w-full h-3 rounded-full ${
                  gradient
                    ? "bg-white/20"
                    : theme === "dark"
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-3 rounded-full ${
                    title.includes("Tersedia")
                      ? "bg-green-400"
                      : title.includes("Dipinjam")
                      ? "bg-yellow-400"
                      : title.includes("Perbaikan")
                      ? "bg-blue-400"
                      : title.includes("Rusak")
                      ? "bg-red-400"
                      : "bg-indigo-400"
                  }`}
                  style={{ width: `${(value / stats.totalAset) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Decorative bottom bar */}
        <div className="absolute bottom-0 left-0 w-full h-1.5">
          <div
            className={`h-full ${
              title.includes("Tersedia")
                ? "bg-green-400"
                : title.includes("Dipinjam")
                ? "bg-yellow-400"
                : title.includes("Perbaikan")
                ? "bg-blue-400"
                : title.includes("Rusak")
                ? "bg-red-400"
                : gradient
                ? "bg-white/30"
                : "bg-indigo-400"
            }`}
          ></div>
        </div>
      </div>
    );

    if (link) {
      return (
        <Link
          to={link}
          className="block transform transition-transform duration-300 hover:scale-105"
        >
          {cardContent}
        </Link>
      );
    }

    return cardContent;
  };

  // Skeleton loading untuk kartu statistik
  const StatCardSkeleton = () => (
    <div
      className={`rounded-2xl p-6 shadow-xl ${
        theme === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton width={80} height={36} className="mb-3" />
          <Skeleton width={150} height={14} />
        </div>
        <div
          className={`p-4 rounded-2xl ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <Skeleton width={24} height={24} circle />
        </div>
      </div>
      <div
        className={`mt-6 w-full h-3 rounded-full ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}
      >
        <Skeleton height={12} className="rounded-full" />
      </div>
    </div>
  );

  // Quick Action Card - Tampilan Baru
  const QuickActionCard = ({
    title,
    description,
    icon,
    link,
    color,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    color: string;
  }) => (
    <Link
      to={link}
      className={`block rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        theme === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      } shadow-xl group relative overflow-hidden`}
    >
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      ></div>

      <div className="flex items-start space-x-5 relative z-10">
        <div
          className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-lg mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        </div>
        <div className="flex items-center">
          <svg
            className={`w-6 h-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            } group-hover:translate-x-1 transition-transform duration-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );

  // Status Badge Component - Tampilan Baru
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case "Tersedia":
          return theme === "dark"
            ? "bg-green-900/50 text-green-300 border border-green-800/50"
            : "bg-green-100 text-green-800 border border-green-200";
        case "Dipinjam":
          return theme === "dark"
            ? "bg-yellow-900/50 text-yellow-300 border border-yellow-800/50"
            : "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case "Dalam Perbaikan":
          return theme === "dark"
            ? "bg-blue-900/50 text-blue-300 border border-blue-800/50"
            : "bg-blue-100 text-blue-800 border border-blue-200";
        default:
          return theme === "dark"
            ? "bg-red-900/50 text-red-300 border border-red-800/50"
            : "bg-red-100 text-red-800 border border-red-200";
      }
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor()}`}
      >
        {status}
      </span>
    );
  };

  // Condition Badge Component - Tampilan Baru
  const ConditionBadge = ({ condition }: { condition: string }) => {
    const getConditionColor = () => {
      switch (condition) {
        case "Baik":
          return theme === "dark"
            ? "bg-green-900/50 text-green-300 border border-green-800/50"
            : "bg-green-100 text-green-800 border border-green-200";
        default:
          return theme === "dark"
            ? "bg-red-900/50 text-red-300 border border-red-800/50"
            : "bg-red-100 text-red-800 border border-red-200";
      }
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getConditionColor()}`}
      >
        {condition}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
        </div>

        <div
          className={`rounded-2xl shadow-xl p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Aset Terbaru
            </h2>
          </div>

          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <Skeleton
                      width={40}
                      height={40}
                      className="rounded-xl mr-4"
                    />
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
      <div
        className={`text-center p-8 rounded-2xl ${
          theme === "dark" ? "bg-red-900/20" : "bg-red-50"
        }`}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className={`mt-4 px-6 py-3 rounded-xl font-medium ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            Coba Lagi
          </button>
          <button
            onClick={clearCache}
            className={`mt-4 px-6 py-3 rounded-xl font-medium ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gray-500 hover:bg-gray-600"
            } text-white transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            Hapus Cache & Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header dengan desain baru */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1
            className={`text-4xl md:text-5xl font-bold mb-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Selamat Datang
          </h1>
          <p
            className={`text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Dashboard Manajemen Aset Digital
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Terakhir diperbarui:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span
            className={`text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Tombol Panduan Aplikasi dengan desain baru */}
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-500 flex items-center shadow-lg hover:shadow-xl ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Panduan Aplikasi
          <svg
            className={`w-5 h-5 ml-2 transition-transform duration-500 ${
              showGuide ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Panduan Aplikasi - Hanya muncul jika showGuide = true */}
      {showGuide && (
        <div
          className={`p-8 rounded-2xl shadow-2xl mb-10 border transform transition-all duration-500 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
              : "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
            <div
              className={`p-4 rounded-2xl flex-shrink-0 ${
                theme === "dark" ? "bg-blue-500/20" : "bg-blue-500/10"
              }`}
            >
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                🚀 Panduan Singkat Aplikasi E-Aset
              </h2>

              <p
                className={`text-lg mb-6 leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sistem ini dirancang untuk mendata, melacak, dan mengelola
                seluruh aset organisasi secara digital dan terintegrasi.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manajemen Aset */}
                <div
                  className={`p-6 rounded-xl border transform transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-white/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <h3
                      className={`font-bold text-lg ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      📋 Manajemen Aset
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Daftarkan aset baru (termasuk input massal), edit data, dan
                    lihat detail aset. Setiap aset otomatis mendapatkan{" "}
                    <strong>Kode Aset</strong> dan <strong>QR Code</strong>{" "}
                    unik.
                  </p>
                </div>

                {/* Siklus Hidup Aset */}
                <div
                  className={`p-6 rounded-xl border transform transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-white/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <h3
                      className={`font-bold text-lg ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      🔄 Siklus Hidup Aset
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Lacak riwayat lengkap aset:
                    <span className="text-yellow-500 font-medium">
                      {" "}
                      Peminjaman
                    </span>
                    ,
                    <span className="text-orange-500 font-medium">
                      {" "}
                      Perbaikan
                    </span>
                    ,
                    <span className="text-purple-500 font-medium"> Mutasi</span>
                    , hingga
                    <span className="text-red-500 font-medium">
                      {" "}
                      Pemusnahan
                    </span>
                    .
                  </p>
                </div>

                {/* Data Master */}
                <div
                  className={`p-6 rounded-xl border transform transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-white/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <h3
                      className={`font-bold text-lg ${
                        theme === "dark" ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      🏢 Data Master
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Kelola data pendukung: hierarki lokasi (
                    <strong>Kampus → Gedung → Ruangan</strong>) dan struktur
                    organisasi (<strong>Fakultas → Prodi/Bagian</strong>).
                  </p>
                </div>

                {/* Manajemen Pengguna */}
                <div
                  className={`p-6 rounded-xl border transform transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-white/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <h3
                      className={`font-bold text-lg ${
                        theme === "dark" ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      👥 Manajemen Pengguna
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Atur akses pengguna dengan sistem{" "}
                    <strong>Peran (Roles)</strong> dan
                    <strong> Hak Akses (Permissions)</strong> yang fleksibel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Aset"
          value={stats.totalAset}
          description="Semua aset terdaftar"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m0 0l8 4m8-4v10l-8 4m0-10l-8 4m8 4v10M4 7v10"
              />
            </svg>
          }
          color="from-blue-500 to-blue-700"
          link="/assets"
          gradient
        />

        <StatCard
          title="Aset Tersedia"
          value={stats.asetTersedia}
          description={`${
            stats.totalAset > 0
              ? ((stats.asetTersedia / stats.totalAset) * 100).toFixed(1)
              : 0
          }% dari total`}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="from-green-500 to-green-700"
          gradient
          progress
        />

        <StatCard
          title="Sedang Dipinjam"
          value={stats.asetDipinjam}
          description={`${
            stats.totalAset > 0
              ? ((stats.asetDipinjam / stats.totalAset) * 100).toFixed(1)
              : 0
          }% dari total`}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          }
          color="from-yellow-500 to-yellow-700"
          gradient
          progress
        />

        <StatCard
          title="Dalam Perbaikan"
          value={stats.asetDiperbaiki}
          description={`${
            stats.totalAset > 0
              ? ((stats.asetDiperbaiki / stats.totalAset) * 100).toFixed(1)
              : 0
          }% dari total`}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          color="from-purple-500 to-purple-700"
          gradient
          progress
        />
      </div>

      {/* Kartu Statistik Baris Kedua */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Lokasi"
          value={stats.totalLokasi}
          description="Total ruangan"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          color={
            theme === "dark"
              ? "bg-indigo-500/80"
              : "bg-indigo-100/80 text-indigo-600"
          }
          link="/master-data?tab=lokasi"
        />

        <StatCard
          title="Gedung"
          value={stats.totalGedung}
          description="Total gedung"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          color={
            theme === "dark"
              ? "bg-green-500/80"
              : "bg-green-100/80 text-green-600"
          }
          link="/master-data?tab=gedung"
        />

        <StatCard
          title="Kategori"
          value={stats.totalKategori}
          description="Jenis kategori"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
          color={
            theme === "dark" ? "bg-teal-500/80" : "bg-teal-100/80 text-teal-600"
          }
          link="/master-data?tab=kategori"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2
          className={`text-2xl font-bold mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          ⚡ Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Tambah Aset"
            description="Daftarkan aset baru"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            link="/assets/assets-baru"
            color="bg-blue-500"
          />

          <QuickActionCard
            title="Laporan Lokasi"
            description="Laporan aset per lokasi"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            link="/reports/laporan-berdasarkan-lokasi"
            color="bg-purple-500"
          />

          <QuickActionCard
            title="Manajemen User"
            description="Kelola pengguna sistem"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            link="/users"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Aset Terbaru */}
      <div
        className={`rounded-2xl shadow-2xl p-6 mb-8 border transform transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            📦 Aset Terbaru
          </h2>
          <Link
            to="/assets"
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
              theme === "dark"
                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
            }`}
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="space-y-4">
          {recentAssets.length > 0 ? (
            recentAssets.map((asset) => (
              <Link
                key={asset.id_aset}
                to={`/assets/${asset.id_aset}`}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-700/50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-xl ${
                      theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m0 0l8 4m8-4v10l-8 4m0-10l-8 4m8 4v10M4 7v10"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {asset.item.nama_item}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {asset.kode_aset} •{" "}
                      {asset.lokasi?.nama_ruangan || "Lokasi tidak tersedia"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={asset.status_aset} />
                  <ConditionBadge condition={asset.kondisi_terakhir} />
                </div>
              </Link>
            ))
          ) : (
            <div
              className={`text-center p-8 rounded-xl ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3
                className={`mt-2 text-sm font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Belum ada aset terdaftar
              </h3>
              <p
                className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Mulai dengan mendaftarkan aset baru.
              </p>
              <div className="mt-6">
                <Link
                  to="/assets/new"
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 01-1-1V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
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
