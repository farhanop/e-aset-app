// frontend\src\components\forms\MasterItemForm.tsx
import { useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// --- TIPE DATA ---
interface Kategori {
  id_kategori: number;
  nama_kategori: string;
}

interface ItemData {
  id_item?: number;
  kode_item: string;
  nama_item: string;
  id_kategori: number | string;
  metode_pelacakan: "Individual" | "Stok" | "";
  umur_ekonomis?: number | string;
}

// --- PROPS (Diperbaiki) ---
interface FormProps {
  initialData: Partial<ItemData> | null;
  onSave: (data: ItemData) => Promise<void>; // 1. Diubah ke Promise
  onCancel: () => void;
  isLoading: boolean; // 2. Ditambahkan: Menerima status loading dari parent
}

// --- Fungsi Fetching untuk useQuery ---
const fetchKategori = async (): Promise<Kategori[]> => {
  const response = await api.get("/master-data/kategori-item");
  // Menyesuaikan dengan berbagai kemungkinan struktur data
  return response.data.data || response.data || [];
};

export function MasterItemForm({
  initialData,
  onSave,
  onCancel,
  isLoading, // Menerima isPending/isLoading dari mutasi
}: FormProps) {
  const { theme } = useTheme();
  const isEditMode = !!initialData?.id_item;

  // 3. Mengambil data dropdown dengan useQuery
  const { data: kategoriList = [], isLoading: loadingKategori } = useQuery({
    queryKey: ["kategoriList"],
    queryFn: fetchKategori,
  });

  // 4. Setup react-hook-form (menggantikan semua useState)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemData>({
    defaultValues: {
      kode_item: "",
      nama_item: "",
      id_kategori: "",
      metode_pelacakan: "",
      umur_ekonomis: "",
    },
  });

  // 5. Efek untuk mengisi form (menggantikan useEffect lama)
  useEffect(() => {
    if (initialData) {
      reset({
        kode_item: initialData.kode_item || "",
        nama_item: initialData.nama_item || "",
        id_kategori: initialData.id_kategori || "",
        metode_pelacakan: initialData.metode_pelacakan || "",
        umur_ekonomis: initialData.umur_ekonomis || "",
      });
    } else {
      // Reset ke default jika mode create
      reset({
        kode_item: "",
        nama_item: "",
        id_kategori: "",
        metode_pelacakan: "",
        umur_ekonomis: "",
      });
    }
  }, [initialData, reset]);

  // 6. Fungsi onSubmit (menggantikan handleSubmit lama)
  const onSubmit = (data: ItemData) => {
    // Menyiapkan data untuk dikirim
    const dataToSubmit = {
      ...data,
      id_kategori: Number(data.id_kategori),
      umur_ekonomis: data.umur_ekonomis
        ? Number(data.umur_ekonomis)
        : undefined,
    };
    // Memanggil fungsi onSave dari parent (yang merupakan mutasi)
    onSave(dataToSubmit as ItemData);
  };

  // Helper untuk kelas CSS
  const getDynamicInputClass = (fieldName: keyof ItemData) => {
    const hasError = !!errors[fieldName];
    return `block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 ${
      hasError
        ? "border-red-500" // Kelas error
        : theme === "dark"
        ? "border-gray-600 bg-gray-700 text-white" // Kelas dark
        : "border-gray-300" // Kelas light
    }`;
  };

  return (
    // 7. Ganti form untuk menggunakan handleSubmit dari RHF
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Kategori Item */}
      <div>
        <label
          htmlFor="id_kategori"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kategori Item <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih kategori yang sesuai untuk item ini</p>
        </div>
        <Controller
          name="id_kategori"
          control={control}
          rules={{ required: "Kategori wajib dipilih" }}
          render={({ field }) => (
            <select
              {...field}
              id="id_kategori"
              required
              disabled={loadingKategori || isLoading}
              className={getDynamicInputClass("id_kategori")}
              value={field.value || ""}
            >
              <option value="" disabled>
                {loadingKategori ? "Memuat..." : "Pilih Kategori"}
              </option>
              {kategoriList.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          )}
        />
        {errors.id_kategori && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_kategori.message}
          </p>
        )}
      </div>

      {/* Metode Pelacakan */}
      <div>
        <label
          htmlFor="metode_pelacakan"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Metode Pelacakan <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih metode pelacakan untuk item ini</p>
        </div>
        <Controller
          name="metode_pelacakan"
          control={control}
          rules={{ required: "Metode pelacakan wajib dipilih" }}
          render={({ field }) => (
            <select
              {...field}
              id="metode_pelacakan"
              required
              disabled={isLoading}
              className={getDynamicInputClass("metode_pelacakan")}
              value={field.value || ""}
            >
              <option value="" disabled>
                Pilih Metode
              </option>
              <option value="Individual">Individual (per Unit)</option>
              <option value="Stok">Stok (per Jumlah)</option>
            </select>
          )}
        />
        {errors.metode_pelacakan && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.metode_pelacakan.message}
          </p>
        )}
      </div>

      {/* Kode Item */}
      <div>
        <label
          htmlFor="kode_item"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Item (SKU) <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 4 karakter (huruf/angka, tanpa spasi)</p>
        </div>
        <Controller
          name="kode_item"
          control={control}
          rules={{
            required: "Kode item wajib diisi",
            pattern: {
              value: /^[a-zA-Z0-9]{1,4}$/,
              message: "Kode item harus 1-4 karakter (huruf/angka)",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="kode_item"
              type="text"
              // Terapkan logika formatting Anda di sini
              onChange={(e) => {
                const formattedValue = e.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                field.onChange(formattedValue);
              }}
              required
              maxLength={4}
              disabled={isLoading}
              className={getDynamicInputClass("kode_item")}
              placeholder="Contoh: CPU"
            />
          )}
        />
        {errors.kode_item && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_item.message}
          </p>
        )}
      </div>

      {/* Nama Item */}
      <div>
        <label
          htmlFor="nama_item"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Item <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 100 karakter</p>
        </div>
        <Controller
          name="nama_item"
          control={control}
          rules={{
            required: "Nama item wajib diisi",
            maxLength: {
              value: 100,
              message: "Nama item maksimal 100 karakter",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="nama_item"
              type="text"
              required
              maxLength={100}
              disabled={isLoading}
              className={getDynamicInputClass("nama_item")}
              placeholder="Contoh: Laptop Dell"
            />
          )}
        />
        {errors.nama_item && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_item.message}
          </p>
        )}
      </div>

      {/* Umur Ekonomis */}
      <div>
        <label
          htmlFor="umur_ekonomis"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Umur Ekonomis (Tahun, Opsional)
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Masukkan umur ekonomis item dalam tahun (contoh: 5)</p>
        </div>
        <Controller
          name="umur_ekonomis"
          control={control}
          rules={{
            min: { value: 1, message: "Umur ekonomis harus lebih dari 0" },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="umur_ekonomis"
              type="number"
              min="1"
              disabled={isLoading}
              className={getDynamicInputClass("umur_ekonomis")}
              placeholder="Contoh: 5"
              // Menangani nilai opsional (agar tidak 0)
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              value={field.value || ""}
            />
          )}
        />
        {errors.umur_ekonomis && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.umur_ekonomis.message}
          </p>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading} // Menggunakan isLoading dari props
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            theme === "dark"
              ? "text-gray-200 bg-gray-600 hover:bg-gray-700"
              : "text-gray-700 bg-gray-100 hover:bg-gray-200"
          } disabled:opacity-50 transition-colors duration-200`}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingKategori} // Nonaktifkan jika form loading ATAU dropdown loading
          className={`px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors duration-200 ${
            theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-700"
          }`}
        >
          {isLoading ? ( // Menggunakan isLoading dari props
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memproses...
            </>
          ) : isEditMode ? (
            "Simpan Perubahan"
          ) : (
            "Buat Baru"
          )}
        </button>
      </div>
    </form>
  );
}
