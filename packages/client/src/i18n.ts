import i18n, { type InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";

/** Implements FR2 of setup-app-shell-and-pages-deploy. */
export const SUPPORTED_LANGUAGES = ["en", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "language";

export const localeResources = {
  en: { translation: en },
  ru: { translation: ru },
};

/** Resolves regional codes such as `ru-RU` to a supported language (`ru`). */
export const languageResolutionOptions = {
  supportedLngs: [...SUPPORTED_LANGUAGES],
  load: "languageOnly",
} as const;

/** Production options: detect from storage, then the browser; remember the choice. */
export const i18nInitOptions: InitOptions = {
  resources: localeResources,
  ...languageResolutionOptions,
  fallbackLng: DEFAULT_LANGUAGE,
  detection: {
    order: ["localStorage", "navigator"],
    lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    caches: ["localStorage"],
  },
  interpolation: { escapeValue: false },
};

void i18n.use(LanguageDetector).use(initReactI18next).init(i18nInitOptions);

export default i18n;
