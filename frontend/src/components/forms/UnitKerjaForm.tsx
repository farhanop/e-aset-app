// frontend\src\components\forms\UnitKerjaForm.tsx
import { useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// --- TIPE DATA ---
interface UnitUtama {
  id_unit_utama: number;
  nama_unit_utama: string;
}

interface UnitKerjaData {
  id_unit_kerja?: number;
  kode_unit: string;
  nama_unit: string;
  id_unit_utama: number | null; // Diubah dari 'string' ke 'number | null'
}

// --- PROPS (Diperbaiki) ---
interface FormProps {
  initialData: Partial<UnitKerjaData> | null;
  onSave: (data: UnitKerjaData) => Promise<void>; // 1. Diubah ke Promise
  onCancel: () => void;
  isLoading: boolean; // 2. Ditambahkan: Menerima status loading dari parent
}

// Tipe untuk error submit
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// --- Fungsi Fetching untuk useQuery ---
const fetchUnitUtama = async (): Promise<UnitUtama[]> => {
  const response = await api.get("/master-data/unit-utama");
  // Menyesuaikan dengan berbagai kemungkinan struktur data
  return response.data.data || response.data || [];
};

export function UnitKerjaForm({
  initialData,
  onSave,
  onCancel,
  isLoading, // Menerima isPending/isLoading dari mutasi
}: FormProps) {
  const { theme } = useTheme();
  const isEditMode = !!initialData?.id_unit_kerja;

  // 3. Mengambil data dropdown dengan useQuery
  const { data: unitUtamaList = [], isLoading: loadingUnitUtama } = useQuery({
    queryKey: ["unitUtamaList"],
    queryFn: fetchUnitUtama,
  });

  // 4. Setup react-hook-form (menggantikan semua useState)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UnitKerjaData>({
    defaultValues: {
      kode_unit: "",
      nama_unit: "",
      id_unit_utama: null,
    },
  });

  // 5. Efek untuk mengisi form (menggantikan useEffect lama)
  useEffect(() => {
    if (initialData) {
      reset({
        kode_unit: initialData.kode_unit || "",
        nama_unit: initialData.nama_unit || "",
        id_unit_utama: initialData.id_unit_utama
          ? Number(initialData.id_unit_utama)
          : null,
      });
    } else {
      // Reset ke default jika mode create
      reset({
        kode_unit: "",
        nama_unit: "",
        id_unit_utama: null,
      });
    }
  }, [initialData, reset]);

  // 6. Fungsi onSubmit (menggantikan handleSubmit manual dan validateForm)
  const onSubmit = async (data: UnitKerjaData) => {
    const dataToSubmit = {
      ...data,
      id_unit_utama: Number(data.id_unit_utama),
    };
    try {
      // Memanggil onSave dari parent (yang merupakan mutasi)
      await onSave(dataToSubmit as UnitKerjaData);
    } catch (error) {
      console.error("Error saving unit kerja:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Gagal menyimpan data. Silakan coba lagi.";

      // Menampilkan error submit global
      setError("root.submit", { type: "manual", message });
    }
  };

  // Helper untuk kelas CSS
  const getDynamicInputClass = (fieldName: keyof UnitKerjaData) => {
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
      {/* Dropdown Unit Utama */}
      <div>
        <label
          htmlFor="id_unit_utama"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Induk Fakultas / Unit Utama <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Pilih fakultas atau unit utama sebagai induk dari prodi/unit kerja
          </p>
        </div>
        <Controller
          name="id_unit_utama"
          control={control}
          rules={{ required: "Unit utama wajib dipilih" }}
          render={({ field }) => (
            <select
              {...field}
              id="id_unit_utama"
              required
              disabled={loadingUnitUtama || isLoading}
              className={getDynamicInputClass("id_unit_utama")}
              value={field.value || ""}
            >
              <option value="" disabled>
                {loadingUnitUtama ? "Memuat..." : "Pilih Unit Utama"}
              </option>
              {unitUtamaList.map((unit) => (
                <option key={unit.id_unit_utama} value={unit.id_unit_utama}>
                  {unit.nama_unit_utama}
                </option>
              ))}
            </select>
          )}
        />
        {errors.id_unit_utama && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_unit_utama.message}
          </p>
        )}
      </div>

      {/* Input Kode Unit */}
      <div>
        <label
          htmlFor="kode_unit"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Prodi / Unit <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 4 karakter (huruf/angka, tanpa spasi)</p>
        </div>
        <Controller
          name="kode_unit"
          control={control}
          rules={{
            required: "Kode unit wajib diisi",
            pattern: {
              value: /^[a-zA-Z0-9]{1,4}$/,
              message: "Kode unit harus 1-4 karakter (huruf/angka)",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="kode_unit"
              type="text"
              onChange={(e) => {
                const formattedValue = e.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                field.onChange(formattedValue);
              }}
              maxLength={4}
              required
              disabled={isLoading}
              className={getDynamicInputClass("kode_unit")}
              placeholder="Contoh: TI atau TIF"
            />
          )}
        />
        {errors.kode_unit && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_unit.message}
          </p>
        )}
      </div>

      {/* Input Nama Unit */}
      <div>
        <label
          htmlFor="nama_unit"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Prodi / Unit Kerja <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 100 karakter</p>
        </div>
        <Controller
          name="nama_unit"
          control={control}
          rules={{
            required: "Nama unit wajib diisi",
            maxLength: {
              value: 100,
              message: "Nama unit maksimal 100 karakter",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="nama_unit"
              type="text"
              maxLength={100}
              required
              disabled={isLoading}
              className={getDynamicInputClass("nama_unit")}
              placeholder="Contoh: Teknik Informatika"
            />
          )}
        />
        {errors.nama_unit && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_unit.message}
          </p>
        )}
      </div>

      {/* Tampilkan error submit global */}
      {errors.root?.submit && (
        <p
          className={`mt-1 text-sm text-center p-2 rounded ${
            theme === "dark"
              ? "text-red-400 bg-red-900/20"
              : "text-red-600 bg-red-50"
          }`}
        >
          {errors.root.submit.message}
        </p>
      )}

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
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
          disabled={isLoading || loadingUnitUtama} // Nonaktifkan jika form ATAU dropdown loading
          className={`px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors duration-200 ${
            theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
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
