import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChangePasswordData } from '../../pages/ProfilePage'; // Kita akan buat tipe ini di ProfilePage

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>; // Fungsi untuk submit
  isSubmitting: boolean; // Status loading dari parent
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password_baru !== formData.konfirmasi_password) {
      setError('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    if (formData.password_baru.length < 8) {
      setError('Password baru minimal harus 8 karakter.');
      return;
    }
    setError('');
    // Kirim hanya data yang dibutuhkan API
    onSubmit({
      password_lama: formData.password_lama,
      password_baru: formData.password_baru,
    });
  };
  
  const inputClass = `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    theme === "dark"
      ? "border-gray-600 bg-gray-700 text-white"
      : "border-gray-300 bg-white text-gray-900"
  }`;
  const labelClass = `block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="password_lama" className={labelClass}>Password Lama</label>
        <input type="password" id="password_lama" name="password_lama" value={formData.password_lama} onChange={handleChange} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password_baru" className={labelClass}>Password Baru</label>
        <input type="password" id="password_baru" name="password_baru" value={formData.password_baru} onChange={handleChange} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="konfirmasi_password" className={labelClass}>Konfirmasi Password Baru</label>
        <input type="password" id="konfirmasi_password" name="konfirmasi_password" value={formData.konfirmasi_password} onChange={handleChange} required className={inputClass} />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Mengganti...' : 'Ganti Password'}
        </button>
      </div>
    </form>
  );
};