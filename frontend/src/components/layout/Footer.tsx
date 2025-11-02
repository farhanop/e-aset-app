// frontend/src/components/layout/Footer.tsx
import { useTheme } from "../../contexts/ThemeContext";

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className={`w-full py-4 px-6 border-t transition-colors duration-300 backdrop-blur-sm mt-auto ${
        isDark
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 border-blue-600"
      }`}
    >
      <div className="text-center space-y-1">
        <p
          className={`text-sm font-medium transition-colors ${
            isDark ? "text-gray-200" : "text-blue-100"
          }`}
        >
          © {new Date().getFullYear()} Universitas IGM — E-Aset System
        </p>
        <p
          className={`text-xs transition-colors ${
            isDark ? "text-gray-400" : "text-blue-200"
          }`}
        >
          Sistem Manajemen Aset Digital Terintegrasi
        </p>
      </div>
    </footer>
  );
}
