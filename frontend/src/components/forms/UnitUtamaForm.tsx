import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface UnitUtamaData {
  id_unit_utama?: number;
  kode_unit_utama: string;
  nama_unit_utama: string;
}

interface FormProps {
  initialData: UnitUtamaData | null;
  onSave: (data: UnitUtamaData) => void;
  onCancel: () => void;
}

export function UnitUtamaForm({ initialData, onSave, onCancel }: FormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    kode_unit_utama: "",
    nama_unit_utama: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_unit_utama: initialData.kode_unit_utama,
        nama_unit_utama: initialData.nama_unit_utama,
      });
    } else {
      setFormData({
        kode_unit_utama: "",
        nama_unit_utama: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kode_unit_utama.trim()) {
      newErrors.kode_unit_utama = "Kode unit wajib diisi";
    } else if (formData.kode_unit_utama.length > 20) {
      newErrors.kode_unit_utama = "Kode unit maksimal 20 karakter";
    }
    
    if (!formData.nama_unit_utama.trim()) {
      newErrors.nama_unit_utama = "Nama unit utama wajib diisi";
    } else if (formData.nama_unit_utama.length > 100) {
      newErrors.nama_unit_utama = "Nama unit utama maksimal 100 karakter";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      onSave({ ...initialData, ...formData });
    } catch (error: any) {
      console.error("Error saving unit utama:", error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
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
        <label htmlFor="kode_unit_utama" className={`block text-sm font-medium ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Kode Unit <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="kode_unit_utama"
            type="text"
            name="kode_unit_utama"
            value={formData.kode_unit_utama}
            onChange={handleChange}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.kode_unit_utama 
                ? "border-red-500" 
                : theme === "dark" 
                  ? "border-gray-600 bg-gray-700 text-white" 
                  : "border-gray-300"
            } px-3 py-2`}
            placeholder="Masukkan kode unit"
          />
        </div>
        {errors.kode_unit_utama && (
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-red-400" : "text-red-600"
          }`}>
            {errors.kode_unit_utama}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="nama_unit_utama" className={`block text-sm font-medium ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Nama Unit Utama <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="nama_unit_utama"
            type="text"
            name="nama_unit_utama"
            value={formData.nama_unit_utama}
            onChange={handleChange}
            required
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.nama_unit_utama 
                ? "border-red-500" 
                : theme === "dark" 
                  ? "border-gray-600 bg-gray-700 text-white" 
                  : "border-gray-300"
            } px-3 py-2`}
            placeholder="Masukkan nama unit utama"
          />
        </div>
        {errors.nama_unit_utama && (
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-red-400" : "text-red-600"
          }`}>
            {errors.nama_unit_utama}
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
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : isEditMode ? "Simpan Perubahan" : "Buat Baru"}
        </button>
      </div>
    </form>
  );
}