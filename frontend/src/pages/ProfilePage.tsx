// frontend/src/pages/ProfilePage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  UpdateProfileForm,
  UpdateProfileData,
} from "../components/forms/UpdateProfileForm";
import { ChangePasswordForm } from "../components/forms/ChangePasswordForm";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User } from "../types/User";

export type ChangePasswordData = {
  password_lama: string;
  password_baru: string;
};

export function ProfilePage() {
  const { theme } = useTheme();
  const { user, login } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleProfileUpdate = async (data: UpdateProfileData | FormData) => {
    setProfileLoading(true);
    try {
      let response;

      if (data instanceof FormData) {
        // Handle FormData case (if needed in the future)
        response = await api.patch("/auth/profile", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Handle UpdateProfileData case
        // Buat payload baru tanpa properti yang tidak diperlukan
        const payload: Partial<UpdateProfileData> = {
          nama_lengkap: data.nama_lengkap,
          email: data.email,
        };

        // Tambahkan properti opsional jika ada
        if (data.nomor_telepon !== undefined) {
          payload.nomor_telepon = data.nomor_telepon;
        }

        if (data.foto_profil !== undefined) {
          payload.foto_profil = data.foto_profil;
        }

        response = await api.patch("/auth/profile", payload);
      }

      const updatedUser = response.data as User;

      const token = localStorage.getItem("access_token");
      if (token) await login(token, updatedUser);

      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      console.error("Gagal update profil:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Gagal memperbarui profil.";
        toast.error(errorMessage);
        console.error("Detail error:", error.response.data);
      } else if (error.request) {
        toast.error("Tidak dapat terhubung ke server.");
      } else {
        toast.error("Terjadi kesalahan: " + error.message);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setPasswordLoading(true);
    try {
      const response = await api.post("/auth/profile/change-password", data);
      toast.success(response.data.message || "Password berhasil diubah!");
    } catch (error: any) {
      console.error("Gagal ganti password:", error);
      toast.error(error.response?.data?.message || "Gagal mengganti password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await api.delete("/auth/sessions/others");
      toast.success(
        response.data.message || "Semua session lain berhasil dihapus"
      );

      // Refresh user data to update session info
      const token = localStorage.getItem("access_token");
      if (token && user) {
        await login(token, user);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus session lain"
      );
    } finally {
      setSessionLoading(false);
    }
  };

  if (!user) {
    return <div>Memuat data pengguna...</div>;
  }

  return (
    <div className="p-6">
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
      <h1
        className={`text-3xl font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        Edit Profil
      </h1>

      {/* Session Management */}
      {user.sessionInfo && user.sessionInfo.sessionCount > 1 && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            theme === "dark"
              ? "bg-yellow-900/30 border border-yellow-800"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-medium ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-800"
                }`}
              >
                Multiple Session Terdeteksi
              </h3>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                Anda memiliki {user.sessionInfo.sessionCount} session aktif.
                Hapus session lain untuk keamanan.
              </p>
            </div>
            <button
              onClick={handleLogoutOtherSessions}
              disabled={sessionLoading}
              className={`px-4 py-2 rounded-md flex items-center ${
                theme === "dark"
                  ? "bg-yellow-700 hover:bg-yellow-600 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              } ${sessionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {sessionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                "Hapus Session Lain"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Informasi Profil */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-700"
            }`}
          >
            Informasi Profil
          </h2>
          <UpdateProfileForm
            initialData={user}
            onSubmit={handleProfileUpdate}
            isSubmitting={profileLoading}
          />
        </div>

        {/* Kolom Ganti Password */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-700"
            }`}
          >
            Ganti Password
          </h2>
          <ChangePasswordForm
            onSubmit={handleChangePassword}
            isSubmitting={passwordLoading}
          />
        </div>
      </div>
    </div>
  );
}
