// frontend/src/components/layout/Header.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

interface HeaderProps {
  onMenuClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function Header({
  onMenuClick,
  showBackButton = false,
  onBackClick,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  /** Map peran user ke label */
  const getUserRoleDisplay = (): string => {
    if (!user?.role) return "";
    const roleMap: Record<string, string> = {
      "super-admin": "Super Admin",
      admin: "Administrator",
      staff: "Staff",
    };
    return roleMap[user.role] || user.role;
  };

  /** Update judul berdasarkan URL */
  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const formattedTitle = lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setPageTitle(formattedTitle);
    } else {
      setPageTitle("Dashboard");
    }
  }, [location]);

  /** Klik luar untuk menutup menu user */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  /** Event handler */
  const handleLogout = () => logout();
  const handleProfileClick = () => {
    navigate("/profile");
    setShowUserMenu(false);
  };

  const profileImgSrc =
    user?.foto_profil && user.foto_profil.startsWith("http")
      ? user.foto_profil
      : user?.foto_profil
      ? `${api.defaults.baseURL || ""}${user.foto_profil}`
      : "";

  return (
    <header
      className={`sticky top-0 z-50 p-3 sm:p-4 flex justify-between items-center border-b shadow-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-blue-800 to-blue-700 border-blue-600"
      } backdrop-blur-sm bg-opacity-90`}
    >
      {/* Kiri: Judul halaman dan tombol menu */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-3 p-2 rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <FaBars className="text-xl" />
        </button>

        {showBackButton && (
          <button
            onClick={onBackClick}
            className="mr-3 p-2 rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <FaChevronLeft className="text-xl" />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {pageTitle}
          </h1>
          <span className="text-xs text-blue-200 truncate">
            Sistem Manajemen E-Aset
          </span>
        </div>
      </div>

      {/* Kanan: Tema & User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Toggle Tema */}
        <button
          onClick={toggleTheme}
          className={`p-2 sm:p-3 rounded-xl backdrop-blur-sm border transition-all hover:scale-110 active:scale-95 ${
            theme === "dark"
              ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30"
              : "bg-blue-500/20 border-blue-400/30 text-blue-100 hover:bg-blue-500/30"
          }`}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center space-x-2 sm:space-x-3 rounded-xl border p-1 sm:p-2 transition-all hover:scale-105 active:scale-95 ${
              theme === "dark"
                ? "bg-white/10 border-gray-600 hover:bg-white/20"
                : "bg-white/10 border-blue-400/20 hover:bg-white/20"
            }`}
          >
            {profileImgSrc ? (
              <img
                src={profileImgSrc}
                alt="Avatar"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "https://ui-avatars.com/api/?name=User")
                }
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <FaUserCircle
                className={`text-xl sm:text-2xl ${
                  theme === "dark" ? "text-gray-300" : "text-blue-100"
                }`}
              />
            )}

            <div className="hidden sm:block text-left">
              <span className="text-white font-medium truncate max-w-[100px] block">
                {user?.nama_lengkap || "User"}
              </span>
              <span className="text-xs text-blue-200 truncate max-w-[100px] block">
                {getUserRoleDisplay()}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 border transform origin-top-right transition-all duration-200 ${
              showUserMenu
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            } ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-blue-200"
            }`}
          >
            <div
              className={`px-4 py-3 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <p
                className={`text-sm font-semibold truncate ${
                  theme === "dark" ? "text-white" : "text-blue-900"
                }`}
              >
                {user?.nama_lengkap || "Administrator"}
              </p>
              <p
                className={`text-xs truncate ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user?.email || "email@example.com"}
              </p>
              <span
                className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {getUserRoleDisplay()}
              </span>
            </div>

            <button
              onClick={handleProfileClick}
              className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
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

            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 text-sm text-left border-t transition-colors ${
                theme === "dark"
                  ? "text-red-400 hover:bg-gray-700 border-gray-700"
                  : "text-red-600 hover:bg-red-50 border-gray-100"
              }`}
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
