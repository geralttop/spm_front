"use client";
import { useEffect } from "react";
import i18n from "@/shared/config/i18n";
export function LanguageProvider({ children }: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const updateHtmlLang = (lng: string) => {
            if (typeof document !== "undefined") {
                document.documentElement.lang = lng === "belat" ? "be-Latn" : lng;
            }
        };
        if (i18n.language) {
            updateHtmlLang(i18n.language);
        }
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
