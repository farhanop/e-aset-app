// frontend\src\components\forms\UnitKerjaForm.tsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";

interface UnitUtama {
  id_unit_utama: number;
  nama_unit_utama: string;
}

interface UnitKerjaData {
  id_unit_kerja?: number;
  kode_unit: string;
  nama_unit: string;
  id_unit_utama: number | string;
}

interface FormProps {
  initialData: Partial<UnitKerjaData> | null;
  onSave: (data: UnitKerjaData) => void;
  onCancel: () => void;
}

export function UnitKerjaForm({ initialData, onSave, onCancel }: FormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UnitKerjaData>({
    kode_unit: "",
    nama_unit: "",
    id_unit_utama: "",
  });
  const [unitUtamaList, setUnitUtamaList] = useState<UnitUtama[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!initialData?.id_unit_kerja;

  useEffect(() => {
    const fetchUnitUtama = async () => {
      try {
        const response = await api.get("/master-data/unit-utama");
        setUnitUtamaList(response.data);
      } catch (error) {
        console.error("Error fetching unit utama:", error);
      }
    };

    fetchUnitUtama();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_unit: initialData.kode_unit || "",
        nama_unit: initialData.nama_unit || "",
        id_unit_utama: initialData.id_unit_utama?.toString() || "",
      });
    } else {
      setFormData({ kode_unit: "", nama_unit: "", id_unit_utama: "" });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.kode_unit.trim()) {
      newErrors.kode_unit = "Kode unit wajib diisi";
    } else if (!/^[a-zA-Z0-9]{1,4}$/.test(formData.kode_unit)) {
      newErrors.kode_unit = "Kode unit harus 1-4 karakter (huruf/angka)";
    }

    if (!formData.nama_unit.trim()) {
      newErrors.nama_unit = "Nama unit wajib diisi";
    } else if (formData.nama_unit.length > 100) {
      newErrors.nama_unit = "Nama unit maksimal 100 karakter";
    }

    if (!formData.id_unit_utama) {
      newErrors.id_unit_utama = "Unit utama wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for kode_unit to only allow letters and numbers
    if (name === "kode_unit") {
      // Remove any non-alphanumeric characters (only allow a-z, A-Z, 0-9)
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData({ ...formData, [name]: alphanumericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        id_unit_utama: Number(formData.id_unit_utama),
      };

      onSave(dataToSubmit as UnitKerjaData);
    } catch (error: any) {
      console.error("Error saving unit kerja:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          Object.values(error.response?.data?.errors || {}).join(", ") ||
          "Data tidak valid";
        alert(`Gagal menyimpan data: ${errorMessage}`);
      } else if (error.response?.status === 409) {
        alert("Kode unit sudah digunakan");
      } else {
        alert("Gagal menyimpan data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="id_unit_utama"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Induk Fakultas / Unit Utama <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Pilih fakultas atau unit utama sebagai induk dari prodi/unit kerja
          </p>
        </div>

        <div className="mt-1">
          <select
            id="id_unit_utama"
            name="id_unit_utama"
            value={formData.id_unit_utama}
            onChange={handleChange}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.id_unit_utama
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
          >
            <option value="" disabled>
              Pilih Unit Utama
            </option>
            {unitUtamaList.map((unit) => (
              <option key={unit.id_unit_utama} value={unit.id_unit_utama}>
                {unit.nama_unit_utama}
              </option>
            ))}
          </select>
        </div>
        {errors.id_unit_utama && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_unit_utama}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="kode_unit"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Prodi <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">
              TI, S1, INF, TIF, S2MT, BPT, AKT
            </span>
          </p>
          <p>Maksimal 4 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        <div className="mt-1">
          <input
            id="kode_unit"
            type="text"
            name="kode_unit"
            value={formData.kode_unit}
            onChange={handleChange}
            maxLength={4}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.kode_unit
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
            placeholder="Contoh: TI atau TIF"
          />
        </div>
        {errors.kode_unit && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_unit}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="nama_unit"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Prodi / Unit Kerja <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input untuk nama unit */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">
              Teknik Informatika, Sistem Informasi, Manajemen
            </span>
          </p>
          <p>Maksimal 100 karakter</p>
        </div>

        <div className="mt-1">
          <input
            id="nama_unit"
            type="text"
            name="nama_unit"
            value={formData.nama_unit}
            onChange={handleChange}
            maxLength={100}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.nama_unit
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
            placeholder="Contoh: Teknik Informatika"
          />
        </div>
        {errors.nama_unit && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_unit}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
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
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors duration-200 ${
            theme === "dark" ? "hover:bg-blue-600" : "hover:bg-blue-700"
          }`}
        >
          {loading ? (
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
