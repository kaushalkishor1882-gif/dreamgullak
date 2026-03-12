"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: any) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dg-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dg-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dg-theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

