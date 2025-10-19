// frontend/src/components/layout/Header.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaBars,
  FaChevronLeft
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function Header({ onMenuClick, showBackButton = false, onBackClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("Dashboard");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Fungsi untuk mendapatkan nama menu berdasarkan path
  const getMenuName = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/users":
        return "Manajemen Pengguna";
      case "/roles":
        return "Manajemen Peran";
      case "/master-data":
        return "Data Master";
      case "/assets":
        return "Manajemen Aset";
      case "/parameters":
        return "Manajemen Parameter";
      default:
        // Jika path tidak dikenali, cek apakah path dimulai dengan salah satu path di atas
        if (path.startsWith("/users")) return "Manajemen Pengguna";
        if (path.startsWith("/roles")) return "Manajemen Peran";
        if (path.startsWith("/master-data")) return "Data Master";
        if (path.startsWith("/assets")) return "Manajemen Aset";
        if (path.startsWith("/parameters")) return "Manajemen Parameter";
        return "Dashboard";
    }
  };

  // Update nama menu saat lokasi berubah
  useEffect(() => {
    setCurrentMenu(getMenuName(location.pathname));
  }, [location]);

  const handleLogout = () => {
    logout(); // hanya memanggil fungsi logout dari AuthContext
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`p-3 sm:p-4 flex justify-between items-center border-b shadow-2xl transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-blue-800 to-blue-700 border-blue-600"
      }`}
    >
      {/* Nama Menu Saat Ini */}
      <div className="flex items-center">
        {/* Tombol menu untuk mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden mr-3 p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
        >
          <FaBars className="text-xl" />
        </button>
        
        {/* Tombol kembali (jika diperlukan) */}
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="mr-3 p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
          >
            <FaChevronLeft className="text-xl" />
          </button>
        )}
        
        <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
          {currentMenu}
        </h1>
      </div>

      {/* Bagian kanan */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 sm:p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
            theme === "dark"
              ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30"
              : "bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30"
          }`}
        >
          {theme === "dark" ? (
            <FaSun className="text-lg" />
          ) : (
            <FaMoon className="text-lg" />
          )}
        </button>

        {/* Menu User */}
        <div className="relative" ref={userMenuRef}>
          <button
            className={`flex items-center space-x-2 sm:space-x-3 rounded-xl backdrop-blur-sm border p-1 sm:p-2 transition-all duration-300 hover:scale-105 focus:outline-none ${
              theme === "dark"
                ? "bg-white/10 border-gray-600 hover:bg-white/20"
                : "bg-white/10 border-blue-400/20 hover:bg-white/20"
            }`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FaUserCircle
              className={`text-xl sm:text-2xl ${
                theme === "dark" ? "text-gray-300" : "text-blue-100"
              }`}
            />
            <span className="hidden sm:inline text-white font-medium truncate max-w-[100px]">
              {user ? user.nama_lengkap : "User"}
            </span>
          </button>

          {showUserMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-10 border transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-blue-200"
              }`}
            >
              {/* Header User */}
              <div
                className={`px-4 py-2 border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <p
                  className={`text-sm font-semibold truncate ${
                    theme === "dark" ? "text-white" : "text-blue-900"
                  }`}
                >
                  {user ? user.nama_lengkap : "Administrator"}
                </p>
                <p
                  className={`text-xs truncate ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user ? user.email : "email@example.com"}
                </p>
              </div>

              {/* Menu Profil */}
              <button
                className={`flex items-center w-full px-4 py-3 text-sm text-left ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <FaUserCircle
                  className={`mr-3 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                Profile
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 text-sm text-left border-t ${
                  theme === "dark"
                    ? "text-red-400 hover:bg-gray-700 border-gray-700"
                    : "text-red-600 hover:bg-red-50 border-gray-100"
                }`}
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}