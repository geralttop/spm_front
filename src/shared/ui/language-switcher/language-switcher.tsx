"use client";

import { useTranslation } from "@/shared/lib/hooks";
import { supportedLocales, type SupportedLocale } from "@/shared/config/i18n-constants";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";

/**
 * Компонент переключения языка
 */
export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-language-switcher]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted || !ready) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-text-muted"
        >
          <Languages className="h-4 w-4" />
          <span>...</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" data-language-switcher>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
      >
        <Languages className="h-4 w-4" />
        <span>{t(`language.${currentLanguage}`)}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-card shadow-lg z-50">
          <div className="p-1">
            {supportedLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => {
                  changeLanguage(locale);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  currentLanguage === locale
                    ? "bg-primary text-primary-foreground"
                    : "text-text-main hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {t(`language.${locale}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
