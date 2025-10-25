// frontend/src/pages/LoginPage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/Login";
import { User } from "../types/User";
import api from "../api/axios";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login...");

      // 1. Login untuk mendapatkan token
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      console.log("Login response:", response.data);
      const { access_token } = response.data;

      if (!access_token) {
        throw new Error("Token tidak ditemukan dalam response");
      }

      // 2. Simpan token ke localStorage
      localStorage.setItem("access_token", access_token);
      console.log("Token saved to localStorage");

      // 3. Set token ke axios defaults
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      console.log("Authorization header set");

      // 4. Tunggu sebentar untuk memastikan token tersimpan dengan benar
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 5. Ambil data profil user
      console.log("Fetching user profile...");
      const profileResponse = await api.get("/auth/profile");
      console.log("Profile response:", profileResponse.data);

      const userData: User = profileResponse.data;

      // 6. Gunakan AuthContext login function
      await login(access_token, userData);
      console.log("Login process completed successfully");
    } catch (err: any) {
      console.error("Login error:", err);

      // Hapus token yang mungkin sudah tersimpan jika terjadi error
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];

      if (err.response) {
        // Error dari server
        if (err.response.status === 401) {
          setError("Username atau password salah.");
        } else {
          setError(
            err.response.data?.message || "Terjadi kesalahan saat login."
          );
        }
      } else if (err.request) {
        // Request dibuat tapi tidak ada respons
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      } else {
        // Error lainnya
        setError(err.message || "Username atau password salah.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      username={username}
      password={password}
      error={error}
      isLoading={isLoading}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
    />
  );
}
