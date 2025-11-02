// frontend/src/pages/UsersPage.tsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { User } from "../types/User";
import { Modal } from "../components/Modal";
import { UserForm } from "../components/UserForm";
import { useTheme } from "../contexts/ThemeContext";

const TableSkeleton = () => (
  <div
    className={`p-6 rounded-lg shadow-md ${
      document.documentElement.classList.contains("dark")
        ? "bg-gray-800"
        : "bg-white"
    }`}
  >
    <Skeleton height={40} className="mb-4" />
    {Array(5)
      .fill(0)
      .map((_, index) => (
        <Skeleton key={index} height={35} className="mb-2" />
      ))}
  </div>
);

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  // State untuk mengelola modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Definisikan availableRoles sesuai dengan tipe yang sudah ditentukan
  const [availableRoles] = useState<Array<User["role"]>>([
    "super-admin",
    "admin",
    "staff",
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: User[]; total: number }>(
        "/users",
        {
          params: {
            page: 1,
            limit: 10,
          },
        }
      );

      setUsers(response.data.data || response.data);
      setError("");
    } catch (err: any) {
      console.error("Fetch users error:", err);

      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (err.response?.status === 400) {
        setError(
          `Permintaan tidak valid: ${
            err.response?.data?.message || "Periksa kembali permintaan Anda"
          }`
        );
      } else {
        setError("Gagal mengambil data pengguna. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membuka modal dalam mode 'Create'
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal dalam mode 'Edit'
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Fungsi yang dijalankan saat form di-submit
  const handleFormSubmit = async (data: Partial<User>) => {
    try {
      if (editingUser) {
        // Logika untuk UPDATE (PATCH)
        await api.patch(`/users/${editingUser.id_user}`, data);
      } else {
        // Logika untuk CREATE (POST)
        await api.post("/users", data);
      }
      handleCloseModal();
      fetchUsers(); // Refresh data tabel setelah berhasil
    } catch (err: any) {
      console.error("Submit form error:", err);

      let errorMessage = "Gagal menyimpan data.";

      if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).join(", ") ||
          "Data yang dikirim tidak valid.";
      } else if (err.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err: any) {
        console.error("Delete user error:", err);

        let errorMessage = "Gagal menghapus pengguna.";

        if (err.response?.status === 400) {
          errorMessage =
            err.response?.data?.message ||
            "Tidak dapat menghapus pengguna ini.";
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        }

        alert(errorMessage);
      }
    }
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan role
  const getRoleBadgeColor = (role: User["role"]) => {
    switch (role) {
      case "super-admin":
        return theme === "dark"
          ? "bg-purple-900 text-purple-200"
          : "bg-purple-100 text-purple-800";
      case "admin":
        return theme === "dark"
          ? "bg-blue-900 text-blue-200"
          : "bg-blue-100 text-blue-800";
      case "staff":
        return theme === "dark"
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800";
      default:
        return theme === "dark"
          ? "bg-gray-700 text-gray-200"
          : "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <TableSkeleton />;
  if (error)
    return (
      <div
        className={`text-center p-6 rounded-lg ${
          theme === "dark" ? "bg-red-900/20" : "bg-red-50"
        }`}
      >
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchUsers}
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
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Manajemen Pengguna
        </h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          + Tambah Pengguna
        </button>
      </div>

      <div
        className={`rounded-lg shadow-md overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nama Lengkap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {users.map((user) => (
              <tr
                key={user.id_user}
                className={`transition-colors ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.nama_lengkap}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {user.username}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "aktif"
                        ? theme === "dark"
                          ? "bg-green-900 text-green-200"
                          : "bg-green-100 text-green-800"
                        : theme === "dark"
                        ? "bg-red-900 text-red-200"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className={`mr-4 ${
                      theme === "dark"
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-900"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id_user)}
                    className={`${
                      theme === "dark"
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-600 hover:text-red-900"
                    }`}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal untuk Create dan Update */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      >
        <UserForm
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          availableRoles={availableRoles}
        />
      </Modal>
    </div>
  );
}
