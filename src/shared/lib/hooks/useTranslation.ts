"use client";
import { useTranslation as useI18nextTranslation } from "react-i18next";
import { SupportedLocale, defaultLocale } from "@/shared/config/i18n-constants";
import i18n from "@/shared/config/i18n";
import { useEffect, useState } from "react";
export function useTranslation() {
    const { t } = useI18nextTranslation("common", {
        useSuspense: false,
        i18n,
    });
    const [ready, setReady] = useState(i18n.isInitialized);
    const [currentLang, setCurrentLang] = useState<SupportedLocale>((i18n.language || defaultLocale) as SupportedLocale);
    useEffect(() => {
        const handleInitialized = () => {
            setReady(true);
            setCurrentLang((i18n.language || defaultLocale) as SupportedLocale);
        };
        const handleLanguageChanged = (lng: string) => {
            setCurrentLang(lng as SupportedLocale);
        };
        i18n.on("initialized", handleInitialized);
        i18n.on("languageChanged", handleLanguageChanged);
        return () => {
            i18n.off("initialized", handleInitialized);
            i18n.off("languageChanged", handleLanguageChanged);
        };
    }, []);
    const changeLanguage = async (locale: SupportedLocale) => {
        try {
            await i18n.changeLanguage(locale);
            setCurrentLang(locale);
            if (typeof window !== "undefined") {
                localStorage.setItem("i18nextLng", locale);
            }
        }
        catch (error) {
            console.error("Error changing language:", error);
        }
    };
    const safeT = ready
        ? t
        : ((key: string, options?: Record<string, unknown>) => (key.split(".").pop() || key) as string);
    return {
        t: safeT,
        i18n,
        ready,
        currentLanguage: currentLang,
        changeLanguage,
    };
}
