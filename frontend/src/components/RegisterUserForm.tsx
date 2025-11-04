import { useState } from "react";
import React from "react";
import api from "../api/axios"; // Mengganti axios dengan api yang sudah dikonfigurasi
import axios from "axios"; // Import axios asli untuk isAxiosError
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaIdCard,
  FaSave,
  FaTimes,
  FaCheck,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

export function RegisterUserForm() {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama lengkap wajib diisi";
    } else if (formData.nama_lengkap.length < 3) {
      newErrors.nama_lengkap = "Nama lengkap minimal 3 karakter";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Menggunakan api yang sudah dikonfigurasi dengan interceptor
      const response = await api.post("/users", formData);

      setMessage(
        `✅ Sukses! Pengguna "${response.data.nama_lengkap}" berhasil dibuat.`
      );
      setFormData({
        nama_lengkap: "",
        username: "",
        email: "",
        password: "",
      });
      setErrors({});
    } catch (error) {
      // Perbaikan: Gunakan isAxiosError dari axios asli, bukan dari instance
      if (axios.isAxiosError(error)) {
        setMessage(
          `❌ Error: ${
            error.response?.data?.message || "Terjadi kesalahan pada server."
          }`
        );
      } else if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("❌ Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_lengkap: "",
      username: "",
      email: "",
      password: "",
    });
    setErrors({});
    setMessage("");
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-8 rounded-3xl shadow-2xl backdrop-blur-sm border-2 transition-all duration-500 ${
        theme === "dark"
          ? "bg-gray-800/80 border-gray-600/50"
          : "bg-white border-blue-100"
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            theme === "dark"
              ? "bg-blue-600/20 border border-blue-500/30"
              : "bg-blue-100 border border-blue-200"
          }`}
        >
          <FaUser
            className={`text-2xl ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          />
        </div>
        <h2
          className={`text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
            theme === "dark"
              ? "from-blue-400 to-purple-400"
              : "from-blue-600 to-purple-600"
          }`}
        >
          Registrasi Pengguna Baru
        </h2>
        <p
          className={`mt-2 transition-colors duration-300 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Tambahkan pengguna baru ke sistem E-Aset
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Lengkap Field */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
          <div className="relative">
            <label
              className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <FaIdCard className="inline mr-2" />
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaIdCard
                  className={`text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                  errors.nama_lengkap
                    ? "border-red-500 focus:ring-red-500/20"
                    : theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-400"
                    : "bg-white border-blue-200 text-gray-800 placeholder-blue-400 focus:ring-blue-500/20 focus:border-blue-300"
                }`}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            {errors.nama_lengkap && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <FaTimes className="mr-1" />
                {errors.nama_lengkap}
              </p>
            )}
          </div>
        </div>

        {/* Username Field */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
          <div className="relative">
            <label
              className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <FaUser className="inline mr-2" />
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser
                  className={`text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500/20"
                    : theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500/20 focus:border-purple-400"
                    : "bg-white border-purple-200 text-gray-800 placeholder-purple-400 focus:ring-purple-500/20 focus:border-purple-300"
                }`}
                placeholder="Masukkan username"
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <FaTimes className="mr-1" />
                {errors.username}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
          <div className="relative">
            <label
              className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope
                  className={`text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500/20"
                    : theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500/20 focus:border-green-400"
                    : "bg-white border-green-200 text-gray-800 placeholder-green-400 focus:ring-green-500/20 focus:border-green-300"
                }`}
                placeholder="Masukkan email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <FaTimes className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
          <div className="relative">
            <label
              className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <FaKey className="inline mr-2" />
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaKey
                  className={`text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500/20"
                    : theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500/20 focus:border-yellow-400"
                    : "bg-white border-yellow-200 text-gray-800 placeholder-yellow-400 focus:ring-yellow-500/20 focus:border-yellow-300"
                }`}
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 hover:scale-110 ${
                  theme === "dark"
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-yellow-600 hover:text-yellow-800"
                }`}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-xl" />
                ) : (
                  <FaEye className="text-xl" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <FaTimes className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={resetForm}
            className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-lg border-2 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaTimes className="inline mr-2" />
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-lg text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Memproses...
              </div>
            ) : (
              <>
                <FaSave className="inline mr-2" />
                Daftarkan Pengguna
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${
              message.includes("✅")
                ? theme === "dark"
                  ? "bg-green-500/20 border-green-500/30"
                  : "bg-green-50 border-green-200"
                : theme === "dark"
                ? "bg-red-500/20 border-red-500/30"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-center font-medium transition-colors duration-300 ${
                message.includes("✅")
                  ? theme === "dark"
                    ? "text-green-300"
                    : "text-green-700"
                  : theme === "dark"
                  ? "text-red-300"
                  : "text-red-700"
              }`}
            >
              {message.includes("✅") ? (
                <FaCheck className="inline mr-2" />
              ) : (
                <FaTimes className="inline mr-2" />
              )}
              {message.replace("✅", "").replace("❌", "")}
            </p>
          </div>
        )}
      </form>

      {/* Form Tips */}
      <div
        className={`mt-8 p-4 rounded-2xl border-2 transition-colors duration-300 ${
          theme === "dark"
            ? "bg-blue-500/10 border-blue-500/20"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <h4
          className={`font-semibold mb-2 flex items-center transition-colors duration-300 ${
            theme === "dark" ? "text-blue-300" : "text-blue-700"
          }`}
        >
          <FaCheck className="mr-2" />
          Tips Registrasi
        </h4>
        <ul
          className={`text-sm space-y-1 transition-colors duration-300 ${
            theme === "dark" ? "text-blue-200" : "text-blue-600"
          }`}
        >
          <li>• Nama lengkap minimal 3 karakter</li>
          <li>• Username harus unik dan minimal 3 karakter</li>
          <li>• Gunakan email yang valid dan aktif</li>
          <li>• Password minimal 6 karakter</li>
        </ul>
      </div>
    </div>
  );
}