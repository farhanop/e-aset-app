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
          className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20 animate-float ${
            theme === "dark" ? "bg-blue-400" : "bg-blue-300"
          }`}
        ></div>
        <div
          className={`absolute top-1/3 right-1/4 w-24 h-24 rounded-full opacity-30 animate-float-delayed ${
            theme === "dark" ? "bg-indigo-400" : "bg-indigo-300"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full opacity-25 animate-float-slow ${
            theme === "dark" ? "bg-sky-300" : "bg-sky-300"
          }`}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5 bg-grid-pattern"></div>
      </div>

      {/* Dark Mode Toggle dengan efek 3D */}
      <button
        onClick={toggleTheme}
        className={`absolute top-8 right-8 z-50 w-14 h-14 rounded-2xl backdrop-blur-lg border-2 shadow-2xl transition-all duration-500 hover:scale-110 hover:rotate-12 ${
          theme === "dark"
            ? "bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30 shadow-blue-500/25"
            : "bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30 shadow-blue-500/25"
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {theme === "dark" ? (
            <FaSun className="text-xl animate-pulse" />
          ) : (
            <FaMoon className="text-xl animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl"></div>
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

          {/* Floating Particles */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-indigo-400 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-sky-400 rounded-full animate-ping animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full">
          {/* Enhanced Logo Container dengan efek 3D */}
          <div className="relative mb-8 group">
            <div
              className={`absolute -inset-4 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-500 ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-400"
              }`}
            ></div>

            <div
              className={`relative p-6 rounded-2xl backdrop-blur-lg border-2 shadow-2xl transform group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-600/50 shadow-blue-500/25"
                  : "bg-white/10 border-white/20 shadow-blue-500/25"
              }`}
            >
              <img
                src={uigmLogo}
                alt="UIGM Logo"
                className="w-36 h-36 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                style={{
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
                }}
              />

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Enhanced Text dengan efek 3D */}
          <div className="space-y-4 transform perspective-1000">
            <h1
              className="text-5xl font-black text-white mb-2 transform hover:scale-105 transition-transform duration-300"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              UNIVERSITAS
            </h1>
            <h2
              className="text-4xl font-black text-blue-400 mb-4 transform hover:scale-105 transition-transform duration-300"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}
            >
              IGM
            </h2>
            <div
              className={`p-4 rounded-2xl backdrop-blur-sm border transform hover:scale-102 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600/30"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                E-Aset System
              </h3>
              <p
                className={`text-lg leading-relaxed ${
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

          {/* Feature Icons - E-Aset System Themed */}
          <div className="flex space-x-6 mt-8">
            <div
              className={`p-3 rounded-xl backdrop-blur-sm border transform hover:scale-110 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-blue-400"
                  : "bg-white/10 border-white/20 text-blue-300"
              }`}
            >
              <FaBuilding className="text-2xl" />
            </div>
            <div
              className={`p-3 rounded-xl backdrop-blur-sm border transform hover:scale-110 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-indigo-400"
                  : "bg-white/10 border-white/20 text-indigo-300"
              }`}
            >
              <FaDatabase className="text-2xl" />
            </div>
            <div
              className={`p-3 rounded-xl backdrop-blur-sm border transform hover:scale-110 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 text-sky-400"
                  : "bg-white/10 border-white/20 text-sky-300"
              }`}
            >
              <FaChartLine className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form dengan efek 3D */}
      <div
        className={`w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-16 transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800/80 to-blue-900/80"
            : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
        }`}
      >
        <div className="w-full max-w-2xl">
          {/* Mobile Header Enhanced */}
          <div className="lg:hidden text-center mb-12">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div
                className={`p-4 rounded-2xl backdrop-blur-lg border-2 shadow-xl ${
                  theme === "dark"
                    ? "bg-gray-800/80 border-gray-600"
                    : "bg-white/10 border-white/20"
                }`}
              >
                <img
                  src={uigmLogo}
                  alt="UIGM Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1
                  className={`text-2xl font-black transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-blue-900"
                  }`}
                >
                  UNIVERSITAS IGM
                </h1>
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  E-Aset System
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Login Form Container dengan efek 3D */}
          <div
            className={`relative rounded-3xl p-12 border-2 shadow-2xl backdrop-blur-lg transform hover:scale-102 transition-all duration-500 ${
              theme === "dark"
                ? "bg-gray-800/90 border-gray-600/50 shadow-blue-500/20"
                : "bg-white/95 border-white/30 shadow-blue-500/20"
            }`}
          >
            {/* 3D Border Effect */}
            <div
              className={`absolute -inset-2 rounded-3xl blur-xl opacity-30 ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-400"
              }`}
            ></div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3
                  className={`text-4xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
                    theme === "dark"
                      ? "from-blue-400 to-indigo-400"
                      : "from-blue-600 to-indigo-600"
                  }`}
                >
                  Selamat Datang
                </h3>
                <p
                  className={`text-xl font-medium transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Silakan masuk ke E-Aset System
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-10">
                <div className="space-y-8">
                  {/* Enhanced Username Field */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <FaUser
                          className={`text-2xl transition-colors duration-300 ${
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => onUsernameChange(e.target.value)}
                        required
                        className={`w-full pl-16 pr-6 py-6 border-2 rounded-2xl text-xl focus:outline-none focus:ring-4 transition-all duration-300 transform group-hover:scale-102 ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-400"
                            : "bg-white border-blue-200 text-gray-800 placeholder-blue-400 focus:ring-blue-500 focus:border-blue-300"
                        }`}
                        placeholder="Nama Pengguna"
                        style={{
                          transformStyle: "preserve-3d",
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Password Field */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <FaLock
                          className={`text-2xl transition-colors duration-300 ${
                            theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                          }`}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        required
                        className={`w-full pl-16 pr-16 py-6 border-2 rounded-2xl text-xl focus:outline-none focus:ring-4 transition-all duration-300 transform group-hover:scale-102 ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-400"
                            : "bg-white border-indigo-200 text-gray-800 placeholder-indigo-400 focus:ring-indigo-500 focus:border-indigo-300"
                        }`}
                        placeholder="Kata Sandi"
                        style={{
                          transformStyle: "preserve-3d",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 pr-5 flex items-center transition-all duration-300 hover:scale-110 ${
                          theme === "dark"
                            ? "text-indigo-400 hover:text-indigo-300"
                            : "text-indigo-600 hover:text-indigo-800"
                        }`}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="text-2xl" />
                        ) : (
                          <FaEye className="text-2xl" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <div
                      className={`relative w-7 h-7 rounded border-2 transition-all duration-300 group-hover:scale-110 ${
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
                      className={`ml-3 text-lg font-medium transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Ingat saya
                    </span>
                  </label>
                  <a
                    href="#"
                    className={`text-lg font-semibold transition-all duration-300 hover:scale-105 ${
                      theme === "dark"
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    Lupa password?
                  </a>
                </div>

                {/* Enhanced Submit Button dengan efek 3D */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-6 px-8 rounded-2xl font-black text-xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center relative overflow-hidden group ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-800 focus:ring-blue-500 focus:ring-offset-gray-800"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-800 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {/* Button Content */}
                  <div className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                        <span className="text-xl">Memproses...</span>
                      </div>
                    ) : (
                      <>
                        <FaTools className="mr-4 text-2xl transform group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xl transform group-hover:scale-105 transition-transform duration-300">
                          Masuk ke E-Aset
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {error && (
                  <div
                    className={`p-5 border-2 rounded-2xl backdrop-blur-sm transform transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-red-500/20 border-red-500/30"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p
                      className={`text-lg text-center font-medium transition-colors duration-300 ${
                        theme === "dark" ? "text-red-200" : "text-red-600"
                      }`}
                    >
                      {error}
                    </p>
                  </div>
                )}
              </form>

              <div
                className={`mt-12 text-center border-t pt-8 transition-colors duration-300 ${
                  theme === "dark" ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-base font-medium transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  © {new Date().getFullYear()} Universitas IGM
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