// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaDatabase,
  FaBox,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaAngleUp,
  FaUsers,
  FaChartBar,
  FaTimes,
  FaHistory,
  FaHandHolding, // Icon untuk peminjaman
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
  children?: MenuItem[];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (isCollapsed) {
      setIsSettingsOpen(false);
      setIsMasterDataOpen(false);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSettingsDropdown = () => {
    if (!isCollapsed) {
      setIsSettingsOpen(!isSettingsOpen);
    }
  };

  const toggleMasterDataDropdown = () => {
    if (!isCollapsed) {
      setIsMasterDataOpen(!isMasterDataOpen);
    }
  };

  // Menu items dengan role-based access - TAMBAHKAN MENU PEMINJAMAN DI SINI
  const menuItems: MenuItem[] = [
    {
      path: "/dashboard",
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      roles: ["super-admin", "admin", "staff"],
    },
    {
      path: "/peminjaman", // TAMBAH MENU PEMINJAMAN
      icon: <FaHandHolding />,
      label: "Peminjaman Aset",
      roles: ["super-admin", "admin", "staff"],
    },
    {
      path: "/master-data",
      icon: <FaDatabase />,
      label: "Data Master",
      roles: ["super-admin", "admin"],
    },
    {
      path: "/assets",
      icon: <FaBox />,
      label: "Manajemen Aset",
      roles: ["super-admin", "admin", "staff"],
    },
    {
      path: "/reports/laporan-berdasarkan-lokasi",
      icon: <FaChartBar />,
      label: "Laporan per Ruangan",
      roles: ["super-admin", "admin"],
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      path: "/users",
      icon: <FaUsers />,
      label: "Manajemen Pengguna",
      roles: ["super-admin"],
    },
    {
      path: "/asset-history",
      icon: <FaHistory />,
      label: "Riwayat Aset",
      roles: ["super-admin", "admin", "staff"],
    },
  ];

  // Filter menu items berdasarkan role user
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (!item.roles || item.roles.length === 0) return false;
        if (!user?.role) return false;
        return item.roles.includes(user.role);
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined,
      }));
  };

  const filteredMenuItems = filterMenuItems(menuItems);
  const filteredSettingsItems = filterMenuItems(settingsItems);

  // Fungsi untuk memeriksa apakah menu aktif
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Fungsi untuk merender menu item
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path);

    // Untuk menu dengan children (dropdown)
    if (hasChildren) {
      const isDropdownOpen =
        (item.path === "/master-data" && isMasterDataOpen) ||
        (item.path === "/settings" && isSettingsOpen);

      return (
        <div
          key={item.path}
          className={`
            group relative flex flex-col rounded-xl
            transition-all duration-300 ease-out
            ${
              isDropdownOpen || isItemActive
                ? theme === "dark"
                  ? "bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg shadow-gray-500/25 border-l-4 border-yellow-400"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 border-l-4 border-yellow-400"
                : theme === "dark"
                ? "bg-gray-800/30 hover:bg-gray-700/50 border-l-4 border-transparent hover:border-gray-400"
                : "bg-blue-800/30 hover:bg-blue-700/50 border-l-4 border-transparent hover:border-blue-400"
            }
            overflow-hidden
          `}
        >
          <div
            onClick={
              item.path === "/master-data"
                ? toggleMasterDataDropdown
                : toggleSettingsDropdown
            }
            className={`
              flex items-center p-3 my-1 cursor-pointer
              hover:scale-105 hover:shadow-xl
              transition-all duration-300 ease-out
              ${isCollapsed ? "pointer-events-none" : ""}
            `}
          >
            {(isDropdownOpen || isItemActive) && (
              <div
                className={`absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transition-colors duration-300 ${
                  theme === "dark" ? "from-white/5" : "from-white/10"
                }`}
              ></div>
            )}
            <span
              className={`
                text-lg transition-all duration-300
                ${
                  isDropdownOpen || isItemActive
                    ? "text-yellow-300"
                    : theme === "dark"
                    ? "text-gray-300"
                    : "text-blue-200"
                }
                group-hover:text-white
                ${isCollapsed ? "mx-auto" : ""}
              `}
            >
              {item.icon}
            </span>
            {!isCollapsed && (
              <>
                <span
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${
                      isDropdownOpen || isItemActive
                        ? "text-white"
                        : theme === "dark"
                        ? "text-gray-300"
                        : "text-blue-100"
                    }
                    group-hover:text-white
                  `}
                >
                  {item.label}
                </span>
                <span className="ml-auto transition-transform duration-300">
                  {isDropdownOpen ? <FaAngleUp /> : <FaAngleDown />}
                </span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {!isCollapsed && isDropdownOpen && item.children && (
            <div className={`pl-${level * 4 + 8} pr-2 pb-2 space-y-1`}>
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Untuk menu tanpa children (regular link)
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 768) {
            onClose();
          }
        }}
        className={`
          group relative flex items-center p-3 my-1 rounded-xl
          transition-all duration-300 ease-out overflow-hidden
          ${
            isItemActive
              ? theme === "dark"
                ? "bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg shadow-gray-500/25 border-l-4 border-yellow-400"
                : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 border-l-4 border-yellow-400"
              : theme === "dark"
              ? "bg-gray-800/30 hover:bg-gray-700/50 border-l-4 border-transparent hover:border-gray-400"
              : "bg-blue-800/30 hover:bg-blue-700/50 border-l-4 border-transparent hover:border-blue-400"
          }
          hover:scale-105 hover:shadow-xl
        `}
      >
        {isItemActive && (
          <div
            className={`absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transition-colors duration-300 ${
              theme === "dark" ? "from-white/5" : "from-white/10"
            }`}
          ></div>
        )}
        <span
          className={`
            text-lg transition-all duration-300
            ${
              isItemActive
                ? "text-yellow-300"
                : theme === "dark"
                ? "text-gray-300"
                : "text-blue-200"
            }
            group-hover:text-white
            ${isCollapsed ? "mx-auto" : ""}
          `}
        >
          {item.icon}
        </span>
        {!isCollapsed && (
          <span
            className={`
              ml-3 font-medium transition-all duration-300
              ${
                isItemActive
                  ? "text-white"
                  : theme === "dark"
                  ? "text-gray-300"
                  : "text-blue-100"
              }
              group-hover:text-white
            `}
          >
            {item.label}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar untuk desktop */}
      <div
        className={`hidden md:flex relative h-screen transition-all duration-500 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } z-30`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background */}
        <div
          className={`absolute inset-0 rounded-r-2xl shadow-2xl transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
              : "bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900"
          }`}
        ></div>

        {/* Layer untuk Depth */}
        <div
          className={`absolute inset-0 rounded-r-2xl transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-700/30 to-gray-600/20"
              : "bg-gradient-to-r from-blue-700/30 to-blue-600/20"
          }`}
        ></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div
            className={`p-4 border-b transition-colors duration-300 ${
              theme === "dark" ? "border-gray-700" : "border-blue-600/30"
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div
                className={`p-2 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-white/10 border-gray-600 hover:bg-white/20"
                    : "bg-white/10 border-blue-400/20 hover:bg-white/20"
                }`}
              >
                <img
                  src="/uigm.png"
                  alt="Universitas IGM"
                  className="w-8 h-8 object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="text-center">
                  <h2 className="text-lg font-bold text-white">UNIVERSITAS</h2>
                  <h3 className="text-md font-semibold text-yellow-400">IGM</h3>
                  <p
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-300" : "text-blue-200"
                    }`}
                  >
                    E-Aset System
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => renderMenuItem(item))}

            {filteredSettingsItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                {filteredSettingsItems.map((item) => renderMenuItem(item))}
              </div>
            )}
          </nav>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          onMouseEnter={() => setIsHovered(true)}
          className={`
            absolute top-1/2 -right-3 transform -translate-y-1/2
            z-20 w-8 h-16 rounded-lg
            flex items-center justify-center text-white
            transition-all duration-500 ease-out
            hover:scale-110 focus:outline-none
            group
            ${isCollapsed ? "rotate-0" : "rotate-180"}
          `}
        >
          <div
            className={`absolute inset-0 rounded-lg shadow-2xl transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gradient-to-b from-gray-700 to-gray-600"
                : "bg-gradient-to-b from-blue-700 to-blue-600"
            }`}
          ></div>
          <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-125">
            {isCollapsed ? (
              <FaChevronRight className="text-white text-sm" />
            ) : (
              <FaChevronLeft className="text-white text-sm" />
            )}
          </div>
          <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Animated Border Effect */}
        <div
          className={`
          absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-yellow-400 via-blue-400 to-purple-500
          transition-all duration-500 ease-out
          ${isHovered ? "opacity-100" : "opacity-60"}
        `}
        ></div>
      </div>

      {/* Sidebar untuk mobile - overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full z-50">
            <div className="relative h-full w-64">
              {/* Background */}
              <div
                className={`absolute inset-0 rounded-r-2xl shadow-2xl transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
                    : "bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900"
                }`}
              ></div>

              {/* Main Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Header dengan tombol close */}
                <div
                  className={`p-4 border-b transition-colors duration-300 flex justify-between items-center ${
                    theme === "dark" ? "border-gray-700" : "border-blue-600/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl backdrop-blur-sm border transition-colors duration-300 ${
                        theme === "dark"
                          ? "bg-white/10 border-gray-600"
                          : "bg-white/10 border-blue-400/20"
                      }`}
                    >
                      <img
                        src="/uigm.png"
                        alt="Universitas IGM"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-white">
                        UNIVERSITAS
                      </h2>
                      <h3 className="text-md font-semibold text-yellow-400">
                        IGM
                      </h3>
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-blue-200"
                        }`}
                      >
                        E-Aset System
                      </p>
                    </div>
                  </div>

                  {/* Tombol close untuk mobile */}
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-blue-200 hover:bg-blue-700"
                    }`}
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Navigation Menu (Mobile) */}
                <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
                  {filteredMenuItems.map((item) => renderMenuItem(item))}

                  {filteredSettingsItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      {filteredSettingsItems.map((item) =>
                        renderMenuItem(item)
                      )}
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
