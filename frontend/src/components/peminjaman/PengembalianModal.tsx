// frontend\src\components\peminjaman\PengembalianModal.tsx
import React, { useState } from "react";
import { usePeminjaman } from "../../hooks/usePeminjaman";
import { Peminjaman } from "../../types/peminjaman";

interface PengembalianModalProps {
  isOpen: boolean;
  onClose: () => void;
  peminjaman: Peminjaman;
}

export const PengembalianModal: React.FC<PengembalianModalProps> = ({
  isOpen,
  onClose,
  peminjaman,
}) => {
  const { kembalikan, kembalikanLoading } = usePeminjaman();
  const [kondisiKembali, setKondisiKembali] = useState<string>("Baik");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await kembalikan({
        // Fix: Convert id_peminjaman from string to number
        id: Number(peminjaman.id_peminjaman),
        data: { kondisi_kembali: kondisiKembali },
      });
      onClose();
    } catch (error) {
      console.error("Gagal mengembalikan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Kembalikan Aset
          </h2>

          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-gray-900 dark:text-white">
              <strong>Aset:</strong> {peminjaman.aset?.nama_aset}
            </p>
            <p className="text-gray-900 dark:text-white">
              <strong>Peminjam:</strong> {peminjaman.nama_peminjam}
            </p>
            <p className="text-gray-900 dark:text-white">
              <strong>Tanggal Pinjam:</strong>{" "}
              {new Date(peminjaman.tgl_pinjam).toLocaleDateString("id-ID")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kondisi Saat Dikembalikan
              </label>
              <select
                value={kondisiKembali}
                onChange={(e) => setKondisiKembali(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={kembalikanLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {kembalikanLoading ? "Memproses..." : "Kembalikan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
