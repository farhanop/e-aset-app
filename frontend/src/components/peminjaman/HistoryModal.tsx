// frontend\src\components\peminjaman\HistoryModal.tsx
import React from "react";
import { usePeminjaman } from "../../hooks/usePeminjaman";
import { Asset } from "../../types/peminjaman";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { useHistory } = usePeminjaman();
  // Fix: Convert id_aset from string to number
  const { data: history, isLoading } = useHistory(Number(asset.id_aset));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Riwayat Peminjaman
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {asset.nama_aset} ({asset.kode_aset})
          </p>

          {isLoading ? (
            <div className="text-center py-4 text-gray-600 dark:text-gray-300">
              Memuat data...
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Peminjam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Tanggal Pinjam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Rencana Kembali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Aktual Kembali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {history?.map((item) => (
                    <tr key={item.id_peminjaman}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.nama_peminjam}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.identitas_peminjam}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.tgl_pinjam).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.tgl_rencana_kembali).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.tgl_aktual_kembali
                          ? new Date(
                              item.tgl_aktual_kembali
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status_peminjaman === "Dikembalikan"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : item.status_peminjaman === "Terlambat"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {item.status_peminjaman}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
