"use client";

import { useEffect } from "react";
import { useTranslation } from "@/shared/lib/hooks";

/**
 * Провайдер для синхронизации языка с HTML атрибутом
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Обновляем lang атрибут HTML элемента
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return <>{children}</>;
}
