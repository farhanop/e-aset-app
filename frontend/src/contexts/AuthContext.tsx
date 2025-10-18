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
  logout: (message?: string) => void; // 1. Tambahkan parameter opsional 'message'
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
          const response = await api.get("/auth/profile");
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem("access_token");
          console.error("Sesi tidak valid, token dihapus:", error);
        }
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (token: string, userData?: User) => {
    localStorage.setItem("access_token", token);
    setIsLoading(true);
    try {
      if (userData) {
        setUser(userData);
      } else {
        const response = await api.get("/auth/profile");
        setUser(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil profil setelah login", error);
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Perbarui fungsi logout untuk menangani pesan
  const logout = (message?: string) => {
    localStorage.removeItem("access_token");
    setUser(null);
    if (message) {
      // Anda bisa menggunakan pesan ini untuk menampilkan notifikasi atau alert
      console.log("Sesi berakhir:", message);
      // Contoh jika Anda menggunakan state router untuk menampilkan pesan di halaman login:
      // navigate('/login', { state: { message } });
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
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