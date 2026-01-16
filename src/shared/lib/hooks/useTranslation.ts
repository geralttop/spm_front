"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";
import { SupportedLocale, defaultLocale } from "@/shared/config/i18n-constants";

/**
 * Хук для использования переводов с типизацией
 */
export function useTranslation() {
  const { t, i18n, ready } = useI18nextTranslation("common", {
    useSuspense: false,
  });

  const changeLanguage = async (locale: SupportedLocale) => {
    if (i18n.isInitialized) {
      await i18n.changeLanguage(locale);
    }
  };

  // Возвращаем функцию-заглушку для t, если i18n еще не готов
  const safeT = ready ? t : ((key: string) => key);

  return {
    t: safeT,
    i18n,
    ready,
    currentLanguage: (i18n.language || defaultLocale) as SupportedLocale,
    changeLanguage,
  };
}
