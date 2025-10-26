// frontend/src/components/layout/MainLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useIdleTimer } from "../../hooks/useIdleTimer";

export function MainLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // State untuk mengontrol sidebar di mobile

  // Timeout diatur ke 30 menit (dalam milidetik)
  if (isAuthenticated) {
    useIdleTimer(30 * 60 * 1000);
  }

  // Redirect to dashboard only once when at root path "/"
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Menutup sidebar saat berpindah halaman di mobile
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, sidebarOpen]);

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-blue-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Hanya satu Sidebar component yang menangani desktop dan mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            // Tambahkan prop untuk menampilkan tombol kembali jika diperlukan
            showBackButton={location.pathname !== "/dashboard"}
            onBackClick={() => navigate(-1)}
          />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800/80 backdrop-blur-sm"
                : "bg-white/80 backdrop-blur-sm"
            }`}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
