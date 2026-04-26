export const supportedLocales = ["ru", "be", "belat", "uk", "kk", "ka", "en", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = "ru";
