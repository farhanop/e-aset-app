// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with a default value
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    // Check if saved theme is valid
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Use system preference if no saved theme
      setTheme("dark");
    }
    
    // Mark component as mounted
    setMounted(true);
  }, []);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (!mounted) return; // Don't run before initial theme is loaded
    
    const root = window.document.documentElement;
    
    // Apply theme to document
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save theme to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of incorrect theme on initial load
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Instead of throwing an error, provide a default value
    console.warn("useTheme must be used within a ThemeProvider. Using default values.");
    return {
      theme: "light" as Theme,
      toggleTheme: () => console.warn("toggleTheme called outside of ThemeProvider")
    };
  }
  return context;
}