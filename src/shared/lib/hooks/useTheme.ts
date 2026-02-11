"use client";

import { useEffect } from "react";
import { useThemeStore } from "../store/theme-store";

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
