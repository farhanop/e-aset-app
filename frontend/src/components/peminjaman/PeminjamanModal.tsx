// frontend\src\components\peminjaman\PeminjamanModal.tsx
import React, { useState } from "react";
import { usePeminjaman } from "../../hooks/usePeminjaman";
import { CreatePeminjamanDto } from "../../types/peminjaman";
import { Asset } from "../../types/peminjaman";

interface PeminjamanModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const PeminjamanModal: React.FC<PeminjamanModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { pinjam, pinjamLoading } = usePeminjaman();
  const [formData, setFormData] = useState<CreatePeminjamanDto>({
    id_aset: asset.id_aset,
    nama_peminjam: "",
    identitas_peminjam: "",
    keterangan_peminjaman: "",
    tgl_rencana_kembali: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pinjam(formData);
      onClose();
      // Reset form
      setFormData({
        id_aset: asset.id_aset,
        nama_peminjam: "",
        identitas_peminjam: "",
        keterangan_peminjaman: "",
        tgl_rencana_kembali: "",
      });
    } catch (error) {
      console.error("Gagal meminjam:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pinjam Aset</h2>
            <div className="text-gray-500 text-sm">
              A43/301C/U.BPT/AC.1/2025
            </div>
          </div>

          <div className="mb-6 p-3 bg-gray-100 rounded-md">
            <p className="text-gray-900">
              {asset.nama_aset} ({asset.kode_aset})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Peminjam *
              </label>
              <input
                type="text"
                required
                value={formData.nama_peminjam}
                onChange={(e) =>
                  setFormData({ ...formData, nama_peminjam: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Identitas *
              </label>
              <input
                type="text"
                required
                value={formData.identitas_peminjam}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identitas_peminjam: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Rencana Kembali *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={formData.tgl_rencana_kembali}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tgl_rencana_kembali: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                value={formData.keterangan_peminjaman}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keterangan_peminjaman: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                disabled={pinjamLoading}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {pinjamLoading ? "Memproses..." : "Pinjam"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
