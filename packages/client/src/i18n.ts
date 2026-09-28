import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "language";

export const localeResources = {
  en: { translation: en },
  ru: { translation: ru },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: localeResources,
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
