import {
  DEFAULT_LANGUAGE,
  findRegisteredLocale,
  localeRegistry,
  type RegisteredLocale,
} from "./localeRegistry";
import { toCanonicalLanguageTag } from "./localeMetadata";

const matchBrowserLanguage = (
  browserLanguage: string,
  registry: readonly RegisteredLocale[],
): string | undefined => {
  const canonicalTag = toCanonicalLanguageTag(browserLanguage);
  if (canonicalTag === undefined) return undefined;
  if (findRegisteredLocale(canonicalTag, registry)) return canonicalTag;
  const primarySubtag = canonicalTag.split("-")[0] ?? canonicalTag;
  const primaryLocale = findRegisteredLocale(primarySubtag, registry);
  const isDialect =
    primaryLocale && primaryLocale.metadata.baseLanguage !== primarySubtag;
  return primaryLocale && !isDialect ? primarySubtag : undefined;
};

/**
 * The interface language: the chosen one when registered, else the first browser
 * language that matches a registered locale, else English.
 *
 * Implements FR7 of add-interface-language-selection (D3).
 */
export const resolveInterfaceLanguage = (
  chosenLanguage: string | null,
  browserLanguages: readonly string[],
  registry: readonly RegisteredLocale[] = localeRegistry,
): string => {
  if (chosenLanguage !== null && findRegisteredLocale(chosenLanguage, registry))
    return chosenLanguage;
  for (const browserLanguage of browserLanguages) {
    const matchedLanguage = matchBrowserLanguage(browserLanguage, registry);
    if (matchedLanguage !== undefined) return matchedLanguage;
  }
  return DEFAULT_LANGUAGE;
};
