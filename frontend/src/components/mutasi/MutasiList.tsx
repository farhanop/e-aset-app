// src/components/mutasi/MutasiList.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutasi } from "../../hooks/useMutasi";
import { MutasiModal } from "./MutasiModal";
import { MutasiDetail } from "./MutasiDetail";

import { Asset } from "../../types/asset";
import { Mutasi as MutasiType } from "../../types/mutasi";
import { Lokasi } from "../../types/lokasi";
import { UnitKerja } from "../../types/unitKerja";

import { formatDate } from "../../utils/dateUtils";
import api from "../../api/axios";

interface MutasiListProps {
  asset?: Asset;
  onShowDetail?: (mutasi: MutasiType) => void;
}

// --- FUNGSI FETCHER ---
const fetchLokasiList = async (): Promise<Lokasi[]> => {
  const res = await api.get("/master-data/lokasi");
  return res.data.data || res.data || [];
};

const fetchUnitKerjaList = async (): Promise<UnitKerja[]> => {
  const res = await api.get("/master-data/unit-kerja");
  return res.data.data || res.data || [];
};
// --- ----------------- ---

export const MutasiList: React.FC<MutasiListProps> = ({
  asset,
  onShowDetail,
}) => {
  const { useMutasiList, useMutasiByAsset } = useMutasi();

  const {
    data: mutasiList,
    isLoading: isLoadingMutasi,
    error: errorMutasi,
  } = asset ? useMutasiByAsset(Number(asset.id_aset)) : useMutasiList();

  const { data: lokasiList = [], isLoading: isLoadingLokasi } = useQuery({
    queryKey: ["lokasiList"],
    queryFn: fetchLokasiList,
  });

  const { data: unitKerjaList = [], isLoading: isLoadingUnitKerja } = useQuery({
    queryKey: ["unitKerjaList"],
    queryFn: fetchUnitKerjaList,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);

  const handleAddMutasi = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  const handleShowDetail = (mutasi: MutasiType) => {
    setSelectedId(mutasi.id_mutasi);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedId(0);
  };

  const isLoading = isLoadingMutasi || isLoadingLokasi || isLoadingUnitKerja;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorMutasi) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">
          Error: {(errorMutasi as Error).message}
        </div>
      </div>
    );
  }

  const assetName = asset?.item?.nama_item || "Aset";

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {asset ? `Mutasi untuk ${assetName}` : "Daftar Mutasi"}
        </h2>
        {asset && (
          <button
            onClick={() => handleAddMutasi(asset)}
            disabled={isLoadingLokasi || isLoadingUnitKerja}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingLokasi || isLoadingUnitKerja
              ? "Memuat..."
              : "Tambah Mutasi"}
          </button>
        )}
      </div>

      {/* Logika ini sekarang akan berjalan, karena error formatDate sudah diperbaiki.
        Jika mutasiList kosong, pesan "Tidak ada data mutasi" akan muncul.
      */}
      {mutasiList && mutasiList.length > 0 ? (
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
                  Tanggal Mutasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi Asal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi Tujuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mutasiList.map((mutasi) => (
                <tr key={mutasi.id_mutasi} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mutasi.id_mutasi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mutasi.aset?.item?.nama_item || "(Aset Dihapus)"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* PERBAIKAN: Gunakan .toString() untuk mengirim string */}
                    {formatDate(mutasi.tgl_mutasi.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mutasi.lokasiLama?.nama_ruangan ||
                      `ID: ${mutasi.id_lokasi_lama}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mutasi.lokasiBaru?.nama_ruangan ||
                      `ID: ${mutasi.id_lokasi_baru}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        handleShowDetail(mutasi);
                        onShowDetail && onShowDetail(mutasi);
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
          <div className="text-gray-400 text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada data mutasi
          </h3>
          <p className="text-gray-500">
            {asset
              ? "Belum ada mutasi yang dilakukan untuk aset ini."
              : "Belum ada data mutasi yang tersedia."}
          </p>
        </div>
      )}

      {selectedAsset && (
        <MutasiModal
          isOpen={showModal}
          onClose={handleCloseModal}
          asset={selectedAsset}
          lokasiList={lokasiList}
          unitKerjaList={unitKerjaList}
        />
      )}

      {selectedId > 0 && (
        <MutasiDetail
          isOpen={showDetail}
          onClose={handleCloseDetail}
          id_mutasi={selectedId}
        />
      )}
    </div>
  );
};
