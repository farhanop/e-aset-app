// src/components/RolePermissionForm.tsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";
import { FaCheck, FaSave, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

interface Permission {
  id_permission: number;
  nama_permission: string;
  deskripsi_fitur: string;
}

interface RolePermissionFormProps {
  roleId: number;
  roleName: string;
  onSave: () => void;
  onCancel: () => void;
}

export function RolePermissionForm({
  roleId,
  roleName,
  onSave,
  onCancel,
}: RolePermissionFormProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  // Fetch data permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Ambil semua izin yang tersedia & izin yang dimiliki peran ini secara bersamaan
        const [allPermsRes, rolePermsRes] = await Promise.all([
          api.get<Permission[]>("/roles/permissions"),
          api.get<Permission[]>(`/roles/${roleId}/permissions`),
        ]);

        setAllPermissions(allPermsRes.data);
        // Simpan ID izin yang dimiliki peran
        setSelectedPermissions(rolePermsRes.data.map(p => p.id_permission));
      } catch (err) {
        console.error("Gagal mengambil data izin:", err);
        setError("Gagal memuat data izin. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roleId]);

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(allPermissions.map(p => p.id_permission));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");
      
      await api.put(`/roles/${roleId}/permissions`, {
        permissionIds: selectedPermissions,
      });
      
      onSave(); // Beri tahu parent komponen bahwa penyimpanan berhasil
    } catch (err) {
      console.error("Gagal menyimpan izin:", err);
      setError("Gagal menyimpan perubahan izin. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
        <span className="ml-3">Memuat data izin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 rounded-lg ${
        theme === "dark" ? "bg-gray-700" : "bg-blue-50"
      }`}>
        <h3 className={`text-lg font-semibold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Mengelola Izin untuk Peran: <span className="text-blue-600">{roleName}</span>
        </h3>
        <p className={`text-sm mt-1 ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}>
          Pilih izin yang ingin diberikan kepada peran ini
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-3 rounded-lg flex items-center ${
          theme === "dark" ? "bg-red-900/30 text-red-200" : "bg-red-100 text-red-700"
        }`}>
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Select All Checkbox */}
      <div className={`p-3 rounded-lg border ${
        theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selectedPermissions.length === allPermissions.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={`ml-2 text-sm font-medium ${
            theme === "dark" ? "text-gray-200" : "text-gray-700"
          }`}>
            Pilih Semua Izin
          </span>
          <span className={`ml-2 text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            ({selectedPermissions.length} dari {allPermissions.length} izin dipilih)
          </span>
        </label>
      </div>

      {/* Permissions List */}
      <div className={`max-h-96 overflow-y-auto rounded-lg border ${
        theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        {allPermissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
              Tidak ada izin yang tersedia
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {allPermissions.map((permission) => (
              <div 
                key={permission.id_permission} 
                className={`p-4 hover:${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                } transition-colors`}
              >
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id_permission)}
                    onChange={(e) => handlePermissionChange(permission.id_permission, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {permission.nama_permission}
                      </span>
                      {selectedPermissions.includes(permission.id_permission) && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="mr-1" size={10} />
                          Dipilih
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {permission.deskripsi_fitur}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            theme === "dark"
              ? "text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              : "text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          }`}
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          }`}
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Menyimpan...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Simpan Izin
            </>
          )}
        </button>
      </div>
    </div>
  );
}