// src/components/pemusnahan/PemusnahanList.tsx
import React, { useState } from "react";
import { usePemusnahan } from "../../hooks/usePemusnahan";
import { PemusnahanModal } from "./PemusnahanModal";
import { Asset } from "../../types/pemusnahan";
import { formatDate } from "../../utils/dateUtils";

interface PemusnahanListProps {
  asset?: Asset;
  onShowDetail?: (pemusnahan: any) => void;
}

export const PemusnahanList: React.FC<PemusnahanListProps> = ({
  asset,
  onShowDetail,
}) => {
  const { usePemusnahanList, usePemusnahanByAsset } = usePemusnahan();

  // Mengambil data pemusnahan berdasarkan asset atau semua data
  const {
    data: pemusnahanList,
    isLoading,
    error,
  } = asset ? usePemusnahanByAsset(Number(asset.id_aset)) : usePemusnahanList();

  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleAddPemusnahan = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">Error: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {asset ? `Pemusnahan untuk ${asset.nama_aset}` : "Daftar Pemusnahan"}
        </h2>
        {asset && (
          <button
            onClick={() => handleAddPemusnahan(asset)}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
          >
            Ajukan Pemusnahan
          </button>
        )}
      </div>

      {pemusnahanList && pemusnahanList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Pemusnahan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alasan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pemusnahanList.map((pemusnahan) => (
                <tr key={pemusnahan.id_pemusnahan} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pemusnahan.id_pemusnahan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pemusnahan.aset?.nama_aset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(pemusnahan.tgl_pemusnahan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pemusnahan.metode_pemusnahan}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {pemusnahan.alasan_pemusnahan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onShowDetail && onShowDetail(pemusnahan)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🗑️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada data pemusnahan
          </h3>
          <p className="text-gray-500">
            {asset
              ? "Belum ada pemusnahan yang diajukan untuk aset ini."
              : "Belum ada data pemusnahan yang tersedia."}
          </p>
        </div>
      )}

      {selectedAsset && (
        <PemusnahanModal
          isOpen={showModal}
          onClose={handleCloseModal}
          asset={selectedAsset}
        />
      )}
    </div>
  );
};
