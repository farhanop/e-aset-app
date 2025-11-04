// src/components/mutasi/MutasiModal.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutasi } from "../../hooks/useMutasi";
import { Asset } from "../../types/asset"; // Pastikan path ini benar
import { Lokasi } from "../../types/lokasi"; // Pastikan path ini benar
import { UnitKerja } from "../../types/unitKerja"; // Pastikan path ini benar
import { CreateMutasiDto } from "../../types/mutasi";
// toast akan digunakan oleh useCreateMutasi, jadi tidak perlu di-import di sini

interface MutasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset; // Aset yang akan dimutasi
  lokasiList: Lokasi[]; // Daftar semua lokasi untuk dropdown
  unitKerjaList: UnitKerja[]; // Daftar semua unit kerja
}

export const MutasiModal: React.FC<MutasiModalProps> = ({
  isOpen,
  onClose,
  asset,
  lokasiList,
  unitKerjaList, // Menerima list unit kerja
}) => {
  const { useCreateMutasi } = useMutasi();
  const { mutate: createMutasi, isPending: createMutasiLoading } =
    useCreateMutasi();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateMutasiDto>({
    // Set nilai default saat form dimuat
    defaultValues: {
      id_aset: Number(asset.id_aset),
      id_lokasi_baru: undefined,
      tgl_mutasi: new Date().toISOString().split("T")[0],
      catatan: "",
      id_unit_kerja_baru: asset.id_unit_kerja, // Default ke unit kerja aset saat ini
    },
  });

  // Fungsi submit yang baru, sesuai DTO
  const onSubmit = (data: CreateMutasiDto) => {
    const finalData = {
      ...data,
      id_aset: Number(asset.id_aset),
      id_lokasi_baru: Number(data.id_lokasi_baru),
      // Kirim id_unit_kerja_baru hanya jika berbeda dari unit kerja asal
      id_unit_kerja_baru:
        Number(data.id_unit_kerja_baru) !== asset.id_unit_kerja
          ? Number(data.id_unit_kerja_baru)
          : undefined,
    };

    createMutasi(finalData, {
      onSuccess: () => {
        onClose(); // Tutup modal
        reset(); // Reset form ke nilai default
      },
      onError: (error) => {
        // Error sudah ditangani (ditampilkan sebagai toast) oleh hook useCreateMutasi
        console.error("Gagal melakukan mutasi:", error);
      },
    });
  };

  if (!isOpen) return null;

  // Mendapatkan nama relasi dengan aman
  const lokasiAsalNama = asset.lokasi?.nama_ruangan || "Lokasi tidak diketahui";
  const unitKerjaAsalNama =
    asset.unitKerja?.nama_unit || "Unit kerja tidak diketahui";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Mutasi Aset</h2>
          <p className="text-gray-600 mb-4">
            {asset.item?.nama_item} ({asset.kode_aset})
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Lokasi Asal (Teks Statis) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi Asal (Saat Ini)
              </label>
              <input
                type="text"
                disabled
                value={lokasiAsalNama}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* 2. Unit Kerja Asal (Teks Statis) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Kerja Asal (Saat Ini)
              </label>
              <input
                type="text"
                disabled
                value={unitKerjaAsalNama}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* 3. Dropdown Lokasi Tujuan Baru (Wajib) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi Tujuan Baru *
              </label>
              <Controller
                name="id_lokasi_baru"
                control={control}
                rules={{ required: "Lokasi tujuan harus diisi" }}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={createMutasiLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Lokasi Baru</option>
                    {lokasiList
                      // Filter lokasi saat ini dari daftar pilihan
                      .filter((lok) => lok.id_lokasi !== asset.id_lokasi)
                      .map((lok) => (
                        <option key={lok.id_lokasi} value={lok.id_lokasi}>
                          {lok.nama_ruangan} (Gedung {lok.gedung?.kode_gedung})
                        </option>
                      ))}
                  </select>
                )}
              />
              {errors.id_lokasi_baru && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.id_lokasi_baru.message}
                </p>
              )}
            </div>

            {/* 4. Dropdown Unit Kerja Baru (Opsional, default ke unit kerja lama) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Kerja Baru (Opsional)
              </label>
              <Controller
                name="id_unit_kerja_baru"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={createMutasiLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Pilih Unit Kerja Baru (jika pindah)
                    </option>
                    {unitKerjaList.map((unit) => (
                      <option
                        key={unit.id_unit_kerja}
                        value={unit.id_unit_kerja}
                      >
                        {unit.nama_unit} ({unit.kode_unit})
                      </option>
                    ))}
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan jika unit kerja tidak berubah.
              </p>
            </div>

            {/* 5. Tanggal Mutasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mutasi *
              </label>
              <Controller
                name="tgl_mutasi"
                control={control}
                rules={{ required: "Tanggal harus diisi" }}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    // Format value agar sesuai dengan <input type="date">
                    value={
                      field.value ? field.value.toString().split("T")[0] : ""
                    }
                    disabled={createMutasiLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.tgl_mutasi && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.tgl_mutasi.message}
                </p>
              )}
            </div>

            {/* 6. Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <Controller
                name="catatan"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    disabled={createMutasiLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan perpindahan..."
                  />
                )}
              />
            </div>

            {/* 7. Tombol Aksi */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  reset();
                }}
                disabled={createMutasiLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
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
