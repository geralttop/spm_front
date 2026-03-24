/**
 * Конфигурация цветовой схемы приложения
 * Актуальные токены интерфейса задаются в app/globals.css (по палитре и режиму).
 */

export const COLOR_PALETTE_IDS = [
  "default",
  "slate",
  "warm",
  "forest",
  "lavender",
  "rose",
  "ocean",
  "sunset",
] as const;

export type ColorPaletteId = (typeof COLOR_PALETTE_IDS)[number];

export const DEFAULT_COLOR_PALETTE: ColorPaletteId = "default";

/** Мини-превью для карточек выбора в настройках (фон / акцент) */
export const COLOR_PALETTE_PREVIEWS: Record<
  ColorPaletteId,
  { background: string; primary: string }
> = {
  default: { background: "#eef1f4", primary: "#0e639c" },
  slate: { background: "#e8eef5", primary: "#2563eb" },
  warm: { background: "#f5f0e8", primary: "#b45309" },
  forest: { background: "#ecf3ef", primary: "#166534" },
  lavender: { background: "#f3f0fa", primary: "#6d28d9" },
  rose: { background: "#fdf2f4", primary: "#e11d48" },
  ocean: { background: "#ecfeff", primary: "#0e7490" },
  sunset: { background: "#fff7ed", primary: "#ea580c" },
};

export function isColorPaletteId(value: unknown): value is ColorPaletteId {
  return (
    typeof value === "string" &&
    (COLOR_PALETTE_IDS as readonly string[]).includes(value)
  );
}

export const themeConfig = {
  light: {
    primary: "#0e639c",
    background: "#eef1f4",
    card: "#f8f9fb",
    secondary: "#3794ff",
    textMain: "#3c3c3c",
    textMuted: "#6e6e6e",
  },
  dark: {
    primary: "#0e639c",
    background: "#1e1e1e",
    card: "#252526",
    secondary: "#3794ff",
    textMain: "#d4d4d4",
    textMuted: "#858585",
  },
} as const;

export type ThemeMode = "light" | "dark";
