// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tambahkan base path jika diperlukan
  base: "./",
  esbuild: {
    drop: ["console", "debugger"],
  },
});
