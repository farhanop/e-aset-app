// frontend\src\components\forms\UpdateProfileForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { FaCamera, FaTrash } from "react-icons/fa";
import api from "../../api/axios";
import { User } from "../../types/User";

/**
 * Tipe data untuk state internal form
 */
interface FormDataState {
  nama_lengkap: string;
  email: string;
  nomor_telepon?: string;
}

/**
 * Tipe data yang dikirim ke parent (ProfilePage) saat submit
 */
export interface UpdateProfilePayload {
  nama_lengkap: string;
  email: string;
  nomor_telepon?: string;
  foto_profil_file?: File | null; // File baru yang akan diupload
  foto_profil_remove?: boolean; // Flag jika foto ingin dihapus
}

interface UpdateProfileFormProps {
  initialData: User; // Data user saat ini
  onSubmit: (data: UpdateProfilePayload) => Promise<void>; // Fungsi untuk submit
  isSubmitting: boolean; // Status loading dari parent
}

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const { theme } = useTheme();

  // State untuk data teks
  const [formData, setFormData] = useState<FormDataState>({
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
  });

  // State untuk file dan preview
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // HAPUS state isUploading, karena kita tidak upload di sini
  // const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Isi form dengan data awal
  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_lengkap: initialData.nama_lengkap || "",
        email: initialData.email || "",
        nomor_telepon: initialData.nomor_telepon || "",
      });

      if (initialData.foto_profil) {
        const p = initialData.foto_profil.startsWith("http")
          ? initialData.foto_profil
          : `${api.defaults.baseURL || ""}${initialData.foto_profil}`;
        setPreview(p);
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.match("image.*")) {
        alert("Hanya file gambar yang diperbolehkan");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB");
        return;
      }

      setSelectedFile(file); // Simpan file mentah

      // Buat preview lokal
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ===================================================================
  // 🔧 PERBAIKAN UTAMA: handleSubmit 🔧
  // ===================================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Hapus semua logika 'try/catch' dan 'api.post' dari sini.
    // Kita hanya kumpulkan data dan kirim ke parent.

    const payload: UpdateProfilePayload = {
      nama_lengkap: formData.nama_lengkap,
      email: formData.email,
      nomor_telepon: formData.nomor_telepon || undefined,

      // Kirim file mentahnya, BUKAN path
      foto_profil_file: selectedFile,

      // Kirim flag 'true' jika user menghapus foto dan tidak memilih yang baru
      foto_profil_remove: preview === null && !selectedFile,
    };

    // Panggil fungsi onSubmit dari parent (ProfilePage) dengan payload ini
    await onSubmit(payload);
  };

  const inputClass = `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    theme === "dark"
      ? "border-gray-600 bg-gray-700 text-white"
      : "border-gray-300 bg-white text-gray-900"
  }`;
  const labelClass = `block text-sm font-medium ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload Foto Profil */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <span
                className={`text-4xl ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ?
              </span>
            </div>
          )}

          <div className="absolute bottom-0 right-0 flex space-x-1">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isSubmitting} // Hapus isUploading
              className={`p-2 rounded-full shadow-md ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FaCamera className="text-sm" />
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSubmitting} // Hapus isUploading
                className={`p-2 rounded-full shadow-md ${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FaTrash className="text-sm" />
              </button>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <p
          className={`mt-2 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Format: JPG, PNG, GIF. Maksimal: 10MB
        </p>
      </div>

      {/* Input Fields */}
      <div>
        <label htmlFor="nama_lengkap" className={labelClass}>
          Nama Lengkap
        </label>
        <input
          type="text"
          id="nama_lengkap"
          name="nama_lengkap"
          value={formData.nama_lengkap}
          onChange={handleInputChange}
          disabled={isSubmitting} // Hapus isUploading
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isSubmitting} // Hapus isUploading
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="nomor_telepon" className={labelClass}>
          Nomor Telepon
        </label>
        <input
          type="tel"
          id="nomor_telepon"
          name="nomor_telepon"
          value={formData.nomor_telepon || ""}
          onChange={handleInputChange}
          disabled={isSubmitting} // Hapus isUploading
          className={inputClass}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting} // Hapus isUploading
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
};
