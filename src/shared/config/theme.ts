/**
 * Конфигурация цветовой схемы приложения
 * Социально-географическая платформа
 */

export const themeConfig = {
  light: {
    primary: "#6366F1", // Indigo/Violet
    background: "#F8FAFC", // Slate 50
    card: "#FFFFFF", // White
    secondary: "#10B981", // Emerald
    textMain: "#0F172A", // Slate 900
    textMuted: "#64748B", // Slate 500
  },
  dark: {
    primary: "#818CF8", // Indigo 400
    background: "#020617", // Slate 950
    card: "#0F172A", // Slate 900
    secondary: "#34D399", // Emerald 400
    textMain: "#F8FAFC", // Slate 50
    textMuted: "#94A3B8", // Slate 400
  },
} as const;

export type ThemeMode = "light" | "dark";
