// frontend/src/pages/ProfilePage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  UpdateProfileForm,
  UpdateProfilePayload,
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

  // 🔧 PERBAIKAN UTAMA: handleProfileUpdate yang sudah diperbaiki
  const handleProfileUpdate = async (data: UpdateProfilePayload) => {
    setProfileLoading(true);

    console.log("=== 🔄 PROFILE UPDATE STARTED ===");
    console.log("📦 Form data received:", data);
    console.log("👤 Current user:", user);

    try {
      const formData = new FormData();

      // Append data teks
      formData.append("nama_lengkap", data.nama_lengkap);
      formData.append("email", data.email);
      if (data.nomor_telepon) {
        formData.append("nomor_telepon", data.nomor_telepon);
      } else {
        formData.append("nomor_telepon", ""); // Kirim string kosong jika null
      }

      // 🔧 PERBAIKAN: Handle file upload dengan benar
      if (data.foto_profil_file instanceof File) {
        formData.append("foto_profil_file", data.foto_profil_file);
        console.log("📁 File appended to FormData:", {
          name: data.foto_profil_file.name,
          type: data.foto_profil_file.type,
          size: data.foto_profil_file.size,
        });
      }

      // 🔧 PERBAIKAN: Handle photo removal
      if (data.foto_profil_remove) {
        formData.append("foto_profil_remove", "true");
        console.log("🗑️ Photo removal flag set");
      }

      // 🔧 DEBUG: Log FormData contents
      console.log("📦 FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`${key}:`, value);
        }
      }

      // 🔧 PERBAIKAN: Gunakan header yang tepat untuk FormData
      const response = await api.patch("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("✅ Server response:", response.data);

      const updatedUser = response.data as User;
      const token = localStorage.getItem("access_token");

      if (token && updatedUser) {
        await login(token, updatedUser);
        toast.success("Profil berhasil diperbarui!");
      } else {
        console.error("❌ Token or updated user missing");
        toast.error("Gagal memperbarui data sesi pengguna");
      }
    } catch (error: any) {
      console.error("❌ Update profile error:", error);

      // 🔧 PERBAIKAN: Error handling yang lebih detail
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || "Gagal memperbarui profil";

        console.error(`❌ Server error ${status}:`, error.response.data);

        switch (status) {
          case 400:
            if (message.includes("email") || message.includes("Email")) {
              toast.error("Format email tidak valid");
            } else if (message.includes("gambar")) {
              toast.error("Format file gambar tidak didukung");
            } else {
              toast.error(`Data tidak valid: ${message}`);
            }
            break;

          case 409:
            if (message.includes("Email sudah digunakan")) {
              // Cek apakah email sama dengan email saat ini
              if (user && data.email === user.email) {
                // Email tidak berubah, update data lain saja
                console.log("ℹ️ Email unchanged, updating other fields...");

                // Buat request tanpa mengubah email
                const formDataWithoutEmail = new FormData();
                formDataWithoutEmail.append("nama_lengkap", data.nama_lengkap);
                formDataWithoutEmail.append("email", user.email); // Gunakan email lama
                if (data.nomor_telepon) {
                  formDataWithoutEmail.append(
                    "nomor_telepon",
                    data.nomor_telepon
                  );
                }

                if (data.foto_profil_file instanceof File) {
                  formDataWithoutEmail.append(
                    "foto_profil_file",
                    data.foto_profil_file
                  );
                }
                if (data.foto_profil_remove) {
                  formDataWithoutEmail.append("foto_profil_remove", "true");
                }

                const retryResponse = await api.patch(
                  "/auth/profile",
                  formDataWithoutEmail,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  }
                );

                const retryUser = retryResponse.data as User;
                const token = localStorage.getItem("access_token");
                if (token) await login(token, retryUser);
                toast.success("Profil berhasil diperbarui!");
                return; // Keluar dari error flow
              } else {
                toast.error("Email sudah digunakan oleh pengguna lain");
              }
            } else {
              toast.error(message);
            }
            break;

          case 413:
            toast.error("File foto terlalu besar (maksimal 10MB)");
            break;

          case 415:
            toast.error(
              "Format file tidak didukung. Gunakan JPG, PNG, atau GIF"
            );
            break;

          default:
            toast.error(message || `Error ${status}: Gagal memperbarui profil`);
        }
      } else if (error.request) {
        console.error("❌ Network error:", error.request);
        toast.error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      } else {
        console.error("❌ Unexpected error:", error.message);
        toast.error("Terjadi kesalahan tidak terduga: " + error.message);
      }
    } finally {
      setProfileLoading(false);
      console.log("=== 🔄 PROFILE UPDATE COMPLETED ===");
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setPasswordLoading(true);
    try {
      console.log("🔑 Changing password...");
      const response = await api.post("/auth/profile/change-password", data);
      toast.success(response.data.message || "Password berhasil diubah!");
      console.log("✅ Password changed successfully");
    } catch (error: any) {
      console.error("❌ Change password error:", error);
      toast.error(error.response?.data?.message || "Gagal mengganti password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setSessionLoading(true);
    try {
      console.log("💨 Logging out other sessions...");
      const response = await api.delete("/auth/sessions/others");
      toast.success(
        response.data.message || "Semua session lain berhasil dihapus"
      );

      // Refresh user data untuk update session count
      const token = localStorage.getItem("access_token");
      if (token && user) {
        await login(token, user);
      }
      console.log("✅ Other sessions logged out");
    } catch (error: any) {
      console.error("❌ Logout other sessions error:", error);
      toast.error(
        error.response?.data?.message || "Gagal menghapus session lain"
      );
    } finally {
      setSessionLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        className={`p-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
      >
        Memuat data pengguna...
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer
        theme={theme === "dark" ? "dark" : "light"}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h1
        className={`text-3xl font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        Edit Profil
      </h1>

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
        {/* Informasi Profil */}
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

        {/* Ganti Password */}
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
