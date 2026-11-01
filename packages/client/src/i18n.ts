import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import { readBrowserLanguages } from "@/lib/browserLanguages";
import {
  DEFAULT_LANGUAGE,
  localeRegistry,
  type RegisteredLocale,
  resolveInterfaceLanguage,
  resolveLanguageFallbacks,
} from "@/locales";

/**
 * i18next options built from the locale registry: resources without `_meta`,
 * the supported languages and the dialect fallback order.
 *
 * Implements FR9, FR10 of add-interface-language-selection (D4, D5).
 */
export const createI18nOptions = (
  registry: readonly RegisteredLocale[],
): InitOptions => ({
  resources: Object.fromEntries(
    registry.map(({ metadata, translations }) => [
      metadata.code,
      { translation: translations },
    ]),
  ),
  supportedLngs: registry.map(({ metadata }) => metadata.code),
  fallbackLng: {
    ...Object.fromEntries(
      registry.map(({ metadata }) => [
        metadata.code,
        resolveLanguageFallbacks(metadata.code, registry).slice(1),
      ]),
    ),
    default: [DEFAULT_LANGUAGE],
  },
  load: "currentOnly",
  interpolation: { escapeValue: false },
});

const readStoredInterfaceLanguage = (): string | null => null;

/**
 * The interface language the app starts in: the chosen one, else the browser's.
 *
 * Implements FR7 of add-interface-language-selection (D3).
 */
export const resolveStartInterfaceLanguage = (): string =>
  resolveInterfaceLanguage(
    readStoredInterfaceLanguage(),
    readBrowserLanguages(),
  );

void i18n.use(initReactI18next).init({
  ...createI18nOptions(localeRegistry),
  lng: resolveStartInterfaceLanguage(),
});

export default i18n;
