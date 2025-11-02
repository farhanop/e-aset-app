// src/components/Login.tsx
import React from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSun,
  FaMoon,
  FaDatabase,
  FaBuilding,
  FaChartLine,
  FaTools,
} from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

// Import logo UIGM - untuk file di folder public, gunakan path relatif dari root
const uigmLogo = "/uigm.png";

// Definisikan interface untuk props
interface LoginFormProps {
  username: string;
  password: string;
  error: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Gunakan interface dalam deklarasi komponen
export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`h-screen w-screen flex transition-all duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"
          : "bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Shapes - E-Aset System Themed */}
        <div
          className={`absolute top-1/4 left-1/4 w-20 h-20 rounded-full opacity-20 animate-float ${
            theme === "dark" ? "bg-blue-400" : "bg-blue-300"
          }`}
        ></div>
        <div
          className={`absolute top-1/3 right-1/4 w-16 h-16 rounded-full opacity-30 animate-float-delayed ${
            theme === "dark" ? "bg-indigo-400" : "bg-indigo-300"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/3 w-12 h-12 rounded-full opacity-25 animate-float-slow ${
            theme === "dark" ? "bg-sky-300" : "bg-sky-300"
          }`}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5 bg-grid-pattern"></div>
      </div>

      {/* Dark Mode Toggle dengan efek 3D - Diperkecil */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 z-50 w-10 h-10 rounded-xl backdrop-blur-lg border shadow-lg transition-all duration-300 hover:scale-105 ${
          theme === "dark"
            ? "bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30"
            : "bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30"
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {theme === "dark" ? (
            <FaSun className="text-sm" />
          ) : (
            <FaMoon className="text-sm" />
          )}
        </div>
      </button>

      {/* Left Side - Enhanced Brand Area */}
      <div
        className={`hidden lg:flex lg:w-2/5 relative overflow-hidden transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"
            : "bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800"
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              theme === "dark"
                ? "from-blue-900/30 via-indigo-900/20 to-gray-900"
                : "from-blue-600/20 via-indigo-600/15 to-indigo-900"
            }`}
          ></div>

          {/* Floating Particles - Diperkecil */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-16 right-16 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute bottom-16 left-16 w-1 h-1 bg-sky-400 rounded-full animate-ping animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-8 w-full">
          {/* Enhanced Logo Container dengan efek 3D - Diperkecil */}
          <div className="relative mb-6 group">
            <div
              className={`absolute -inset-2 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all duration-500 ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-400"
              }`}
            ></div>

            <div
              className={`relative p-4 rounded-xl backdrop-blur-lg border shadow-lg transform group-hover:scale-105 transition-all duration-500 ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-600/50"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <img
                src={uigmLogo}
                alt="UIGM Logo"
                className="w-24 h-24 object-contain transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Enhanced Text dengan efek 3D - Diperkecil */}
          <div className="space-y-3">
            <h1
              className="text-3xl font-black text-white mb-1 transform hover:scale-105 transition-transform duration-300"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              UNIVERSITAS
            </h1>
            <h2
              className="text-2xl font-black text-blue-400 mb-3 transform hover:scale-105 transition-transform duration-300"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}
            >
              Indo Global Mandiri
            </h2>
            <div
              className={`p-3 rounded-xl backdrop-blur-sm border transform hover:scale-102 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600/30"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <h3 className="text-lg font-bold text-white mb-1">
                E-Aset System
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-blue-100"
                }`}
              >
                Sistem Manajemen Aset Digital Terintegrasi
                <br />
                <span className="text-blue-300 font-semibold">
                  Untuk Efisiensi Institusi
                </span>
              </p>
            </div>
          </div>

          {/* Feature Icons - E-Aset System Themed - Diperkecil */}
          <div className="flex space-x-4 mt-6">
            <div
              className={`p-2 rounded-lg backdrop-blur-sm border transform hover:scale-105 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-blue-400"
                  : "bg-white/10 border-white/20 text-blue-300"
              }`}
            >
              <FaBuilding className="text-lg" />
            </div>
            <div
              className={`p-2 rounded-lg backdrop-blur-sm border transform hover:scale-105 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-indigo-400"
                  : "bg-white/10 border-white/20 text-indigo-300"
              }`}
            >
              <FaDatabase className="text-lg" />
            </div>
            <div
              className={`p-2 rounded-lg backdrop-blur-sm border transform hover:scale-105 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-sky-400"
                  : "bg-white/10 border-white/20 text-sky-300"
              }`}
            >
              <FaChartLine className="text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form dengan efek 3D */}
      <div
        className={`w-full lg:w-3/5 flex items-center justify-center p-4 lg:p-8 transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800/80 to-blue-900/80"
            : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile Header Enhanced - Diperkecil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div
                className={`p-3 rounded-xl backdrop-blur-lg border shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800/80 border-gray-600"
                    : "bg-white/10 border-white/20"
                }`}
              >
                <img
                  src={uigmLogo}
                  alt="UIGM Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1
                  className={`text-xl font-black transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-blue-900"
                  }`}
                >
                  UNIVERSITAS IGM
                </h1>
                <p
                  className={`text-base font-semibold transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  E-Aset System
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Login Form Container dengan efek 3D - Diperkecil */}
          <div
            className={`relative rounded-2xl p-6 border shadow-xl backdrop-blur-lg transition-all duration-500 ${
              theme === "dark"
                ? "bg-gray-800/90 border-gray-600/50"
                : "bg-white/95 border-white/30"
            }`}
          >
            {/* 3D Border Effect */}
            <div
              className={`absolute -inset-1 rounded-2xl blur opacity-30 ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-400"
              }`}
            ></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3
                  className={`text-2xl font-black mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                    theme === "dark"
                      ? "from-blue-400 to-indigo-400"
                      : "from-blue-600 to-indigo-600"
                  }`}
                >
                  Selamat Datang
                </h3>
                <p
                  className={`text-base transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Silakan masuk ke E-Aset System
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Enhanced Username Field - Diperkecil */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser
                          className={`text-lg transition-colors duration-300 ${
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => onUsernameChange(e.target.value)}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-400"
                            : "bg-white border-blue-200 text-gray-800 placeholder-blue-400 focus:ring-blue-500 focus:border-blue-300"
                        }`}
                        placeholder="Nama Pengguna"
                      />
                    </div>
                  </div>

                  {/* Enhanced Password Field - Diperkecil */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock
                          className={`text-lg transition-colors duration-300 ${
                            theme === "dark"
                              ? "text-indigo-400"
                              : "text-indigo-600"
                          }`}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        required
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-400"
                            : "bg-white border-indigo-200 text-gray-800 placeholder-indigo-400 focus:ring-indigo-500 focus:border-indigo-300"
                        }`}
                        placeholder="Kata Sandi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 hover:scale-110 ${
                          theme === "dark"
                            ? "text-indigo-400 hover:text-indigo-300"
                            : "text-indigo-600 hover:text-indigo-800"
                        }`}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="text-lg" />
                        ) : (
                          <FaEye className="text-lg" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <div
                      className={`relative w-5 h-5 rounded border transition-all duration-300 group-hover:scale-105 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 group-hover:border-blue-400"
                          : "bg-white border-blue-300 group-hover:border-blue-500"
                      }`}
                    >
                      <div
                        className={`absolute inset-0.5 rounded bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      ></div>
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Ingat saya
                    </span>
                  </label>
                  <a
                    href="#"
                    className={`text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    Lupa password?
                  </a>
                </div>

                {/* Enhanced Submit Button dengan efek 3D - Diperkecil */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3 px-6 rounded-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center relative overflow-hidden group ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-800 focus:ring-blue-500 focus:ring-offset-gray-800"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-800 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {/* Button Content */}
                  <div className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        <span className="text-sm">Memproses...</span>
                      </div>
                    ) : (
                      <>
                        <FaTools className="mr-2 text-lg" />
                        <span className="text-base">Login</span>
                      </>
                    )}
                  </div>
                </button>

                {error && (
                  <div
                    className={`p-3 border rounded-xl backdrop-blur-sm transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-red-500/20 border-red-500/30"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p
                      className={`text-sm text-center font-medium transition-colors duration-300 ${
                        theme === "dark" ? "text-red-200" : "text-red-600"
                      }`}
                    >
                      {error}
                    </p>
                  </div>
                )}
              </form>

              <div
                className={`mt-8 text-center border-t pt-6 transition-colors duration-300 ${
                  theme === "dark" ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-xs transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  © BPT. {new Date().getFullYear()} Universitas IGM
                  <br />
                  <span
                    className={`${
                      theme === "dark" ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    E-Aset System - Manajemen Aset Digital
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
