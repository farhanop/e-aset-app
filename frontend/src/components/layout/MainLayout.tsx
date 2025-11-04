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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthenticated) {
    useIdleTimer(30 * 60 * 1000);
  }

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Sticky */}
      <div className="flex-shrink-0 sticky top-0 h-screen z-30">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Konten utama */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showBackButton={location.pathname !== "/dashboard"}
          onBackClick={() => navigate(-1)}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`p-4 md:p-6 min-h-full ${
              theme === "dark"
                ? "bg-gray-800/80 backdrop-blur-sm"
                : "bg-white/80 backdrop-blur-sm"
            }`}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
