"use client";

import { useEffect } from "react";
import i18n from "@/shared/config/i18n";

/**
 * Провайдер для синхронизации языка с HTML атрибутом
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateHtmlLang = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng;
      }
    };

    // Устанавливаем начальный язык
    if (i18n.language) {
      updateHtmlLang(i18n.language);
    }

    // Слушаем изменения языка
    const handleLanguageChanged = (lng: string) => {
      updateHtmlLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return <>{children}</>;
}
