import { useState, useEffect } from "react";
import { User } from "../types/User";
import { useTheme } from "../contexts/ThemeContext";

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "",
    status: "aktif" as "aktif" | "nonaktif",
  });

  const isEditMode = !!initialData;
  const { theme } = useTheme();

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nama_lengkap: initialData.nama_lengkap,
        username: initialData.username,
        email: initialData.email,
        password: "", // Password dikosongkan saat edit demi keamanan
        status: initialData.status,
      });
    } else {
      // Reset form untuk mode 'create'
      setFormData({
        nama_lengkap: "",
        username: "",
        email: "",
        password: "",
        status: "aktif",
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: Partial<User> & { password?: string } = { ...formData };
    // Jika password kosong saat edit, jangan kirim field password
    if (isEditMode && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Lengkap
        </label>
        <input
          type="text"
          name="nama_lengkap"
          value={formData.nama_lengkap}
          onChange={handleChange}
          required
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={isEditMode ? "Kosongkan jika tidak diubah" : ""}
          required={!isEditMode}
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            theme === "dark"
              ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
              : "text-gray-700 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isEditMode ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>
    </form>
  );
}