import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaDatabase,
  FaBox,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaAngleDown,
  FaAngleUp,
  FaUsers,
  FaSlidersH,
  FaUserShield,
  FaChartBar
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

export function Sidebar() {
  // Mengambil state sidebar dari localStorage saat komponen dimuat
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  // Menyimpan state sidebar ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSettingsDropdown = () => {
    if (!isCollapsed) {
      setIsSettingsOpen(!isSettingsOpen);
    }
  };

  const menuItems = [
    { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/master-data", icon: <FaDatabase />, label: "Data Master" },
    { path: "/assets", icon: <FaBox />, label: "Manajemen Aset" },
    { path: "/reports/by-location", icon: <FaChartBar />, label: "Laporan per Ruangan" },
  ];

  const settingsItems = [
    { path: "/users", icon: <FaUsers />, label: "Manajemen Pengguna" },
    { path: "/roles", icon: <FaUserShield />, label: "Manajemen Peran" },
    { path: "/parameters", icon: <FaSlidersH />, label: "Manajemen Parameter" },
  ];

  return (
    <div
      className={`relative h-full transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background dengan tema dark/light */}
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

      {/* Layer untuk Highlight */}
      <div
        className={`absolute inset-0 rounded-r-2xl transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-400/10 via-transparent to-gray-500/10"
            : "bg-gradient-to-b from-blue-400/10 via-transparent to-blue-500/10"
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

        {/* Navigation Menu */}
        <nav className="flex-1 mt-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group relative flex items-center p-3 my-1 rounded-xl
                transition-all duration-300 ease-out
                ${
                  location.pathname.startsWith(item.path) && item.path !== "/"
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg shadow-gray-500/25 border-l-4 border-yellow-400"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 border-l-4 border-yellow-400"
                    : theme === "dark"
                    ? "bg-gray-800/30 hover:bg-gray-700/50 border-l-4 border-transparent hover:border-gray-400"
                    : "bg-blue-800/30 hover:bg-blue-700/50 border-l-4 border-transparent hover:border-blue-400"
                }
                hover:scale-105 hover:shadow-xl
                overflow-hidden
              `}
            >
              {/* Active Indicator */}
              {location.pathname.startsWith(item.path) && item.path !== "/" && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transition-colors duration-300 ${
                    theme === "dark" ? "from-white/5" : "from-white/10"
                  }`}
                ></div>
              )}

              {/* Icon */}
              <span
                className={`
                text-lg transition-all duration-300
                ${
                  location.pathname.startsWith(item.path) && item.path !== "/"
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

              {/* Label */}
              {!isCollapsed && (
                <span
                  className={`
                  ml-3 font-medium transition-all duration-300
                  ${
                    location.pathname.startsWith(item.path) && item.path !== "/"
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

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}

          {/* Settings Menu with Dropdown */}
          <div
            className={`
              group relative flex flex-col rounded-xl
              transition-all duration-300 ease-out
              ${
                isSettingsOpen || 
                settingsItems.some(item => location.pathname.startsWith(item.path))
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
            {/* Settings Header */}
            <div
              onClick={toggleSettingsDropdown}
              className={`
                flex items-center p-3 my-1 cursor-pointer
                hover:scale-105 hover:shadow-xl
                transition-all duration-300 ease-out
              `}
            >
              {/* Active Indicator */}
              {(isSettingsOpen || 
                settingsItems.some(item => location.pathname.startsWith(item.path))) && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transition-colors duration-300 ${
                    theme === "dark" ? "from-white/5" : "from-white/10"
                  }`}
                ></div>
              )}

              {/* Icon */}
              <span
                className={`
                text-lg transition-all duration-300
                ${
                  isSettingsOpen || 
                  settingsItems.some(item => location.pathname.startsWith(item.path))
                    ? "text-yellow-300"
                    : theme === "dark"
                    ? "text-gray-300"
                    : "text-blue-200"
                }
                group-hover:text-white
                ${isCollapsed ? "mx-auto" : ""}
              `}
              >
                <FaCog />
              </span>

              {/* Label */}
              {!isCollapsed && (
                <>
                  <span
                    className={`
                    ml-3 font-medium transition-all duration-300
                    ${
                      isSettingsOpen || 
                      settingsItems.some(item => location.pathname.startsWith(item.path))
                        ? "text-white"
                        : theme === "dark"
                        ? "text-gray-300"
                        : "text-blue-100"
                    }
                    group-hover:text-white
                  `}
                  >
                    Pengaturan
                  </span>
                  <span className="ml-auto">
                    {isSettingsOpen ? <FaAngleUp /> : <FaAngleDown />}
                  </span>
                </>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Dropdown Items */}
            {!isCollapsed && isSettingsOpen && (
              <div className="pl-8 pr-2 pb-2 space-y-1">
                {settingsItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group relative flex items-center p-2 my-1 rounded-lg
                      transition-all duration-300 ease-out
                      ${
                        location.pathname.startsWith(item.path)
                          ? theme === "dark"
                            ? "bg-gray-600/50 shadow-inner border-l-2 border-yellow-400"
                            : "bg-blue-600/50 shadow-inner border-l-2 border-yellow-400"
                          : theme === "dark"
                          ? "bg-gray-700/30 hover:bg-gray-600/50"
                          : "bg-blue-700/30 hover:bg-blue-600/50"
                      }
                      hover:scale-105
                      overflow-hidden
                    `}
                  >
                    {/* Icon */}
                    <span
                      className={`
                      text-sm transition-all duration-300
                      ${
                        location.pathname.startsWith(item.path)
                          ? "text-yellow-300"
                          : theme === "dark"
                          ? "text-gray-300"
                          : "text-blue-200"
                      }
                      group-hover:text-white
                    `}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span
                      className={`
                      ml-3 text-sm font-medium transition-all duration-300
                      ${
                        location.pathname.startsWith(item.path)
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

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer Section */}
        <div
          className={`p-4 border-t transition-colors duration-300 ${
            theme === "dark" ? "border-gray-700" : "border-blue-600/30"
          }`}
        >
          {!isCollapsed && (
            <div className="text-center">
              <p
                className={`text-xs transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-blue-200"
                }`}
              >
                Sistem Manajemen Aset
              </p>
              <p
                className={`text-xs font-semibold mt-1 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-blue-300"
                }`}
              >
                UNIVERSITAS IGM
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3D Toggle Button */}
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
        {/* Button Background */}
        <div
          className={`absolute inset-0 rounded-lg shadow-2xl transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-b from-gray-700 to-gray-600"
              : "bg-gradient-to-b from-blue-700 to-blue-600"
          }`}
        ></div>
        <div
          className={`absolute inset-0 rounded-lg opacity-60 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-b from-gray-500 to-gray-400"
              : "bg-gradient-to-b from-blue-500 to-blue-400"
          }`}
        ></div>
        <div
          className={`absolute inset-0 rounded-lg opacity-30 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gradient-to-b from-gray-300 to-gray-200"
              : "bg-gradient-to-b from-blue-300 to-blue-200"
          }`}
        ></div>

        {/* Icon */}
        <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-125">
          {isCollapsed ? (
            <FaChevronRight className="text-white text-sm" />
          ) : (
            <FaChevronLeft className="text-white text-sm" />
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg"></div>
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
  );
}