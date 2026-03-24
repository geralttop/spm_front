"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/shared/lib/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const colorPalette = useThemeStore((state) => state.colorPalette);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-color-palette", colorPalette);
  }, [theme, colorPalette]);

  return <>{children}</>;
}
