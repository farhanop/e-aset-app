import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";

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

interface FormProps {
  initialData: Partial<ItemData> | null;
  onSave: (data: ItemData) => void;
  onCancel: () => void;
}

export function MasterItemForm({ initialData, onSave, onCancel }: FormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ItemData>({
    kode_item: "",
    nama_item: "",
    id_kategori: "",
    metode_pelacakan: "",
    umur_ekonomis: "",
  });
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!initialData?.id_item;

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const response = await api.get("/master-data/kategori-item");
        setKategoriList(response.data);
      } catch (error) {
        console.error("Error fetching kategori:", error);
      }
    };

    fetchKategori();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_item: initialData.kode_item || "",
        nama_item: initialData.nama_item || "",
        id_kategori: initialData.id_kategori || "",
        metode_pelacakan: initialData.metode_pelacakan || "",
        umur_ekonomis: initialData.umur_ekonomis || "",
      });
    } else {
      setFormData({
        kode_item: "",
        nama_item: "",
        id_kategori: "",
        metode_pelacakan: "",
        umur_ekonomis: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.kode_item.trim()) {
      newErrors.kode_item = "Kode item wajib diisi";
    } else if (!/^[a-zA-Z0-9]{1,4}$/.test(formData.kode_item)) {
      newErrors.kode_item = "Kode item harus 1-4 karakter (huruf/angka)";
    }

    if (!formData.nama_item.trim()) {
      newErrors.nama_item = "Nama item wajib diisi";
    } else if (formData.nama_item.length > 100) {
      newErrors.nama_item = "Nama item maksimal 100 karakter";
    }

    if (!formData.id_kategori) {
      newErrors.id_kategori = "Kategori wajib dipilih";
    }

    if (!formData.metode_pelacakan) {
      newErrors.metode_pelacakan = "Metode pelacakan wajib dipilih";
    }

    if (formData.umur_ekonomis && Number(formData.umur_ekonomis) <= 0) {
      newErrors.umur_ekonomis = "Umur ekonomis harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for kode_item to only allow letters and numbers
    if (name === "kode_item") {
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
        id_kategori: Number(formData.id_kategori),
        umur_ekonomis: formData.umur_ekonomis
          ? Number(formData.umur_ekonomis)
          : undefined,
      };

      onSave(dataToSubmit as ItemData);
    } catch (error: any) {
      console.error("Error saving master item:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          Object.values(error.response?.data?.errors || {}).join(", ") ||
          "Data tidak valid";
        alert(`Gagal menyimpan data: ${errorMessage}`);
      } else if (error.response?.status === 409) {
        alert("Kode item sudah digunakan");
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
          htmlFor="id_kategori"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kategori Item <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih kategori yang sesuai untuk item ini</p>
        </div>

        <div className="mt-1">
          <select
            id="id_kategori"
            name="id_kategori"
            value={formData.id_kategori}
            onChange={handleChange}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.id_kategori
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
          >
            <option value="" disabled>
              Pilih Kategori
            </option>
            {kategoriList.map((k) => (
              <option key={k.id_kategori} value={k.id_kategori}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>
        {errors.id_kategori && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.id_kategori}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="metode_pelacakan"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Metode Pelacakan <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Pilih metode pelacakan untuk item ini</p>
        </div>

        <div className="mt-1">
          <select
            id="metode_pelacakan"
            name="metode_pelacakan"
            value={formData.metode_pelacakan}
            onChange={handleChange}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.metode_pelacakan
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
          >
            <option value="" disabled>
              Pilih Metode
            </option>
            <option value="Individual">Individual (per Unit)</option>
            <option value="Stok">Stok (per Jumlah)</option>
          </select>
        </div>
        {errors.metode_pelacakan && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.metode_pelacakan}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="kode_item"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Kode Item (SKU) <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">A1, B2, T01, K04, CPU, LCD, PRN</span>
          </p>
          <p>Maksimal 4 karakter (huruf/angka, tanpa spasi)</p>
        </div>

        <div className="mt-1">
          <input
            id="kode_item"
            type="text"
            name="kode_item"
            value={formData.kode_item}
            onChange={handleChange}
            required
            maxLength={4}
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.kode_item
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
            placeholder="Contoh: CPU"
          />
        </div>
        {errors.kode_item && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.kode_item}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="nama_item"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Item <span className="text-red-500">*</span>
        </label>

        {/* Catatan contoh input untuk nama item */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            Contoh input:{" "}
            <span className="font-medium">
              Laptop Dell, Meja Kantor, Kursi Staff, Proyektor Epson
            </span>
          </p>
          <p>Maksimal 100 karakter</p>
        </div>

        <div className="mt-1">
          <input
            id="nama_item"
            type="text"
            name="nama_item"
            value={formData.nama_item}
            onChange={handleChange}
            required
            maxLength={100}
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.nama_item
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
            placeholder="Contoh: Laptop Dell"
          />
        </div>
        {errors.nama_item && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.nama_item}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="umur_ekonomis"
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Umur Ekonomis (Tahun, Opsional)
        </label>

        {/* Catatan contoh input untuk umur ekonomis */}
        <div
          className={`text-xs mt-1 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>Masukkan umur ekonomis item dalam tahun (contoh: 5)</p>
        </div>

        <div className="mt-1">
          <input
            id="umur_ekonomis"
            type="number"
            name="umur_ekonomis"
            value={formData.umur_ekonomis}
            onChange={handleChange}
            min="1"
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.umur_ekonomis
                ? "border-red-500"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300"
            } px-3 py-2`}
            placeholder="Contoh: 5"
          />
        </div>
        {errors.umur_ekonomis && (
          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.umur_ekonomis}
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
