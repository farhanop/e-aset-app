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
      console.log("=== LOGIN DEBUG START ===");
      console.log("Attempting login with username:", username);

      // 1. Login untuk mendapatkan token DAN user data
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      console.log("Login response:", response.data);

      const { access_token, user: userDataFromLogin } = response.data;

      if (!access_token) {
        throw new Error("Token tidak ditemukan dalam response");
      }

      if (!userDataFromLogin) {
        throw new Error("User data tidak ditemukan dalam response login");
      }

      // 2. Simpan token ke localStorage
      localStorage.setItem("access_token", access_token);
      console.log("Token saved to localStorage");

      // 3. Set token ke axios defaults
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      console.log("Authorization header set");

      // 4. Gunakan user data DARI RESPONSE LOGIN (bukan dari profile)
      const userData: User = userDataFromLogin;

      console.log("User data from login response:", userData);
      console.log("User role:", userData.role);
      console.log("User role type:", typeof userData.role);

      // 5. Validasi role
      if (!userData.role) {
        console.error("User role is undefined!");
        throw new Error("Role user tidak ditemukan");
      }

      const validRoles = ["super-admin", "admin", "staff"];
      if (!validRoles.includes(userData.role)) {
        console.error(`Invalid role: ${userData.role}`);
        throw new Error(`Role tidak valid: ${userData.role}`);
      }

      console.log(`Role validation passed: ${userData.role}`);

      // 6. Gunakan AuthContext login function dengan user data dari login response
      await login(access_token, userData);
      console.log("Login process completed successfully");
      console.log("=== LOGIN DEBUG END ===");
    } catch (err: any) {
      console.error("Login error details:", err);
      console.error("Login error response:", err.response?.data);

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
