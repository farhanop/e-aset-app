// frontend\src\components\forms\GedungForm.tsx
import React, { useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// --- TIPE DATA ---
interface Kampus {
  id_kampus: number;
  nama_kampus: string;
  kode_kampus: string;
}

interface GedungData {
  id_gedung?: number;
  kode_gedung: string;
  nama_gedung: string;
  id_kampus: number | null; // Diubah ke number | null agar konsisten
}

interface GedungFormProps {
  initialData?: GedungData | null;
  onSave: (data: Omit<GedungData, "id_gedung">) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

// Tipe untuk error (masih bisa digunakan untuk error submit)
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// --- Fungsi Fetching untuk useQuery ---
const fetchKampusList = async (): Promise<Kampus[]> => {
  const response = await api.get("/master-data/kampus");
  return response.data.data || response.data || [];
};

export const GedungForm: React.FC<GedungFormProps> = ({
  initialData,
  onSave,
  isLoading,
  onCancel,
}) => {
  const { theme } = useTheme();

  // 1. Mengambil data dropdown dengan useQuery
  const { data: kampusList = [], isLoading: loadingKampus } = useQuery({
    queryKey: ["kampusList"],
    queryFn: fetchKampusList,
  });

  // 2. Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError, // Untuk error submit manual
  } = useForm<GedungData>({
    defaultValues: {
      kode_gedung: "",
      nama_gedung: "",
      id_kampus: null,
    },
  });

  // 3. Efek untuk mengisi form saat initialData berubah
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        id_kampus: initialData.id_kampus || null,
      });
    } else {
      reset({
        kode_gedung: "",
        nama_gedung: "",
        id_kampus: null,
      });
    }
  }, [initialData, reset]);

  // 4. Fungsi onSubmit (dipanggil oleh RHF setelah validasi)
  const onSubmit = async (data: GedungData) => {
    const processedData = {
      ...data,
      id_kampus: data.id_kampus ? Number(data.id_kampus) : null,
    };

    try {
      await onSave(processedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Terjadi kesalahan jaringan. Silakan coba lagi.";

      // Menampilkan error submit global
      setError("root.submit", { type: "manual", message });
    }
  };

  // --- Helper Kelas CSS ---
  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  const getDynamicInputClass = (fieldName: keyof GedungData) => {
    const hasError = !!errors[fieldName];
    return `block w-full rounded-md shadow-sm sm:text-sm border ${
      hasError
        ? theme === "dark"
          ? "bg-red-900/20 border-red-500 text-red-200"
          : "bg-red-50 border-red-300 text-red-900"
        : theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
    }`;
  };

  return (
    // 5. Ganti <form> untuk menggunakan handleSubmit dari RHF
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Input Kode Gedung */}
      <div>
        <label htmlFor="kode_gedung" className={labelClass}>
          Kode Gedung *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 2 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        {/* 6. Ganti input dengan Controller */}
        <Controller
          name="kode_gedung"
          control={control}
          rules={{
            required: "Kode gedung wajib diisi",
            pattern: {
              value: /^[a-zA-Z0-9]{1,2}$/,
              message: "Kode gedung harus 1-2 karakter (huruf/angka)",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="kode_gedung"
              type="text"
              // Terapkan logika formatting Anda di sini
              onChange={(e) => {
                const formattedValue = e.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                field.onChange(formattedValue);
              }}
              maxLength={2}
              disabled={isLoading}
              className={getDynamicInputClass("kode_gedung")}
              placeholder="Contoh: A, B, 1, 2, AB, A1, 12"
            />
          )}
        />
        {/* 7. Tampilkan error dari RHF */}
        {errors.kode_gedung && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_gedung.message}
          </p>
        )}
      </div>

      {/* Input Nama Gedung */}
      <div>
        <label htmlFor="nama_gedung" className={labelClass}>
          Nama Gedung *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 100 karakter. Contoh: Gedung A, Gedung B</p>
        </div>
        <Controller
          name="nama_gedung"
          control={control}
          rules={{
            required: "Nama gedung wajib diisi",
            maxLength: {
              value: 100,
              message: "Nama gedung maksimal 100 karakter",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="nama_gedung"
              type="text"
              maxLength={100}
              disabled={isLoading}
              className={getDynamicInputClass("nama_gedung")}
              placeholder="Contoh: Gedung A"
            />
          )}
        />
        {errors.nama_gedung && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_gedung.message}
          </p>
        )}
      </div>

      {/* Dropdown Kampus */}
      <div>
        <label htmlFor="id_kampus" className={labelClass}>
          Lokasi (Kampus) *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih kampus lokasi gedung berada</p>
        </div>
        <Controller
          name="id_kampus"
          control={control}
          rules={{ required: "Kampus wajib dipilih" }}
          render={({ field }) => (
            <select
              {...field}
              id="id_kampus"
              disabled={isLoading || loadingKampus}
              className={getDynamicInputClass("id_kampus")}
              value={field.value || ""} // Handle null value
            >
              <option value="">
                {loadingKampus ? "Memuat kampus..." : "-- Pilih Kampus --"}
              </option>
              {kampusList.map((kampus) => (
                <option key={kampus.id_kampus} value={kampus.id_kampus}>
                  {kampus.kode_kampus} - {kampus.nama_kampus}
                </option>
              ))}
            </select>
          )}
        />
        {errors.id_kampus && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_kampus.message}
          </p>
        )}
      </div>

      {/* Error Submit Global */}
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
          disabled={isLoading || loadingKampus} // Nonaktifkan jika form loading ATAU dropdown loading
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
            isLoading || loadingKampus
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading
            ? "Menyimpan..."
            : initialData
            ? "Update Gedung"
            : "Tambah Gedung"}
        </button>
      </div>
    </form>
  );
};
