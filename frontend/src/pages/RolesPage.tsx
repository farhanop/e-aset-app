// src/pages/RolesPage.tsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal } from "../components/Modal";
import { RolePermissionForm } from "../components/RolePermissionForm";
import { RoleForm } from "../components/RoleForm";
import { useTheme } from "../contexts/ThemeContext";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

interface Role {
  id_role: number;
  nama_role: string;
  deskripsi: string;
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  // State untuk mengelola modal
  const [modalType, setModalType] = useState<"create" | "edit" | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Role[]; total: number }>("/roles", {
        params: {
          page: 1,
          limit: 10
        }
      });
      
      setRoles(response.data.data || response.data);
    } catch (err: any) {
      console.error("Fetch roles error:", err);
      
      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (err.response?.status === 400) {
        setError(`Permintaan tidak valid: ${err.response?.data?.message || "Periksa kembali permintaan Anda"}`);
      } else {
        setError("Gagal mengambil data peran. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (role: Role) => {
    setSelectedRole(role);
    setModalType("edit");
  };

  const handleOpenCreateModal = () => {
    setModalType("create");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedRole(null);
  };

  const handleCreateRole = async (data: {
    nama_role: string;
    deskripsi: string;
  }) => {
    try {
      await api.post("/roles", data);
      handleCloseModal();
      fetchRoles();
    } catch (error: any) {
      console.error("Create role error:", error);
      
      let errorMessage = "Gagal membuat peran baru.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Data peran tidak valid.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus peran ini?")) {
      try {
        await api.delete(`/roles/${roleId}`);
        fetchRoles();
      } catch (error: any) {
        console.error("Delete role error:", error);
        
        let errorMessage = "Gagal menghapus peran.";
        
        if (error.response?.status === 400) {
          errorMessage = error.response?.data?.message || "Tidak dapat menghapus peran ini.";
        } else if (error.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        }
        
        alert(errorMessage);
      }
    }
  };

  if (loading) return <Skeleton height={40} count={5} />;
  if (error) return (
    <div className={`text-center p-6 rounded-lg ${
      theme === "dark" ? "bg-red-900/20" : "bg-red-50"
    }`}>
      <p className="text-red-500">{error}</p>
      <button 
        onClick={fetchRoles}
        className={`mt-4 px-4 py-2 rounded-md ${
          theme === "dark" 
            ? "bg-blue-600 hover:bg-blue-700" 
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Manajemen Peran & Izin
        </h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Tambah Peran Baru
        </button>
      </div>

      <div className={`rounded-lg shadow-md overflow-hidden ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nama Peran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            {roles.map((role) => (
              <tr 
                key={role.id_role}
                className={`transition-colors ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <td className={`px-6 py-4 font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {role.nama_role}
                </td>
                <td className={`px-6 py-4 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}>
                  {role.deskripsi || "-"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenEditModal(role)}
                    className={`mr-3 p-2 rounded-full inline-flex items-center justify-center ${
                      theme === "dark" 
                        ? "text-blue-400 hover:bg-blue-900/30" 
                        : "text-blue-600 hover:bg-blue-100"
                    }`}
                    title="Edit Izin"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id_role)}
                    className={`p-2 rounded-full inline-flex items-center justify-center ${
                      theme === "dark" 
                        ? "text-red-400 hover:bg-red-900/30" 
                        : "text-red-600 hover:bg-red-100"
                    }`}
                    title="Hapus Peran"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal untuk Membuat Peran Baru */}
      <Modal
        isOpen={modalType === "create"}
        onClose={handleCloseModal}
        title="Tambah Peran Baru"
      >
        <RoleForm onSubmit={handleCreateRole} onCancel={handleCloseModal} />
      </Modal>

      {/* Modal untuk Mengedit Izin */}
      {selectedRole && (
        <Modal
          isOpen={modalType === "edit"}
          onClose={handleCloseModal}
          title={`Edit Izin untuk Peran: ${selectedRole.nama_role}`}
        >
          <RolePermissionForm
            roleId={selectedRole.id_role}
            roleName={selectedRole.nama_role}
            onSave={() => {
              handleCloseModal();
              fetchRoles();
            }}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}