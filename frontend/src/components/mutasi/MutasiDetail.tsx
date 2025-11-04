import React from "react";
import { useMutasi as useMutasiHook } from "../../hooks/useMutasi";
import { formatDate } from "../../utils/dateUtils";

interface MutasiDetailProps {
  isOpen: boolean;
  onClose: () => void;
  id_mutasi: number;
}

export const MutasiDetail: React.FC<MutasiDetailProps> = ({
  isOpen,
  onClose,
  id_mutasi,
}) => {
  // Perbaikan 1: Gunakan useMutasi bukan useMutasiById
  const { useMutasiById } = useMutasiHook(); // <-- BENAR: Ganti namanya
  const { data: mutasi, isLoading, error } = useMutasiById(id_mutasi);

  if (!isOpen) return null;

  // Helper untuk menampilkan data relasi dengan aman
  const getRelationalData = (
    data: any,
    namaProp: string,
    idProp: string | number
  ) => {
    return data?.[namaProp] || `(ID: ${idProp})`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Detail Mutasi</h2>
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
          ) : mutasi ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID Mutasi
                  </h3>
                  <p className="text-sm text-gray-900">{mutasi.id_mutasi}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tanggal Mutasi
                  </h3>
                  <p className="text-sm text-gray-900">
                    {/* Perbaikan 2: Konversi ke string terlebih dahulu */}
                    {formatDate(mutasi.tgl_mutasi.toString())}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Aset</h3>
                  <p className="text-sm text-gray-900">
                    {getRelationalData(
                      mutasi.aset?.item,
                      "nama_item",
                      mutasi.id_aset
                    )}{" "}
                    ({mutasi.aset?.kode_aset || "N/A"})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Petugas</h3>
                  <p className="text-sm text-gray-900">
                    {getRelationalData(
                      mutasi.petugas,
                      "nama_lengkap",
                      mutasi.id_petugas
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Lokasi Asal
                  </h3>
                  <p className="text-sm text-gray-900">
                    {getRelationalData(
                      mutasi.lokasiLama,
                      "nama_ruangan",
                      mutasi.id_lokasi_lama
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Lokasi Tujuan
                  </h3>
                  <p className="text-sm text-gray-900">
                    {getRelationalData(
                      mutasi.lokasiBaru,
                      "nama_ruangan",
                      mutasi.id_lokasi_baru
                    )}
                  </p>
                </div>
              </div>

              {mutasi.catatan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Catatan
                  </h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {mutasi.catatan}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Data mutasi tidak ditemukan</p>
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
