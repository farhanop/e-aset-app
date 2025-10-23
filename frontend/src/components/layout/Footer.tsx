// src/components/layout/Footer.tsx
import { useTheme } from "../../contexts/ThemeContext";

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`p-4 border-t transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600"
      } backdrop-blur-sm bg-opacity-90`}
    >
      <div className="text-center">
        <p
          className={`text-sm transition-colors duration-300 ${
            theme === "dark" ? "text-gray-300" : "text-blue-200"
          }`}
        >
          © {new Date().getFullYear()} UNIVERSITAS IGM - E-Aset System
        </p>
        <p
          className={`text-xs mt-1 transition-colors duration-300 ${
            theme === "dark" ? "text-gray-400" : "text-blue-300"
          }`}
        >
          Sistem Manajemen Aset Digital Terintegrasi
        </p>
      </div>
    </footer>
  );
}