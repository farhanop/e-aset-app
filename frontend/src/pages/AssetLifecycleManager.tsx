// frontend\src/pages\AssetLifecycleManager.tsx
import React, { useState, useEffect } from "react";
import { usePeminjaman } from "../hooks/usePeminjaman";
import { PeminjamanModal } from "../components/peminjaman/PeminjamanModal";
import { PengembalianModal } from "../components/peminjaman/PengembalianModal";
import { HistoryModal } from "../components/peminjaman/HistoryModal";
import { PerbaikanList } from "../components/perbaikan/PerbaikanList";
import { MutasiList } from "../components/mutasi/MutasiList";
import { PemusnahanList } from "../components/pemusnahan/PemusnahanList";
import { PerbaikanDetail } from "../components/perbaikan/PerbaikanDetail";
import { MutasiDetail } from "../components/mutasi/MutasiDetail";
import { PemusnahanDetail } from "../components/pemusnahan/PemusnahanDetail";

// --- PERBAIKAN TIPE DATA ---
// 1. Kembalikan impor Asset ke tipe data 'peminjaman'
import { Asset, Peminjaman } from "../types/peminjaman";
// -------------------------

import { Perbaikan } from "../types/perbaikan";
import { Mutasi } from "../types/mutasi";
import { Pemusnahan } from "../types/pemusnahan";
import { formatDate, isOverdue } from "../utils/dateUtils";
import { useTheme } from "../contexts/ThemeContext";

