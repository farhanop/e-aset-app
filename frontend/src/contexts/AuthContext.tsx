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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        // Set token di header axios sebelum melakukan request
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Token found in localStorage, checking validity...");

        try {
          if (storedUser) {
            // Gunakan data lokal dulu agar UI langsung muncul
            setUser(JSON.parse(storedUser));
          }

          // Pastikan data terbaru dari server
          console.log("Fetching user profile...");
          const response = await api.get("/auth/profile");
          console.log("Profile data received:", response.data);
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          console.error("Sesi tidak valid, token dihapus:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (token: string, userData?: User) => {
    console.log("AuthContext login called");

    // Simpan token ke localStorage
    localStorage.setItem("access_token", token);

    // Set token di header axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setIsLoading(true);

    try {
      let fetchedUser = userData;
      if (!userData) {
        // Ambil data user dari server jika tidak disediakan
        console.log("Fetching user data from server...");
        const response = await api.get("/auth/profile");
        fetchedUser = response.data;
        console.log("User data received:", fetchedUser);
      }

      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      }

      localStorage.setItem("shouldNavigateToDashboard", "true");
    } catch (error) {
      console.error("Gagal mengambil profil setelah login", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (message?: string) => {
    console.log("AuthContext logout called");

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    if (message) {
      localStorage.setItem("logoutMessage", message);
    }
    localStorage.setItem("shouldNavigateToLogin", "true");
  };

  const updateProfile = async (formData: FormData) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const response = await api.patch("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
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
