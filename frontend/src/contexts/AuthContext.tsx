// frontend/src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import api from "../api/axios";
import { User } from "../types/User";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  logout: (message?: string) => void;
  updateProfile: (formData: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Set token ke header axios
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("/auth/profile");
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem("access_token");
          delete api.defaults.headers.common["Authorization"];
          console.error("Sesi tidak valid, token dihapus:", error);
        }
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (token: string, userData?: User) => {
    localStorage.setItem("access_token", token);
    // Set token ke header axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    setIsLoading(true);
    try {
      if (userData) {
        setUser(userData);
      } else {
        const response = await api.get("/auth/profile");
        setUser(response.data);
      }
      // Simpan flag untuk navigasi di komponen lain
      localStorage.setItem("shouldNavigateToDashboard", "true");
    } catch (error) {
      console.error("Gagal mengambil profil setelah login", error);
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (message?: string) => {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    // Simpan pesan logout untuk ditampilkan di halaman login
    if (message) {
      localStorage.setItem("logoutMessage", message);
    }
    
    // Simpan flag untuk navigasi di komponen lain
    localStorage.setItem("shouldNavigateToLogin", "true");
  };

  const updateProfile = async (formData: FormData) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await api.patch("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update user state dengan data terbaru
      setUser(response.data);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}