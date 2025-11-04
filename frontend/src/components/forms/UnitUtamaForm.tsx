// frontend\src\components\forms\UnitUtamaForm.tsx
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";

// --- TIPE DATA ---
interface UnitUtamaData {
  id_unit_utama?: number;
  kode_unit_utama: string;
  nama_unit_utama: string;
}

// --- PROPS (Diperbaiki) ---
interface FormProps {
  initialData: UnitUtamaData | null;
  onSave: (data: UnitUtamaData) => Promise<void>; // 1. Diubah ke Promise
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

export function UnitUtamaForm({
  initialData,
  onSave,
  onCancel,
  isLoading, // Menerima isPending/isLoading dari mutasi
}: FormProps) {
  const { theme } = useTheme();
  const isEditMode = !!initialData;

  // 3. Setup react-hook-form (menggantikan semua useState)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UnitUtamaData>({
    defaultValues: {
      kode_unit_utama: "",
      nama_unit_utama: "",
    },
  });

  // 4. Efek untuk mengisi form (menggantikan useEffect lama)
  useEffect(() => {
    if (initialData) {
      reset(initialData); // Cukup reset dengan initialData
    } else {
      // Reset ke default jika mode create
      reset({
        kode_unit_utama: "",
        nama_unit_utama: "",
      });
    }
  }, [initialData, reset]);

  // 5. Fungsi onSubmit (menggantikan handleSubmit manual dan validateForm)
  const onSubmit = async (data: UnitUtamaData) => {
    try {
      // 'data' dari RHF berisi nilai form.
      // 'initialData' berisi ID jika mode edit.
      // Kita gabungkan keduanya untuk dikirim.
      await onSave({ ...initialData, ...data });
    } catch (error) {
      console.error("Error saving unit utama:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Gagal menyimpan data. Silakan coba lagi.";

      // Menampilkan error global di bawah form
      setError("root.submit", { type: "manual", message });
    }
  };

  // Helper untuk kelas CSS
  const getDynamicInputClass = (fieldName: keyof UnitUtamaData) => {
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
    // 6. Ganti form untuk menggunakan handleSubmit dari RHF
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Input Kode Unit Utama */}
      <div>
        <label
          htmlFor="kode_unit_utama"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Unit <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 2 karakter (huruf/angka, tanpa spasi)</p>
        </div>
        <div className="mt-1">
          {/* 7. Ganti input dengan Controller */}
          <Controller
            name="kode_unit_utama"
            control={control}
            rules={{
              // 8. Pindahkan validasi ke 'rules'
              required: "Kode unit wajib diisi",
              pattern: {
                value: /^[a-zA-Z0-9]{1,2}$/,
                message: "Kode unit harus 1-2 karakter (huruf/angka)",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                id="kode_unit_utama"
                type="text"
                // 9. Pindahkan logika 'handleChange' ke 'onChange'
                onChange={(e) => {
                  const formattedValue = e.target.value
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase();
                  field.onChange(formattedValue);
                }}
                maxLength={2}
                required
                disabled={isLoading} // Menggunakan isLoading dari props
                className={getDynamicInputClass("kode_unit_utama")}
                placeholder="Contoh: A atau A1"
              />
            )}
          />
        </div>
        {/* 10. Tampilkan error dari RHF */}
        {errors.kode_unit_utama && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_unit_utama.message}
          </p>
        )}
      </div>

      {/* Input Nama Unit Utama */}
      <div>
        <label
          htmlFor="nama_unit_utama"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Unit Utama <span className="text-red-500">*</span>
        </label>
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 100 karakter</p>
        </div>
        <div className="mt-1">
          <Controller
            name="nama_unit_utama"
            control={control}
            rules={{
              required: "Nama unit utama wajib diisi",
              maxLength: {
                value: 100,
                message: "Nama unit utama maksimal 100 karakter",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                id="nama_unit_utama"
                type="text"
                maxLength={100}
                required
                disabled={isLoading} // Menggunakan isLoading dari props
                className={getDynamicInputClass("nama_unit_utama")}
                placeholder="Contoh: Fakultas Teknik"
              />
            )}
          />
        </div>
        {errors.nama_unit_utama && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_unit_utama.message}
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
          disabled={isLoading} // Menggunakan isLoading dari props
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
