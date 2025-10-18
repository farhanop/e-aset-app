// src/components/RoleForm.tsx
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaSave, FaTimes } from "react-icons/fa";

interface RoleFormProps {
  onSubmit: (data: { nama_role: string; deskripsi: string }) => void;
  onCancel: () => void;
}

export function RoleForm({ onSubmit, onCancel }: RoleFormProps) {
  const [namaRole, setNamaRole] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nama_role: namaRole, deskripsi });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Nama Peran <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={namaRole}
          onChange={(e) => setNamaRole(e.target.value)}
          required
          className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
          placeholder="Contoh: Admin, Manager, User"
        />
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Deskripsi
        </label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={3}
          className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          }`}
          placeholder="Deskripsi singkat tentang peran ini"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
            theme === "dark"
              ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
              : "text-gray-700 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <FaTimes className="mr-2" />
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaSave className="mr-2" />
          Buat Peran
        </button>
      </div>
    </form>
  );
}