import { CITY_NAME_LANGUAGES, type CityNameLanguage } from "@/constants";
import {
  DEFAULT_LANGUAGE,
  findRegisteredLocale,
  localeRegistry,
  type RegisteredLocale,
} from "./localeRegistry";

/**
 * The one fallback order of an interface language: its own code, its base language,
 * then English. An unknown code resolves to English alone.
 *
 * Implements FR10 of add-interface-language-selection (D5).
 */
export const resolveLanguageFallbacks = (
  code: string,
  registry: readonly RegisteredLocale[] = localeRegistry,
): readonly string[] => {
  const registeredLocale = findRegisteredLocale(code, registry);
  const order = registeredLocale
    ? [code, registeredLocale.metadata.baseLanguage, DEFAULT_LANGUAGE]
    : [DEFAULT_LANGUAGE];
  return [...new Set(order)];
};

/** Picks the first value defined along the fallback order of `code`. Implements FR10 of add-interface-language-selection (D5). */
export const pickByLanguageFallback = <Value>(
  code: string,
  valuesByLanguage: Readonly<Record<string, Value>>,
  registry: readonly RegisteredLocale[] = localeRegistry,
): Value | undefined => {
  const language = resolveLanguageFallbacks(code, registry).find(
    (candidate) => valuesByLanguage[candidate] !== undefined,
  );
  return language === undefined ? undefined : valuesByLanguage[language];
};

const CITY_NAME_LANGUAGE_BY_CODE: Readonly<Record<string, CityNameLanguage>> =
  Object.fromEntries(
    CITY_NAME_LANGUAGES.map((language) => [language, language]),
  );

/** The language of the city data an interface language reads. Implements FR10 of add-interface-language-selection (D5). */
export const resolveCityNameLanguage = (
  code: string,
  registry: readonly RegisteredLocale[] = localeRegistry,
): CityNameLanguage =>
  pickByLanguageFallback(code, CITY_NAME_LANGUAGE_BY_CODE, registry) ??
  CITY_NAME_LANGUAGES[0];
