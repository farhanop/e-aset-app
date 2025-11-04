// frontend\src\components\forms\KampusForm.tsx
import React, { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";

// --- TIPE DATA ---
interface KampusData {
  id_kampus?: number;
  kode_kampus: string;
  nama_kampus: string;
  alamat?: string | null;
}

interface KampusFormProps {
  initialData?: KampusData | null;
  onSave: (data: Omit<KampusData, "id_kampus">) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
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

export const KampusForm: React.FC<KampusFormProps> = ({
  initialData,
  onSave,
  isLoading,
  onCancel,
}) => {
  const { theme } = useTheme();

  // 1. Setup react-hook-form (menggantikan useState)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<KampusData>({
    defaultValues: {
      kode_kampus: "",
      nama_kampus: "",
      alamat: "",
    },
  });

  // 2. Efek untuk mengisi form saat initialData berubah (menggunakan reset)
  useEffect(() => {
    if (initialData) {
      reset({
        kode_kampus: initialData.kode_kampus || "",
        nama_kampus: initialData.nama_kampus || "",
        alamat: initialData.alamat || "",
      });
    } else {
      // Reset ke default jika mode create
      reset({
        kode_kampus: "",
        nama_kampus: "",
        alamat: "",
      });
    }
  }, [initialData, reset]);

  // 3. Fungsi onSubmit (menggantikan handleSubmit manual dan validateForm)
  const onSubmit = async (data: KampusData) => {
    try {
      // Data sudah tervalidasi oleh react-hook-form
      await onSave(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Terjadi kesalahan. Silakan coba lagi.";

      // Menampilkan error global di bawah form
      setError("root.submit", { type: "manual", message });
    }
  };

  // --- Helper Kelas CSS ---
  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  // Helper untuk kelas input/textarea dinamis
  const getDynamicInputClass = (fieldName: keyof KampusData) => {
    const hasError = !!errors[fieldName];
    return `block w-full rounded-md shadow-sm sm:text-sm border ${
      hasError
        ? theme === "dark"
          ? "bg-red-900/20 border-red-500 text-red-200" // Error Dark
          : "bg-red-50 border-red-300 text-red-900" // Error Light
        : theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500" // Normal Dark
        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500" // Normal Light
    }`;
  };

  return (
    // 4. Ganti <form> untuk menggunakan handleSubmit dari RHF
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Input Kode Kampus */}
      <div>
        <label htmlFor="kode_kampus" className={labelClass}>
          Kode Lokasi *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 2 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        {/* 5. Ganti input dengan Controller */}
        <Controller
          name="kode_kampus"
          control={control}
          rules={{
            // 6. Pindahkan validasi ke 'rules'
            required: "Kode kampus wajib diisi",
            pattern: {
              value: /^[a-zA-Z0-9]{1,2}$/,
              message: "Kode kampus harus 1-2 karakter (huruf/angka)",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="kode_kampus"
              type="text"
              // 7. Pindahkan logika 'handleChange' ke 'onChange'
              onChange={(e) => {
                const formattedValue = e.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                field.onChange(formattedValue);
              }}
              maxLength={2}
              disabled={isLoading}
              className={getDynamicInputClass("kode_kampus")}
              placeholder="Contoh: A, B, 1"
            />
          )}
        />
        {/* 8. Tampilkan error dari RHF */}
        {errors.kode_kampus && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_kampus.message}
          </p>
        )}
      </div>

      {/* Input Nama Kampus */}
      <div>
        <label htmlFor="nama_kampus" className={labelClass}>
          Nama Lokasi *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 150 karakter. Contoh: Universitas Indo Global Mandiri</p>
        </div>
        <Controller
          name="nama_kampus"
          control={control}
          rules={{
            required: "Nama kampus wajib diisi",
            maxLength: {
              value: 150,
              message: "Nama kampus maksimal 150 karakter",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="nama_kampus"
              type="text"
              maxLength={150}
              disabled={isLoading}
              className={getDynamicInputClass("nama_kampus")}
              placeholder="Contoh: Universitas Indo Global Mandiri"
            />
          )}
        />
        {errors.nama_kampus && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_kampus.message}
          </p>
        )}
      </div>

      {/* Input Alamat */}
      <div>
        <label htmlFor="alamat" className={labelClass}>
          Alamat
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Alamat lengkap lokasi (opsional)</p>
        </div>
        <Controller
          name="alamat"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="alamat"
              rows={3}
              disabled={isLoading}
              className={getDynamicInputClass("alamat")}
              placeholder="Contoh: Jl. Jend. Sudirman Km.4 No. 62..."
              value={field.value || ""} // Handle null/undefined
            />
          )}
        />
        {/* Error tidak ditampilkan karena opsional */}
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
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              theme === "dark"
                ? "bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
            isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading
            ? "Menyimpan..."
            : initialData
            ? "Update Kampus"
            : "Tambah Kampus"}
        </button>
      </div>
    </form>
  );
};
