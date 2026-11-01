import type { RegisteredLocale } from "@/locales";

/** Builds a registered locale for tests. Implements FR3, FR6, FR9 of add-interface-language-selection. */
export const buildRegisteredLocale = (
  code: string,
  name: string,
  nativeName: string,
  baseLanguage = code,
  emoji = "🏳️",
): RegisteredLocale => ({
  metadata: { code, name, nativeName, baseLanguage, emoji },
  translations: {},
});

/** The ten locales of the language search scenarios (FR6). */
export const TEN_LOCALES: readonly RegisteredLocale[] = [
  buildRegisteredLocale("en", "English", "English", "en", "🇺🇸"),
  buildRegisteredLocale("ru", "Russian", "Русский", "ru", "🇷🇺"),
  buildRegisteredLocale("de", "German", "Deutsch", "de", "🇩🇪"),
  buildRegisteredLocale("fr", "French", "Français", "fr", "🇫🇷"),
  buildRegisteredLocale("es", "Spanish", "Español", "es", "🇪🇸"),
  buildRegisteredLocale("it", "Italian", "Italiano", "it", "🇮🇹"),
  buildRegisteredLocale("pt", "Portuguese", "Português", "pt", "🇵🇹"),
  buildRegisteredLocale("ja", "Japanese", "日本語", "ja", "🇯🇵"),
  buildRegisteredLocale("uk", "Ukrainian", "Українська", "uk", "🇺🇦"),
  buildRegisteredLocale("pl", "Polish", "Polski", "pl", "🇵🇱"),
];

/** `en`, `ru` and the dialect `ru-KZ` (base `ru`), as no real dialect exists. */
export const DIALECT_REGISTRY: readonly RegisteredLocale[] = [
  buildRegisteredLocale("en", "English", "English"),
  buildRegisteredLocale("ru", "Russian", "Русский"),
  buildRegisteredLocale(
    "ru-KZ",
    "Russian (Kazakhstan)",
    "Русский (Казахстан)",
    "ru",
  ),
];
