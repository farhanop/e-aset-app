// src/components/perbaikan/PerbaikanList.tsx
import React, { useState } from "react";
import { usePerbaikan } from "../../hooks/usePerbaikan";
import { PerbaikanModal } from "./PerbaikanModal";
import { PerbaikanDetail } from "./PerbaikanDetail";
import { Asset } from "../../types/perbaikan";
import { Perbaikan as PerbaikanType } from "../../types/perbaikan";
import { formatDate } from "../../utils/dateUtils";

interface PerbaikanListProps {
  asset?: Asset;
  onShowDetail?: (perbaikan: PerbaikanType) => void;
}

export const PerbaikanList: React.FC<PerbaikanListProps> = ({
  asset,
  onShowDetail,
}) => {
  const { usePerbaikanList, usePerbaikanByAsset } = usePerbaikan();

  // Mengambil data perbaikan berdasarkan asset atau semua data
  const {
    data: perbaikanList,
    isLoading,
    error,
  } = asset ? usePerbaikanByAsset(Number(asset.id_aset)) : usePerbaikanList();

  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);

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

  const handleAddPerbaikan = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  const handleShowDetail = (perbaikan: PerbaikanType) => {
    setSelectedId(perbaikan.id_perbaikan);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedId(0);
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
          {asset ? `Perbaikan untuk ${asset.nama_aset}` : "Daftar Perbaikan"}
        </h2>
        {asset && (
          <button
            onClick={() => handleAddPerbaikan(asset)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Tambah Perbaikan
          </button>
        )}
      </div>

      {perbaikanList && perbaikanList.length > 0 ? (
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
                  Tanggal Lapor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi Kerusakan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perbaikanList.map((perbaikan) => (
                <tr key={perbaikan.id_perbaikan} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {perbaikan.id_perbaikan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {perbaikan.aset?.nama_aset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(perbaikan.tgl_lapor_rusak)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {perbaikan.deskripsi_kerusakan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        perbaikan.status_perbaikan
                      )}`}
                    >
                      {perbaikan.status_perbaikan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        handleShowDetail(perbaikan);
                        onShowDetail && onShowDetail(perbaikan);
                      }}
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
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada data perbaikan
          </h3>
          <p className="text-gray-500">
            {asset
              ? "Belum ada perbaikan yang dilaporkan untuk aset ini."
              : "Belum ada data perbaikan yang tersedia."}
          </p>
        </div>
      )}

      {selectedAsset && (
        <PerbaikanModal
          isOpen={showModal}
          onClose={handleCloseModal}
          asset={selectedAsset}
        />
      )}

      {selectedId > 0 && (
        <PerbaikanDetail
          isOpen={showDetail}
          onClose={handleCloseDetail}
          id_perbaikan={selectedId}
        />
      )}
    </div>
  );
};
