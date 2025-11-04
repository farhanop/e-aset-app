import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaHistory,
  FaSearch,
  FaTag,
  FaUser,
  FaCalendarAlt,
  FaTruck,
  FaWrench,
  FaFire,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// ====================================================================
// DEFINISI TIPE (Untuk Panduan Backend Anda)
// ====================================================================

// Tipe data yang diharapkan dari endpoint /api/asset-history
interface AssetHistoryLog {
  id_log: number;
  timestamp: string; // Kapan aktivitas terjadi
  action_type:
    | "PEMBUATAN"
    | "UPDATE_INFO"
    | "PEMINJAMAN"
    | "PENGEMBALIAN"
    | "MUTASI"
    | "PERBAIKAN"
    | "PEMUSNAHAN";
  description: string; // Deskripsi singkat, cth: "Aset dipinjam oleh..."
  
  // Objek terkait
  asset: {
    id_aset: number;
    kode_aset: string;
    item: {
      nama_item: string;
    };
  };
  petugas: { // User yang melakukan aksi
    id_user: number;
    nama_lengkap: string;
  };
  // (Opsional) Detail tambahan jika diperlukan
  details?: {
    lokasi_lama?: string;
    lokasi_baru?: string;
    kondisi?: string;
  };
}

// ====================================================================
// KOMPONEN SKELETON (LOADING)
// ====================================================================
const HistorySkeleton = () => {
  const { theme } = useTheme();
  const baseColor = theme === "dark" ? "#374151" : "#f3f4f6";
  const highlightColor = theme === "dark" ? "#4b5563" : "#e5e7eb";

  return (
    <div
      className={`p-4 md:p-6 rounded-xl shadow-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Filter Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton
          height={48}
          className="md:w-1/3"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={48}
          className="md:w-1/3"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={48}
          className="md:w-1/3"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
      {/* Table Skeleton */}
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="mb-2">
            <Skeleton
              height={50}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>
        ))}
    </div>
  );
};

// ====================================================================
// KOMPONEN KARTU (MOBILE)
// ====================================================================
const LogCard = ({
  log,
  theme,
}: {
  log: AssetHistoryLog;
  theme: string;
}) => {
  return (
    <div
      className={`p-4 rounded-xl shadow mb-4 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span
            className={`font-bold text-sm ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {log.asset.kode_aset}
          </span>
          <p className="font-medium text-lg">
            {log.asset.item.nama_item}
          </p>
        </div>
        <ActionBadge type={log.action_type} />
      </div>

      <p
        className={`text-sm mb-3 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {log.description}
      </p>

      <div
        className={`border-t pt-3 mt-3 text-xs ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        } ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
      >
        <div className="flex justify-between">
          <span>
            <FaUser className="inline mr-1" />
            {log.petugas.nama_lengkap}
          </span>
          <span>
            <FaCalendarAlt className="inline mr-1" />
            {new Date(log.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// KOMPONEN BADGE (untuk Tipe Aksi)
// ====================================================================
const ActionBadge = ({ type }: { type: AssetHistoryLog["action_type"] }) => {
  const styles = {
    PEMBUATAN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    UPDATE_INFO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    PEMINJAMAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PENGEMBALIAN: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    MUTASI: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    PERBAIKAN: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    PEMUSNAHAN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const icons = {
    PEMBUATAN: <FaTag />,
    UPDATE_INFO: <FaWrench />,
    PEMINJAMAN: <FaArrowRight />,
    PENGEMBALIAN: <FaArrowLeft />,
    MUTASI: <FaTruck />,
    PERBAIKAN: <FaWrench />,
    PEMUSNAHAN: <FaFire />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[type] || "bg-gray-100 text-gray-800"
      }`}
    >
      {icons[type]}
      {type.replace("_", " ")}
    </span>
  );
};

// ====================================================================
// KOMPONEN UTAMA
// ====================================================================
export function RiwayatAsetPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // --- Data Fetching dengan React Query ---
  const {
    data: historyLog,
    isLoading,
    error,
  } = useQuery<AssetHistoryLog[], Error>({
    queryKey: ["assetHistory", searchTerm, actionFilter],
    queryFn: async () => {
      // Endpoint ini HARUS DIBUAT di backend Anda
      const { data } = await api.get("/asset-history", {
        params: {
          search: searchTerm || undefined,
          action: actionFilter || undefined,
          // Anda bisa tambahkan filter lain seperti date range
        },
      });
      return data;
    },
    // Opsi:
    // refetchOnWindowFocus: false,
    // staleTime: 5 * 60 * 1000, // 5 menit
  });

  if (isLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error.message}. Pastikan endpoint{" "}
        <strong>/api/asset-history</strong> sudah dibuat di backend.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1
        className={`text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <FaHistory /> Riwayat Aset
      </h1>

      {/* --- Filter Bar --- */}
      <div
        className={`mb-6 p-4 md:p-5 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kode aset, nama, atau petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch
                className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
              />
            </div>
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Semua Aksi</option>
            <option value="PEMBUATAN">Pembuatan</option>
            <option value="UPDATE_INFO">Update Info</option>
            <option value="PEMINJAMAN">Peminjaman</option>
            <option value="PENGEMBALIAN">Pengembalian</option>
            <option value="MUTASI">Mutasi</option>
            <option value="PERBAIKAN">Perbaikan</option>
            <option value="PEMUSNAHAN">Pemusnahan</option>
          </select>
          {/* TODO: Tambahkan Date Range Picker di sini */}
        </div>
      </div>

      {/* --- Konten (Tabel atau Kartu) --- */}
      <div
        className={`rounded-xl shadow-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {(!historyLog || historyLog.length === 0) ? (
          <div className="text-center p-12">
            <FaHistory className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium">Tidak Ada Riwayat Ditemukan</h3>
            <p className="text-sm text-gray-500">
              Belum ada aktivitas yang tercatat di sistem.
            </p>
          </div>
        ) : (
          <>
            {/* Tampilan Tabel (Desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead
                  className={theme === "dark" ? "bg-gray-750" : "bg-gray-50"}
                >
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Tanggal
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Aset
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Petugas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Deskripsi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    theme === "dark"
                      ? "bg-gray-800 divide-gray-700"
                      : "bg-white divide-gray-200"
                  }`}
                >
                  {historyLog.map((log) => (
                    <tr
                      key={log.id_log}
                      className={
                        theme === "dark"
                          ? "hover:bg-gray-750"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/assets/${log.asset.id_aset}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {log.asset.kode_aset}
                        </Link>
                        <div
                          className={
                            theme === "dark"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }
                        >
                          {log.asset.item.nama_item}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <ActionBadge type={log.action_type} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {log.petugas.nama_lengkap}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          theme === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tampilan Kartu (Mobile) */}
            <div className="md:hidden p-4">
              {historyLog.map((log) => (
                <LogCard key={log.id_log} log={log} theme={theme} />
              ))}
            </div>
            
            {/* TODO: Tambahkan Pagination di sini */}

          </>
        )}
      </div>
    </div>
  );
}

// Jangan lupa ekspor komponen agar bisa dipakai di App.tsx
export default RiwayatAsetPage;