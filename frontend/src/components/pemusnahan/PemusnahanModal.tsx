// src/components/pemusnahan/PemusnahanModal.tsx
import React, { useState } from "react";
import { usePemusnahan } from "../../hooks/usePemusnahan";
import { Asset } from "../../types/pemusnahan"; // Mengubah import dari asset ke pemusnahan
import { CreatePemusnahanDto } from "../../types/pemusnahan";

interface PemusnahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const PemusnahanModal: React.FC<PemusnahanModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  // Menggunakan useCreatePemusnahan untuk mendapatkan fungsi dan status loading
  const { useCreatePemusnahan } = usePemusnahan();
  const { mutate: createPemusnahan, isPending: createPemusnahanLoading } =
    useCreatePemusnahan();

  const [formData, setFormData] = useState<CreatePemusnahanDto>({
    id_aset: Number(asset.id_aset),
    tgl_pemusnahan: new Date().toISOString().split("T")[0],
    metode_pemusnahan: "Dibakar",
    alasan_pemusnahan: "",
    no_surat_persetujuan: "",
    id_petugas_pemusnahan: 1, // Default user ID, should be replaced with actual user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createPemusnahan(formData);
      onClose();
      // Reset form
      setFormData({
        id_aset: Number(asset.id_aset),
        tgl_pemusnahan: new Date().toISOString().split("T")[0],
        metode_pemusnahan: "Dibakar",
        alasan_pemusnahan: "",
        no_surat_persetujuan: "",
        id_petugas_pemusnahan: 1,
      });
    } catch (error) {
      console.error("Gagal mengajukan pemusnahan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Ajukan Pemusnahan Aset
          </h2>
          <p className="text-gray-600 mb-4">
            {asset.nama_aset} ({asset.kode_aset})
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Pemusnahan *
              </label>
              <input
                type="date"
                required
                value={formData.tgl_pemusnahan}
                onChange={(e) =>
                  setFormData({ ...formData, tgl_pemusnahan: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode Pemusnahan *
              </label>
              <select
                required
                value={formData.metode_pemusnahan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metode_pemusnahan: e.target.value as
                      | "Dibakar"
                      | "Ditumpuk"
                      | "Dipotong"
                      | "Dileburkan"
                      | "Lainnya",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dibakar">Dibakar</option>
                <option value="Ditumpuk">Ditumpuk</option>
                <option value="Dipotong">Dipotong</option>
                <option value="Dileburkan">Dileburkan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Pemusnahan *
              </label>
              <textarea
                required
                value={formData.alasan_pemusnahan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alasan_pemusnahan: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Surat Persetujuan
              </label>
              <input
                type="text"
                value={formData.no_surat_persetujuan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    no_surat_persetujuan: e.target.value,
                  })
                }
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
                disabled={createPemusnahanLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {createPemusnahanLoading ? "Memproses..." : "Ajukan Pemusnahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
