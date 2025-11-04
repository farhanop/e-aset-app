import { useState, useEffect } from "react";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";

interface Permission {
  id_permission: number;
  nama_permission: string;
  deskripsi_fitur: string;
}

interface PermissionsFormProps {
  roleId: number;
  onSave: () => void;
  onCancel: () => void;
}

export function PermissionsForm({
  roleId,
  onSave,
  onCancel,
}: PermissionsFormProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ambil semua izin yang tersedia & izin yang dimiliki peran ini secara bersamaan
        const [allPermsRes, rolePermsRes] = await Promise.all([
          api.get<Permission[]>("/roles/permissions"),
          api.get<Permission[]>(`/roles/${roleId}/permissions`),
        ]);

        setAllPermissions(allPermsRes.data);
        // Simpan ID izin yang dimiliki peran ke dalam Set untuk pengecekan cepat
        setRolePermissions(
          new Set(rolePermsRes.data.map((p) => p.id_permission))
        );
      } catch (error) {
        console.error("Gagal mengambil data izin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId]);

  const handleCheckboxChange = (permissionId: number) => {
    setRolePermissions((prev) => {
      const newPermissions = new Set(prev);
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId);
      } else {
        newPermissions.add(permissionId);
      }
      return newPermissions;
    });
  };

  const handleSubmit = async () => {
    try {
      await api.put(`/roles/${roleId}/permissions`, {
        permissionIds: Array.from(rolePermissions),
      });
      onSave(); // Beri tahu parent komponen bahwa penyimpanan berhasil
    } catch (error) {
      alert("Gagal menyimpan perubahan izin.");
    }
  };

  if (loading) return <p>Memuat izin...</p>;

  return (
    <div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {allPermissions.map((permission) => (
          <div 
            key={permission.id_permission} 
            className={`flex items-center p-3 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <input
              id={`perm-${permission.id_permission}`}
              type="checkbox"
              checked={rolePermissions.has(permission.id_permission)}
              onChange={() => handleCheckboxChange(permission.id_permission)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor={`perm-${permission.id_permission}`}
              className={`ml-3 text-sm cursor-pointer ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <span className="font-medium block">{permission.nama_permission}</span>
              <p className={`text-xs mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                {permission.deskripsi_fitur}
              </p>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
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
          onClick={handleSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Simpan Izin
        </button>
      </div>
    </div>
  );
}