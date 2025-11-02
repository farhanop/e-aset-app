// frontend/src/components/AssetLifecycleManager.tsx
import React, { useState, useEffect } from "react";
import { usePeminjaman } from "../hooks/usePeminjaman";
import { PeminjamanModal } from "../components/peminjaman/PeminjamanModal";
import { PengembalianModal } from "../components/peminjaman/PengembalianModal";
import { HistoryModal } from "../components/peminjaman/HistoryModal";
import { Asset, Peminjaman } from "../types/peminjaman";
import { formatDate, isOverdue } from "../utils/dateUtils";

export const AssetLifecycleManager: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPeminjaman, setSelectedPeminjaman] =
    useState<Peminjaman | null>(null);
  const [showPeminjamanModal, setShowPeminjamanModal] = useState(false);
  const [showPengembalianModal, setShowPengembalianModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { useAssets, usePeminjamanAktif, pinjamError, kembalikanError } =
    usePeminjaman();

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssets();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tersedia":
        return "bg-green-100 text-green-800 border-green-200";
      case "Dipinjam":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rusak":
        return "bg-red-100 text-red-800 border-red-200";
      case "Maintenance":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusPeminjamanColor = (
    status: string,
    tglRencanaKembali: string
  ) => {
    if (status === "Dikembalikan") return "bg-green-100 text-green-800";
    if (
      status === "Terlambat" ||
      (status === "Dipinjam" && isOverdue(tglRencanaKembali))
    ) {
      return "bg-red-100 text-red-800";
    }
    return "bg-yellow-100 text-yellow-800";
  };

  if (assetsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data aset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Peminjaman Aset
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola peminjaman dan pengembalian aset perusahaan
            </p>
          </div>

          {/* Error Display */}
          {assetsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Gagal memuat data aset
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{assetsError.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daftar Aset */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Daftar Aset
              </h2>
              <span className="text-sm text-gray-500">
                Total: {assets.length} aset
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div
                  key={asset.id_aset}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
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

                  <p className="text-sm text-gray-600 mb-2">
                    Kode: {asset.kode_aset}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Kategori: {asset.kategori}
                  </p>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowHistoryModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Lihat Riwayat
                    </button>

                    {asset.status_aset === "Tersedia" && (
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowPeminjamanModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Pinjam Aset
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {assets.length === 0 && !assetsLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada aset
                </h3>
                <p className="text-gray-500">
                  Belum ada aset yang terdaftar dalam sistem.
                </p>
              </div>
            )}
          </div>

          {/* Peminjaman Aktif */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Peminjaman Aktif
              </h2>
            </div>

            {peminjamanLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat data peminjaman...</p>
              </div>
            ) : peminjamanAktif.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {peminjamanAktif.map((peminjaman) => (
                  <div
                    key={peminjaman.id_peminjaman}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {peminjaman.aset?.nama_aset}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPeminjamanColor(
                              peminjaman.status_peminjaman,
                              peminjaman.tgl_rencana_kembali
                            )}`}
                          >
                            {peminjaman.status_peminjaman}
                            {isOverdue(peminjaman.tgl_rencana_kembali) &&
                              peminjaman.status_peminjaman === "Dipinjam" &&
                              " (Terlambat)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Peminjam:</span>
                            <p>
                              {peminjaman.nama_peminjam} (
                              {peminjaman.identitas_peminjam})
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Tanggal Pinjam:</span>
                            <p>{formatDate(peminjaman.tgl_pinjam)}</p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Rencana Kembali:
                            </span>
                            <p
                              className={
                                isOverdue(peminjaman.tgl_rencana_kembali)
                                  ? "text-red-600 font-medium"
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
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600">
                              Keterangan:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {peminjaman.keterangan_peminjaman}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6">
                        <button
                          onClick={() => {
                            setSelectedPeminjaman(peminjaman);
                            setShowPengembalianModal(true);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada peminjaman aktif
                </h3>
                <p className="text-gray-500">Semua aset telah dikembalikan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAsset && (
        <>
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
    </div>
  );
};
