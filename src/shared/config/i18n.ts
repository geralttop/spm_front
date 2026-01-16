"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { defaultLocale, supportedLocales } from "./i18n-constants";

// Проверка, что код выполняется на клиенте
const isClient = typeof window !== "undefined";

// Инициализация i18n только на клиенте
if (isClient && !i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: defaultLocale,
      supportedLngs: supportedLocales,
      defaultNS: "common",
      ns: ["common"],
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
      react: {
        useSuspense: false,
      },
      debug: process.env.NODE_ENV === "development",
    });
}

export default i18n;
