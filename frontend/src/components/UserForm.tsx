// src/components/UserForm.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { User } from "../types/User";

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: Partial<User>) => Promise<void>;
  onCancel: () => void;
  availableRoles?: Array<User["role"]>;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  availableRoles = ["super-admin", "admin", "staff"] as const,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Partial<User>>({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "", // Properti password sekarang valid
    status: "aktif",
    role: "staff",
    nomor_telepon: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_lengkap: initialData.nama_lengkap || "",
        username: initialData.username || "",
        email: initialData.email || "",
        password: "", // Kosongkan password untuk edit
        status: initialData.status || "aktif",
        role: initialData.role || "staff",
        nomor_telepon: initialData.nomor_telepon || "",
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
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
      <div>
        <label htmlFor="nama_lengkap" className={labelClass}>
          Nama Lengkap
        </label>
        <input
          type="text"
          id="nama_lengkap"
          name="nama_lengkap"
          value={formData.nama_lengkap || ""}
          onChange={handleInputChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="username" className={labelClass}>
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username || ""}
          onChange={handleInputChange}
          className={inputClass}
          required
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
          value={formData.email || ""}
          onChange={handleInputChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password {initialData ? "(Kosongkan jika tidak ingin mengubah)" : ""}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password || ""}
          onChange={handleInputChange}
          className={inputClass}
          required={!initialData} // Password hanya required saat create user baru
        />
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role || ""}
          onChange={handleInputChange}
          className={inputClass}
          required
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || ""}
          onChange={handleInputChange}
          className={inputClass}
          required
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Tidak Aktif</option>
        </select>
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
          className={inputClass}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md ${
            theme === "dark"
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
        </button>
      </div>
    </form>
  );
};
