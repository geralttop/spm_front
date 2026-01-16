"use client";

import { useTranslation } from "@/shared/lib/hooks";
import { supportedLocales, type SupportedLocale } from "@/shared/config/i18n-constants";
import { cn } from "@/shared/lib/utils";

/**
 * Компонент переключения языка
 */
export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useTranslation();

  return (
    <div className="flex gap-2 rounded-lg border border-border bg-card p-1">
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentLanguage === locale
              ? "bg-primary text-primary-foreground"
              : "text-text-muted hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {t(`language.${locale}`)}
        </button>
      ))}
    </div>
  );
}
