import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext';      // 1. Import useAuth
import { useIdleTimer } from '../../hooks/useIdleTimer';  // 2. Import useIdleTimer

export function MainLayout() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // 3. Dapatkan status autentikasi

  // 4. Panggil hook idle timer HANYA jika pengguna sudah login
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

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-blue-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex-1 overflow-x-hidden overflow-y-auto p-6 transition-colors duration-300 ${
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