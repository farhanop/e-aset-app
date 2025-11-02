// src/components/mutasi/MutasiModal.tsx
import React, { useState } from "react";
import { useMutasi } from "../../hooks/useMutasi";
import { Asset } from "../../types/mutasi";
import { CreateMutasiDto } from "../../types/mutasi";

interface MutasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const MutasiModal: React.FC<MutasiModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  // Menggunakan useCreateMutasi untuk mendapatkan fungsi dan status loading
  const { useCreateMutasi } = useMutasi();
  const { mutate: createMutasi, isPending: createMutasiLoading } =
    useCreateMutasi();

  const [formData, setFormData] = useState<CreateMutasiDto>({
    id_aset: Number(asset.id_aset),
    id_lokasi_lama: 1, // Default location, should be replaced with actual location
    id_lokasi_baru: 2, // Default new location, should be replaced with actual location
    tgl_mutasi: new Date().toISOString().split("T")[0],
    catatan: "",
    id_petugas: 1, // Default user ID, should be replaced with actual user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createMutasi(formData);
      onClose();
      // Reset form
      setFormData({
        id_aset: Number(asset.id_aset),
        id_lokasi_lama: 1,
        id_lokasi_baru: 2,
        tgl_mutasi: new Date().toISOString().split("T")[0],
        catatan: "",
        id_petugas: 1,
      });
    } catch (error) {
      console.error("Gagal melakukan mutasi:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Mutasi Aset</h2>
          <p className="text-gray-600 mb-4">
            {asset.nama_aset} ({asset.kode_aset})
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi Asal *
              </label>
              <select
                required
                value={formData.id_lokasi_lama}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_lokasi_lama: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Gudang A</option>
                <option value={2}>Gudang B</option>
                <option value={3}>Kantor Pusat</option>
                <option value={4}>Cabang Jakarta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi Tujuan *
              </label>
              <select
                required
                value={formData.id_lokasi_baru}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_lokasi_baru: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Gudang A</option>
                <option value={2}>Gudang B</option>
                <option value={3}>Kantor Pusat</option>
                <option value={4}>Cabang Jakarta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mutasi *
              </label>
              <input
                type="date"
                required
                value={formData.tgl_mutasi}
                onChange={(e) =>
                  setFormData({ ...formData, tgl_mutasi: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    catatan: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutasiLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutasiLoading ? "Memproses..." : "Ajukan Mutasi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