export const AssetLifecycleManager: React.FC = () => {
  // State untuk Peminjaman
  const { theme } = useTheme();
  // 2. State ini sekarang akan menggunakan Tipe Asset dari 'peminjaman'
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPeminjaman, setSelectedPeminjaman] =
    useState<Peminjaman | null>(null);
  const [showPeminjamanModal, setShowPeminjamanModal] = useState(false);
  const [showPengembalianModal, setShowPengembalianModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // State untuk Perbaikan
  const [showPerbaikanDetail, setShowPerbaikanDetail] = useState(false);
  const [selectedPerbaikanId, setSelectedPerbaikanId] = useState<number>(0);

  // State untuk Mutasi
  const [showMutasiDetail, setShowMutasiDetail] = useState(false);
  const [selectedMutasiId, setSelectedMutasiId] = useState<number>(0);

  // State untuk Pemusnahan
  const [showPemusnahanDetail, setShowPemusnahanDetail] = useState(false);
  const [selectedPemusnahanId, setSelectedPemusnahanId] = useState<number>(0);

  // Handler functions for detail views
  const handleShowPerbaikanDetail = (perbaikan: Perbaikan) => {
    setSelectedPerbaikanId(perbaikan.id_perbaikan);
    setShowPerbaikanDetail(true);
  };

  const handleShowMutasiDetail = (mutasi: Mutasi) => {
    setSelectedMutasiId(mutasi.id_mutasi);
    setShowMutasiDetail(true);
  };

  const handleShowPemusnahanDetail = (pemusnahan: Pemusnahan) => {
    setSelectedPemusnahanId(pemusnahan.id_pemusnahan);
    setShowPemusnahanDetail(true);
  };

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState<
    "peminjaman" | "perbaikan" | "mutasi" | "pemusnahan"
  >("peminjaman");

  const { useAssets, usePeminjamanAktif, pinjamError, kembalikanError } =
    usePeminjaman();

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssets(); // Hook ini mengembalikan Tipe Asset 'peminjaman'
  const { data: peminjamanAktif = [], isLoading: peminjamanLoading } =
    usePeminjamanAktif();

  // Effect untuk handle errors
  useEffect(() => {
    if (pinjamError) {
      console.error("Error peminjaman:", pinjamError);
    }
    if (kembalikanError) {
      console.error("Error pengembalian:", kembalikanError);
    }
    if (assetsError) {
      console.error("Error assets:", assetsError);
    }
  }, [pinjamError, kembalikanError, assetsError]);

  // (Fungsi getStatusColor & getStatusPeminjamanColor tidak berubah)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tersedia":
        return theme === "dark"
          ? "bg-green-900 text-green-200 border-green-700"
          : "bg-green-100 text-green-800 border-green-200";
      case "Dipinjam":
        return theme === "dark"
          ? "bg-yellow-900 text-yellow-200 border-yellow-700"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rusak":
        return theme === "dark"
          ? "bg-red-900 text-red-200 border-red-700"
          : "bg-red-100 text-red-800 border-red-200";
      case "Maintenance":
        return theme === "dark"
          ? "bg-blue-900 text-blue-200 border-blue-700"
          : "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return theme === "dark"
          ? "bg-gray-700 text-gray-200 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusPeminjamanColor = (
    status: string,
    tglRencanaKembali: string
  ) => {
    if (status === "Dikembalikan")
      return theme === "dark"
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-800";
    if (
      status === "Terlambat" ||
      (status === "Dipinjam" && isOverdue(tglRencanaKembali))
    ) {
      return theme === "dark"
        ? "bg-red-900 text-red-200"
        : "bg-red-100 text-red-800";
    }
    return theme === "dark"
      ? "bg-yellow-900 text-yellow-200"
      : "bg-yellow-100 text-yellow-800";
  };

  // Terapkan tema ke latar belakang utama
  const bgClass =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const cardClass =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  if (assetsLoading) {
    // (Loading state tidak berubah)
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p
            className={`mt-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Memuat data aset...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Manajemen Siklus Hidup Aset</h1>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Kelola peminjaman, perbaikan, mutasi, dan pemusnahan aset
            </p>
          </div>

          {/* Error Display */}
          {assetsError && (
            <div
              className={`mb-6 p-4 ${
                theme === "dark"
                  ? "bg-red-900 border-red-700"
                  : "bg-red-50 border-red-200"
              } border rounded-md`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <span
                    className={
                      theme === "dark" ? "text-red-400" : "text-red-400"
                    }
                  >
                    ⚠
                  </span>
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-red-200" : "text-red-800"
                    }`}
                  >
                    Gagal memuat data aset
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      theme === "dark" ? "text-red-300" : "text-red-700"
                    }`}
                  >
                    <p>{(assetsError as Error).message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs (Tidak berubah) */}
          <div
            className={`border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            } mb-6`}
          >
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {/* ... tombol tab ... */}
              <button
                onClick={() => setActiveTab("peminjaman")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "peminjaman"
                    ? theme === "dark"
                      ? "border-blue-400 text-blue-300"
                      : "border-blue-500 text-blue-600"
                    : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Peminjaman
              </button>
              <button
                onClick={() => setActiveTab("perbaikan")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "perbaikan"
                    ? theme === "dark"
                      ? "border-blue-400 text-blue-300"
                      : "border-blue-500 text-blue-600"
                    : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Perbaikan
              </button>
              <button
                onClick={() => setActiveTab("mutasi")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "mutasi"
                    ? theme === "dark"
                      ? "border-blue-400 text-blue-300"
                      : "border-blue-500 text-blue-600"
                    : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mutasi
              </button>
              <button
                onClick={() => setActiveTab("pemusnahan")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pemusnahan"
                    ? theme === "dark"
                      ? "border-blue-400 text-blue-300"
                      : "border-blue-500 text-blue-600"
                    : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pemusnahan
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-sm rounded-lg overflow-hidden`}
          >
            {activeTab === "peminjaman" && (
              <>
                {/* Daftar Aset */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 px-6 py-4">
                    <h2 className="text-xl font-semibold">Daftar Aset</h2>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Total: {assets.length} aset
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-6">
                    {assets.map((asset) => (
                      <div
                        key={asset.id_aset}
                        className={`${cardClass} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">
                            {/* 3. PERBAIKAN TIPE: Gunakan 'nama_aset' */}
                            {asset.nama_aset}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              asset.status_aset
                            )}`}
                          >
                            {asset.status_aset}
                          </span>
                        </div>

                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } mb-2`}
                        >
                          Kode: {asset.kode_aset}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } mb-4`}
                        >
                          {/* 4. PERBAIKAN TIPE: Gunakan 'kategori' */}
                          Kategori: {asset.kategori}
                        </p>

                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowHistoryModal(true);
                            }}
                            className={`hover:text-blue-400 text-sm font-medium transition-colors ${
                              theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-600"
                            }`}
                          >
                            Lihat Riwayat
                          </button>

                          {asset.status_aset === "Tersedia" && (
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowPeminjamanModal(true);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                theme === "dark"
                                  ? "bg-blue-700 text-white hover:bg-blue-600 focus:ring-blue-500"
                                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                              }`}
                            >
                              Pinjam Aset
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {assets.length === 0 && !assetsLoading && (
                    // ... (Tampilan 'Tidak ada aset' tidak berubah)
                    <div className="text-center py-12 px-6">
                      <div
                        className={`text-6xl mb-4 ${
                          theme === "dark" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        📦
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Tidak ada aset
                      </h3>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }
                      >
                        Belum ada aset yang terdaftar dalam sistem.
                      </p>
                    </div>
                  )}
                </div>

                {/* Peminjaman Aktif */}
                <div>
                  <div
                    className={`px-6 py-4 border-t ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <h2 className="text-xl font-semibold">Peminjaman Aktif</h2>
                  </div>

                  {peminjamanLoading ? (
                    // ... (Tampilan loading tidak berubah)
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p
                        className={`mt-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Memuat data peminjaman...
                      </p>
                    </div>
                  ) : peminjamanAktif.length > 0 ? (
                    <div
                      className={`divide-y ${
                        theme === "dark" ? "divide-gray-700" : "divide-gray-200"
                      }`}
                    >
                      {peminjamanAktif.map((peminjaman) => (
                        <div
                          key={peminjaman.id_peminjaman}
                          className={`p-6 transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-750"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium">
                                  {/* 5. PERBAIKAN TIPE: Gunakan 'nama_aset' */}
                                  {peminjaman.aset?.nama_aset || "N/A"}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPeminjamanColor(
                                    peminjaman.status_peminjaman,
                                    peminjaman.tgl_rencana_kembali
                                  )}`}
                                >
                                  {peminjaman.status_peminjaman}
                                  {isOverdue(peminjaman.tgl_rencana_kembali) &&
                                    peminjaman.status_peminjaman ===
                                      "Dipinjam" &&
                                    " (Terlambat)"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                {/* ... (detail peminjaman tidak berubah) ... */}
                                <div>
                                  <span className="font-medium">Peminjam:</span>
                                  <p>
                                    {peminjaman.nama_peminjam} (
                                    {peminjaman.identitas_peminjam})
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Tanggal Pinjam:
                                  </span>
                                  <p>{formatDate(peminjaman.tgl_pinjam)}</p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Rencana Kembali:
                                  </span>
                                  <p
                                    className={
                                      isOverdue(peminjaman.tgl_rencana_kembali)
                                        ? theme === "dark"
                                          ? "text-red-400 font-medium"
                                          : "text-red-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {formatDate(peminjaman.tgl_rencana_kembali)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Kondisi:</span>
                                  <p>{peminjaman.kondisi_pinjam}</p>
                                </div>
                              </div>

                              {peminjaman.keterangan_peminjaman && (
                                // ... (keterangan tidak berubah) ...
                                <div className="mt-2">
                                  <span
                                    className={`font-medium text-sm ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Keterangan:
                                  </span>
                                  <p
                                    className={`text-sm mt-1 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {peminjaman.keterangan_peminjaman}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="ml-6">
                              {/* ... (tombol kembalikan tidak berubah) ... */}
                              <button
                                onClick={() => {
                                  setSelectedPeminjaman(peminjaman);
                                  setShowPengembalianModal(true);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  theme === "dark"
                                    ? "bg-green-700 text-white hover:bg-green-600 focus:ring-green-500"
                                    : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                }`}
                              >
                                Kembalikan
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // ... (Tampilan 'Tidak ada peminjaman' tidak berubah) ...
                    <div className="p-8 text-center">
                      <div
                        className={`text-6xl mb-4 ${
                          theme === "dark" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        📋
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Tidak ada peminjaman aktif
                      </h3>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }
                      >
                        Semua aset telah dikembalikan.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === "perbaikan" && (
              <PerbaikanList onShowDetail={handleShowPerbaikanDetail} />
            )}
            {activeTab === "mutasi" && (
              // 6. PERINGATAN: Komponen ini sekarang akan error
              // karena mengharapkan Tipe Asset BARU
              <MutasiList onShowDetail={handleShowMutasiDetail} />
            )}
            {activeTab === "pemusnahan" && (
              <PemusnahanList onShowDetail={handleShowPemusnahanDetail} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAsset && (
        <>
          {/* Modal ini sekarang menerima Tipe Asset LAMA, yang sudah benar */}
          <PeminjamanModal
            isOpen={showPeminjamanModal}
            onClose={() => {
              setShowPeminjamanModal(false);
              setSelectedAsset(null);
            }}
            asset={selectedAsset}
          />

          <HistoryModal
            isOpen={showHistoryModal}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedAsset(null);
            }}
            asset={selectedAsset}
          />
        </>
      )}

      {selectedPeminjaman && (
        <PengembalianModal
          isOpen={showPengembalianModal}
          onClose={() => {
            setShowPengembalianModal(false);
            setSelectedPeminjaman(null);
          }}
          peminjaman={selectedPeminjaman}
        />
      )}

      {/* Detail Modals (Tidak berubah) */}
      {selectedPerbaikanId > 0 && (
        <PerbaikanDetail
          isOpen={showPerbaikanDetail}
          onClose={() => {
            setShowPerbaikanDetail(false);
            setSelectedPerbaikanId(0);
          }}
          id_perbaikan={selectedPerbaikanId}
        />
      )}

      {selectedMutasiId > 0 && (
        <MutasiDetail
          isOpen={showMutasiDetail}
          onClose={() => {
            setShowMutasiDetail(false);
            setSelectedMutasiId(0);
          }}
          id_mutasi={selectedMutasiId}
        />
      )}

      {selectedPemusnahanId > 0 && (
        <PemusnahanDetail
          isOpen={showPemusnahanDetail}
          onClose={() => {
            setShowPemusnahanDetail(false);
            setSelectedPemusnahanId(0);
          }}
          id_pemusnahan={selectedPemusnahanId}
        />
      )}
    </div>
  );
};
