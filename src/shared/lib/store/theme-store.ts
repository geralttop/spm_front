"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColorPaletteId, ThemeMode } from "@/shared/config/theme";
import {
  DEFAULT_COLOR_PALETTE,
  isColorPaletteId,
} from "@/shared/config/theme";

interface ThemeStore {
  theme: ThemeMode;
  colorPalette: ColorPaletteId;
  setTheme: (theme: ThemeMode) => void;
  setColorPalette: (palette: ColorPaletteId) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      colorPalette: DEFAULT_COLOR_PALETTE,
      setTheme: (theme) => set({ theme }),
      setColorPalette: (colorPalette) => set({ colorPalette }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        theme: state.theme,
        colorPalette: state.colorPalette,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") {
          return current;
        }
        const p = persisted as Partial<Pick<ThemeStore, "theme" | "colorPalette">>;
        const colorPalette = isColorPaletteId(p.colorPalette)
          ? p.colorPalette
          : current.colorPalette;
        const theme: ThemeMode =
          p.theme === "light" || p.theme === "dark" ? p.theme : current.theme;
        return { ...current, ...p, theme, colorPalette };
      },
    }
  )
);
