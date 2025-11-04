// src/components/perbaikan/PerbaikanDetail.tsx
import React from "react";
import { usePerbaikan as usePerbaikanHook } from "../../hooks/usePerbaikan";
import { formatDate } from "../../utils/dateUtils";

interface PerbaikanDetailProps {
  isOpen: boolean;
  onClose: () => void;
  id_perbaikan: number;
}

export const PerbaikanDetail: React.FC<PerbaikanDetailProps> = ({
  isOpen,
  onClose,
  id_perbaikan,
}) => {
  const { usePerbaikan, useUpdatePerbaikanStatus } = usePerbaikanHook();
  const { data: perbaikan, isLoading, error } = usePerbaikan(id_perbaikan);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePerbaikanStatus();

  const handleStatusChange = (status: string) => {
    updateStatus(
      { id: id_perbaikan, status },
      {
        onSuccess: () => {
          // Tidak perlu melakukan apa-apa dengan selectedStatus
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dilaporkan":
        return "bg-yellow-100 text-yellow-800";
      case "Proses Perbaikan":
        return "bg-blue-100 text-blue-800";
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Tidak Bisa Diperbaiki":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Detail Perbaikan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="text-red-700">
                Error: {(error as Error).message}
              </div>
            </div>
          ) : perbaikan ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID Perbaikan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {perbaikan.id_perbaikan}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      perbaikan.status_perbaikan
                    )}`}
                  >
                    {perbaikan.status_perbaikan}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Aset</h3>
                  <p className="text-sm text-gray-900">
                    {perbaikan.aset?.nama_aset} ({perbaikan.aset?.kode_aset})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Kategori
                  </h3>
                  <p className="text-sm text-gray-900">
                    {perbaikan.aset?.kategori}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tanggal Lapor
                  </h3>
                  <p className="text-sm text-gray-900">
                    {formatDate(perbaikan.tgl_lapor_rusak)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID Pelapor
                  </h3>
                  <p className="text-sm text-gray-900">
                    {perbaikan.id_pelapor}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Deskripsi Kerusakan
                </h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {perbaikan.deskripsi_kerusakan}
                </p>
              </div>

              {perbaikan.tindakan_perbaikan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Tindakan Perbaikan
                  </h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {perbaikan.tindakan_perbaikan}
                  </p>
                </div>
              )}

              {perbaikan.biaya_perbaikan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Biaya Perbaikan
                  </h3>
                  <p className="text-sm text-gray-900">
                    Rp {perbaikan.biaya_perbaikan.toLocaleString("id-ID")}
                  </p>
                </div>
              )}

              {perbaikan.tgl_selesai_perbaikan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tanggal Selesai Perbaikan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {formatDate(perbaikan.tgl_selesai_perbaikan)}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange("Dilaporkan")}
                    disabled={
                      isUpdating || perbaikan.status_perbaikan === "Dilaporkan"
                    }
                    className={`px-3 py-1 text-xs rounded ${
                      perbaikan.status_perbaikan === "Dilaporkan"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    Dilaporkan
                  </button>
                  <button
                    onClick={() => handleStatusChange("Proses Perbaikan")}
                    disabled={
                      isUpdating ||
                      perbaikan.status_perbaikan === "Proses Perbaikan"
                    }
                    className={`px-3 py-1 text-xs rounded ${
                      perbaikan.status_perbaikan === "Proses Perbaikan"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    Proses Perbaikan
                  </button>
                  <button
                    onClick={() => handleStatusChange("Selesai")}
                    disabled={
                      isUpdating || perbaikan.status_perbaikan === "Selesai"
                    }
                    className={`px-3 py-1 text-xs rounded ${
                      perbaikan.status_perbaikan === "Selesai"
                        ? "bg-green-200 text-green-800"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => handleStatusChange("Tidak Bisa Diperbaiki")}
                    disabled={
                      isUpdating ||
                      perbaikan.status_perbaikan === "Tidak Bisa Diperbaiki"
                    }
                    className={`px-3 py-1 text-xs rounded ${
                      perbaikan.status_perbaikan === "Tidak Bisa Diperbaiki"
                        ? "bg-red-200 text-red-800"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    Tidak Bisa Diperbaiki
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Data perbaikan tidak ditemukan</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
