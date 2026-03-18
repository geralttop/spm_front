/**
 * Конфигурация цветовой схемы приложения
 * Социально-географическая платформа
 */

export const themeConfig = {
  light: {
    primary: "#0e639c", // Cursor/VS Code blue
    background: "#ffffff",
    card: "#ffffff",
    secondary: "#3794ff",
    textMain: "#3c3c3c",
    textMuted: "#6e6e6e",
  },
  dark: {
    primary: "#0e639c", // Cursor/VS Code blue
    background: "#1e1e1e",
    card: "#252526",
    secondary: "#3794ff",
    textMain: "#d4d4d4",
    textMuted: "#858585",
  },
} as const;

export type ThemeMode = "light" | "dark";
