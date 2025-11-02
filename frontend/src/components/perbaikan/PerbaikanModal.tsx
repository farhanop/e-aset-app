// src/components/perbaikan/PerbaikanModal.tsx
import React, { useState } from "react";
import { usePerbaikan } from "../../hooks/usePerbaikan";
import { Asset } from "../../types/perbaikan"; // Mengubah import dari asset ke perbaikan
import { CreatePerbaikanDto } from "../../types/perbaikan";

interface PerbaikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const PerbaikanModal: React.FC<PerbaikanModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  // Menggunakan useCreatePerbaikan untuk mendapatkan fungsi dan status loading
  const { useCreatePerbaikan } = usePerbaikan();
  const { mutate: createPerbaikan, isPending: createPerbaikanLoading } =
    useCreatePerbaikan();

  const [formData, setFormData] = useState<CreatePerbaikanDto>({
    id_aset: Number(asset.id_aset),
    tgl_lapor_rusak: new Date().toISOString().split("T")[0],
    deskripsi_kerusakan: "",
    id_pelapor: 1, // Default user ID, should be replaced with actual user
    tindakan_perbaikan: "",
    biaya_perbaikan: 0,
    tgl_selesai_perbaikan: "",
    status_perbaikan: "Dilaporkan",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createPerbaikan(formData);
      onClose();
      // Reset form
      setFormData({
        id_aset: Number(asset.id_aset),
        tgl_lapor_rusak: new Date().toISOString().split("T")[0],
        deskripsi_kerusakan: "",
        id_pelapor: 1,
        tindakan_perbaikan: "",
        biaya_perbaikan: 0,
        tgl_selesai_perbaikan: "",
        status_perbaikan: "Dilaporkan",
      });
    } catch (error) {
      console.error("Gagal melapor kerusakan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Lapor Kerusakan Aset
          </h2>
          <p className="text-gray-600 mb-4">
            {asset.nama_aset} ({asset.kode_aset})
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lapor *
              </label>
              <input
                type="date"
                required
                value={formData.tgl_lapor_rusak}
                onChange={(e) =>
                  setFormData({ ...formData, tgl_lapor_rusak: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Kerusakan *
              </label>
              <textarea
                required
                value={formData.deskripsi_kerusakan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deskripsi_kerusakan: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tindakan Perbaikan
              </label>
              <textarea
                value={formData.tindakan_perbaikan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tindakan_perbaikan: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Perbaikan
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.biaya_perbaikan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    biaya_perbaikan: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai Perbaikan
              </label>
              <input
                type="date"
                min={formData.tgl_lapor_rusak}
                value={formData.tgl_selesai_perbaikan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tgl_selesai_perbaikan: e.target.value,
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
                disabled={createPerbaikanLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createPerbaikanLoading ? "Memproses..." : "Lapor Kerusakan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
