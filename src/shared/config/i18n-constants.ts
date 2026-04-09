export const supportedLocales = ["ru", "be", "en", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = "ru";
