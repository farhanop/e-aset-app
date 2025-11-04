// frontend/src/components/AuthNavigationHandler.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AuthNavigationHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah harus navigasi ke dashboard setelah login
    if (localStorage.getItem("shouldNavigateToDashboard") === "true" && isAuthenticated) {
      localStorage.removeItem("shouldNavigateToDashboard");
      navigate("/dashboard");
    }
    
    // Cek apakah harus navigasi ke login setelah logout
    if (localStorage.getItem("shouldNavigateToLogin") === "true" && !isAuthenticated && !isLoading) {
      const message = localStorage.getItem("logoutMessage");
      localStorage.removeItem("shouldNavigateToLogin");
      localStorage.removeItem("logoutMessage");
      
      navigate("/login", { 
        state: message ? { message } : undefined 
      });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Komponen ini tidak merender apa-apa, hanya menangani navigasi
  return null;
}