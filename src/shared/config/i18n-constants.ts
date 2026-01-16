/**
 * Константы для i18n (без "use client" для использования в серверных компонентах)
 */
export const supportedLocales = ["ru", "be", "en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "ru";
