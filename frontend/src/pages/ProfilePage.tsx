// frontend/src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UpdateProfileForm, UpdateProfileData } from '../components/forms/UpdateProfileForm';
import { ChangePasswordForm } from '../components/forms/ChangePasswordForm';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ChangePasswordData = {
  password_lama: string;
  password_baru: string;
};

export function ProfilePage() {
  const { theme } = useTheme();
  const { user, login } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (data: UpdateProfileData | FormData) => {
    setProfileLoading(true);
    try {
      let response;
      
      // Cek apakah data adalah FormData (untuk upload file)
      if (data instanceof FormData) {
        // Untuk FormData, kita perlu mengatur header khusus
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        response = await api.patch('/auth/profile', data, config);
      } else {
        // Untuk data biasa (tanpa upload file)
        response = await api.patch('/auth/profile', data);
      }
      
      const updatedUser = response.data; // API mengembalikan data user baru

      // Update user di AuthContext
      const token = localStorage.getItem("access_token");
      if (token) {
        login(token, updatedUser); // Memperbarui state global
      }

      toast.success('Profil berhasil diperbarui!');
    } catch (error: any) {
      console.error("Gagal update profil:", error);
      
      // Tampilkan pesan error yang lebih detail
      if (error.response) {
        // Error dari server
        toast.error(error.response.data.message || 'Gagal memperbarui profil.');
      } else if (error.request) {
        // Request dibuat tapi tidak ada respons
        toast.error('Tidak dapat terhubung ke server.');
      } else {
        // Error lainnya
        toast.error('Terjadi kesalahan: ' + error.message);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setPasswordLoading(true);
    try {
      const response = await api.post('/auth/profile/change-password', data);
      toast.success(response.data.message || 'Password berhasil diubah!');
    } catch (error: any) {
      console.error("Gagal ganti password:", error);
      toast.error(error.response?.data?.message || 'Gagal mengganti password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div>Memuat data pengguna...</div>;
  }

  return (
    <div className="p-6">
      <ToastContainer theme={theme === 'dark' ? 'dark' : 'light'} />
      <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Edit Profil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Informasi Profil */}
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            Informasi Profil
          </h2>
          <UpdateProfileForm
            initialData={user}
            onSubmit={handleProfileUpdate}
            isSubmitting={profileLoading}
          />
        </div>

        {/* Kolom Ganti Password */}
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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