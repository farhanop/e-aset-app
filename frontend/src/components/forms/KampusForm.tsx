// frontend\src\components\forms\KampusForm.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

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

export const KampusForm: React.FC<KampusFormProps> = ({
  initialData,
  onSave,
  isLoading,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Omit<KampusData, "id_kampus">>({
    kode_kampus: "",
    nama_kampus: "",
    alamat: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_kampus: initialData.kode_kampus || "",
        nama_kampus: initialData.nama_kampus || "",
        alamat: initialData.alamat || "",
      });
    } else {
      setFormData({ kode_kampus: "", nama_kampus: "", alamat: "" });
    }
    // Reset errors when initialData changes
    setErrors({});
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for kode_kampus to only allow letters and numbers
    if (name === "kode_kampus") {
      // Remove any non-alphanumeric characters (only allow a-z, A-Z, 0-9)
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: alphanumericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.kode_kampus.trim()) {
      newErrors.kode_kampus = "Kode kampus wajib diisi";
    } else if (!/^[a-zA-Z0-9]{1,2}$/.test(formData.kode_kampus)) {
      newErrors.kode_kampus = "Kode kampus harus 1-2 karakter (huruf/angka)";
    }

    if (!formData.nama_kampus.trim()) {
      newErrors.nama_kampus = "Nama kampus wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="kode_kampus"
          className={`block text-sm font-medium mb-1 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Lokasi *
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">A, B, 1, 2, AB, A1, 12</span>
          </p>
          <p>Maksimal 2 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        <input
          type="text"
          id="kode_kampus"
          name="kode_kampus"
          value={formData.kode_kampus}
          onChange={handleChange}
          maxLength={2}
          disabled={isLoading}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.kode_kampus
              ? theme === "dark"
                ? "bg-red-900/20 border-red-500 text-red-200"
                : "bg-red-50 border-red-300 text-red-900"
              : theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          } border`}
        />
        {errors.kode_kampus && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_kampus}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="nama_kampus"
          className={`block text-sm font-medium mb-1 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Lokasi *
        </label>

        {/* Catatan contoh input untuk nama kampus */}
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">
              Universitas Indo Global Mandiri, Dormitori
            </span>
          </p>
          <p>Maksimal 150 karakter</p>
        </div>

        <input
          type="text"
          id="nama_kampus"
          name="nama_kampus"
          value={formData.nama_kampus}
          onChange={handleChange}
          maxLength={150}
          disabled={isLoading}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.nama_kampus
              ? theme === "dark"
                ? "bg-red-900/20 border-red-500 text-red-200"
                : "bg-red-50 border-red-300 text-red-900"
              : theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          } border`}
        />
        {errors.nama_kampus && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_kampus}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="alamat"
          className={`block text-sm font-medium mb-1 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Alamat
        </label>

        {/* Catatan contoh input untuk alamat */}
        <div
          className={`text-xs mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">
              Jl. Jend. Sudirman Km.4 No. 62, 20 Ilir D. IV, Kec. Ilir Tim. I,
              Kota Palembang, Sumatera Selatan 30129
            </span>
          </p>
        </div>

        <textarea
          id="alamat"
          name="alamat"
          value={formData.alamat || ""}
          onChange={handleChange}
          rows={3}
          disabled={isLoading}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          } border`}
        />
      </div>

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
