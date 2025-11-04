// frontend\src\components\forms\LokasiForm.tsx
import React, { useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// --- TIPE DATA ---
interface Gedung {
  id_gedung: number;
  nama_gedung: string;
  kode_gedung?: string;
}
interface UnitKerja {
  id_unit_kerja: number;
  nama_unit: string;
  kode_unit?: string;
}

// Tipe data untuk form
interface LokasiData {
  id_lokasi?: number;
  kode_ruangan: string;
  nama_ruangan: string;
  lantai: number;
  id_gedung: number | null;
  id_unit_kerja: number | null;
}

// --- PROPS ---
interface LokasiFormProps {
  initialData?: LokasiData | null;
  onSave: (data: Omit<LokasiData, "id_lokasi">) => Promise<void>;
  isLoading: boolean; // isLoading dari mutasi (parent)
  onCancel?: () => void;
}

// --- Fungsi Fetching untuk useQuery ---
const fetchGedungList = async (): Promise<Gedung[]> => {
  const res = await api.get("/master-data/gedung");
  return res.data.data || res.data || [];
};

const fetchUnitKerjaList = async (): Promise<UnitKerja[]> => {
  const res = await api.get("/master-data/unit-kerja");
  return res.data.data || res.data || [];
};

export const LokasiForm: React.FC<LokasiFormProps> = ({
  initialData,
  onSave,
  isLoading, // Ini adalah isPending dari mutasi
  onCancel,
}) => {
  const { theme } = useTheme();

  // 1. Gunakan useQuery untuk mengambil data dropdown
  const { data: gedungList = [], isLoading: loadingGedung } = useQuery({
    queryKey: ["gedungList"],
    queryFn: fetchGedungList,
  });

  const { data: unitKerjaList = [], isLoading: loadingUnitKerja } = useQuery({
    queryKey: ["unitKerjaList"],
    queryFn: fetchUnitKerjaList,
  });

  const loadingDropdowns = loadingGedung || loadingUnitKerja;

  // 2. Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }, // errors dikelola otomatis
  } = useForm<LokasiData>({
    defaultValues: {
      kode_ruangan: "",
      nama_ruangan: "",
      lantai: 1,
      id_gedung: null,
      id_unit_kerja: null,
    },
  });

  // 3. Efek untuk mengisi form saat initialData berubah (mode edit)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        id_gedung: initialData.id_gedung || null,
        id_unit_kerja: initialData.id_unit_kerja || null,
      });
    } else {
      // Reset ke default jika mode create
      reset({
        kode_ruangan: "",
        nama_ruangan: "",
        lantai: 1,
        id_gedung: null,
        id_unit_kerja: null,
      });
    }
  }, [initialData, reset]);

  // 4. Fungsi onSubmit yang dipanggil oleh handleSubmit dari RHF
  const onSubmit = (data: LokasiData) => {
    // Pastikan data numerik dikirim sebagai angka
    const processedData = {
      ...data,
      lantai: Number(data.lantai) || 1,
      id_gedung: data.id_gedung ? Number(data.id_gedung) : null,
      id_unit_kerja: data.id_unit_kerja ? Number(data.id_unit_kerja) : null,
    };
    onSave(processedData);
  };

  // --- Kelas CSS ---
  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  // Helper untuk kelas input/select dinamis
  const getDynamicInputClass = (
    fieldName: keyof LokasiData,
    isSelect = false
  ) => {
    const baseClass = isSelect
      ? "bg-white border-gray-300 text-gray-900"
      : "bg-white border-gray-300 text-gray-900";
    const darkBaseClass = isSelect
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-700 border-gray-600 text-white";
    const errorClass = "bg-red-50 border-red-300 text-red-900";
    const darkErrorClass = "bg-red-900/20 border-red-500 text-red-200";

    const hasError = !!errors[fieldName];

    return `w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      hasError
        ? theme === "dark"
          ? darkErrorClass
          : errorClass
        : theme === "dark"
        ? darkBaseClass
        : baseClass
    }`;
  };

  const buttonClass = `px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
  }`;
  const submitButtonClass = `px-4 py-2 rounded-md font-medium text-white transition-colors duration-200 ${
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-blue-500 hover:bg-blue-600"
  }`;

  return (
    // 5. Ganti <form> untuk menggunakan handleSubmit dari RHF
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Input Kode Ruangan */}
      <div>
        <label htmlFor="kode_ruangan" className={labelClass}>
          Kode Ruangan *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Maksimal 6 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        {/* 6. Ganti input dengan Controller */}
        <Controller
          name="kode_ruangan"
          control={control}
          rules={{
            required: "Kode ruangan wajib diisi",
            pattern: {
              value: /^[a-zA-Z0-9]{1,6}$/,
              message: "Kode ruangan harus 1-6 karakter (huruf/angka)",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="kode_ruangan"
              type="text"
              // Terapkan logika formatting Anda di sini
              onChange={(e) => {
                const formattedValue = e.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                field.onChange(formattedValue); // Kirim nilai bersih ke RHF
              }}
              required
              maxLength={6}
              disabled={isLoading}
              className={getDynamicInputClass("kode_ruangan")}
              placeholder="Contoh: LAB101"
            />
          )}
        />
        {/* 7. Tampilkan error dari RHF */}
        {errors.kode_ruangan && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_ruangan.message}
          </p>
        )}
      </div>

      {/* Input Nama Ruangan */}
      <div>
        <label htmlFor="nama_ruangan" className={labelClass}>
          Nama Ruangan *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Contoh: Lab Komputer, Ruang Dosen, Auditorium</p>
        </div>
        <Controller
          name="nama_ruangan"
          control={control}
          rules={{ required: "Nama ruangan wajib diisi" }}
          render={({ field }) => (
            <input
              {...field}
              id="nama_ruangan"
              type="text"
              required
              disabled={isLoading}
              className={getDynamicInputClass("nama_ruangan")}
              placeholder="Contoh: Lab Komputer"
            />
          )}
        />
        {errors.nama_ruangan && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_ruangan.message}
          </p>
        )}
      </div>

      {/* Input Lantai */}
      <div>
        <label htmlFor="lantai" className={labelClass}>
          Lantai *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Masukkan nomor lantai (dimulai dari 1)</p>
        </div>
        <Controller
          name="lantai"
          control={control}
          rules={{
            required: "Lantai wajib diisi",
            min: { value: 1, message: "Lantai minimal 1" },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="lantai"
              type="number"
              required
              disabled={isLoading}
              className={getDynamicInputClass("lantai")}
              min="1"
            />
          )}
        />
        {errors.lantai && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.lantai.message}
          </p>
        )}
      </div>

      {/* Dropdown Gedung */}
      <div>
        <label htmlFor="id_gedung" className={labelClass}>
          Gedung *
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih gedung lokasi ruangan berada</p>
        </div>
        <Controller
          name="id_gedung"
          control={control}
          rules={{ required: "Gedung wajib dipilih" }}
          render={({ field }) => (
            <select
              {...field}
              id="id_gedung"
              disabled={isLoading || loadingDropdowns}
              required
              className={getDynamicInputClass("id_gedung", true)}
              value={field.value || ""} // Handle null value
            >
              <option value="">
                {loadingDropdowns ? "Memuat..." : "-- Pilih Gedung --"}
              </option>
              {gedungList.map((gedung) => (
                <option key={gedung.id_gedung} value={gedung.id_gedung}>
                  {gedung.nama_gedung}{" "}
                  {gedung.kode_gedung ? `(${gedung.kode_gedung})` : ""}
                </option>
              ))}
            </select>
          )}
        />
        {errors.id_gedung && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_gedung.message}
          </p>
        )}
      </div>

      {/* Dropdown Unit Kerja (Opsional) */}
      <div>
        <label htmlFor="id_unit_kerja" className={labelClass}>
          Unit Kerja (Penanggung Jawab)
        </label>
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih unit kerja yang bertanggung jawab (opsional)</p>
        </div>
        <Controller
          name="id_unit_kerja"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              id="id_unit_kerja"
              disabled={isLoading || loadingDropdowns}
              className={getDynamicInputClass("id_unit_kerja", true)}
              value={field.value || ""} // Handle null value
            >
              <option value="">
                {loadingDropdowns
                  ? "Memuat..."
                  : "-- Pilih Unit Kerja (Opsional) --"}
              </option>
              {unitKerjaList.map((unit) => (
                <option key={unit.id_unit_kerja} value={unit.id_unit_kerja}>
                  {unit.nama_unit} {unit.kode_unit ? `(${unit.kode_unit})` : ""}
                </option>
              ))}
            </select>
          )}
        />
        {/* Tidak perlu tampilkan error karena opsional */}
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={buttonClass}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || loadingDropdowns}
          className={submitButtonClass}
        >
          {isLoading
            ? "Menyimpan..."
            : initialData
            ? "Update Ruangan"
            : "Tambah Ruangan"}
        </button>
      </div>
    </form>
  );
};
