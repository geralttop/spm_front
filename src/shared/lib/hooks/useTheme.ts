"use client";

import { useThemeStore } from "../store/theme-store";

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const colorPalette = useThemeStore((state) => state.colorPalette);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setColorPalette = useThemeStore((state) => state.setColorPalette);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return {
    theme,
    colorPalette,
    setTheme,
    setColorPalette,
    toggleTheme,
  };
}
