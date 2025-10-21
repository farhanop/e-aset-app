import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";  // Tambahkan ini
import { AuthProvider } from "./contexts/AuthContext";    // Tambahkan ini

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>      {/* Theme berlaku global */}
      <AuthProvider>     {/* Auth juga global */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
