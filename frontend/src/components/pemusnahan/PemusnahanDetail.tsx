// src/components/pemusnahan/PemusnahanDetail.tsx
import React from "react";
import { usePemusnahan as usePemusnahanHook } from "../../hooks/usePemusnahan";
import { formatDate } from "../../utils/dateUtils";

interface PemusnahanDetailProps {
  isOpen: boolean;
  onClose: () => void;
  id_pemusnahan: number;
}

export const PemusnahanDetail: React.FC<PemusnahanDetailProps> = ({
  isOpen,
  onClose,
  id_pemusnahan,
}) => {
  const { usePemusnahan } = usePemusnahanHook();
  const { data: pemusnahan, isLoading, error } = usePemusnahan(id_pemusnahan);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Detail Pemusnahan
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
          ) : pemusnahan ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID Pemusnahan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.id_pemusnahan}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tanggal Pemusnahan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {formatDate(pemusnahan.tgl_pemusnahan)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Aset</h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.aset?.nama_aset} ({pemusnahan.aset?.kode_aset})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Kategori
                  </h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.aset?.kategori}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Metode Pemusnahan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.metode_pemusnahan}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID Petugas Pemusnahan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.id_petugas_pemusnahan}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Alasan Pemusnahan
                </h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {pemusnahan.alasan_pemusnahan}
                </p>
              </div>

              {pemusnahan.no_surat_persetujuan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    No. Surat Persetujuan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {pemusnahan.no_surat_persetujuan}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Data pemusnahan tidak ditemukan</p>
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
