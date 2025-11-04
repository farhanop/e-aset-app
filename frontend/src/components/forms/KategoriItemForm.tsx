// frontend\src\components\forms\KategoriItemForm.tsx
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";

// --- TIPE DATA ---
interface KategoriData {
  id_kategori?: number;
  nama_kategori: string;
}

// --- PROPS (Diperbaiki) ---
interface FormProps {
  initialData: Partial<KategoriData> | null;
  onSave: (data: KategoriData) => Promise<void>; // 1. Diubah ke Promise
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

export function KategoriItemForm({
  initialData,
  onSave,
  onCancel,
  isLoading, // Menerima isPending/isLoading dari mutasi
}: FormProps) {
  const { theme } = useTheme();
  const isEditMode = !!initialData?.id_kategori;

  // 3. Setup react-hook-form (menggantikan semua useState)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<KategoriData>({
    defaultValues: {
      nama_kategori: "",
    },
  });

  // 4. Efek untuk mengisi form (menggantikan useEffect lama)
  useEffect(() => {
    if (initialData) {
      reset({
        nama_kategori: initialData.nama_kategori || "",
      });
    } else {
      // Reset ke default jika mode create
      reset({ nama_kategori: "" });
    }
  }, [initialData, reset]);

  // 5. Fungsi onSubmit (menggantikan handleSubmit manual dan validateForm)
  const onSubmit = async (data: KategoriData) => {
    try {
      // Data sudah tervalidasi oleh react-hook-form
      await onSave(data as KategoriData);
    } catch (error) {
      console.error("Error saving kategori item:", error);
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
  const getDynamicInputClass = (fieldName: keyof KategoriData) => {
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
      <div>
        <label
          htmlFor="nama_kategori"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Kategori <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 100 karakter</p>
        </div>

        <div className="mt-1">
          {/* 7. Ganti input dengan Controller */}
          <Controller
            name="nama_kategori"
            control={control}
            rules={{
              // 8. Pindahkan validasi ke 'rules'
              required: "Nama kategori wajib diisi",
              maxLength: {
                value: 100,
                message: "Nama kategori maksimal 100 karakter",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                id="nama_kategori"
                type="text"
                required
                maxLength={100}
                disabled={isLoading} // Menggunakan isLoading dari props
                className={getDynamicInputClass("nama_kategori")}
                placeholder="Contoh: Elektronik"
              />
            )}
          />
        </div>
        {/* 9. Tampilkan error dari RHF */}
        {errors.nama_kategori && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_kategori.message}
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
