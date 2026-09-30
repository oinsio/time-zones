import { REGION_DISPLAY_FALLBACK, REGION_DISPLAY_TYPE } from "@/constants";
import type { SupportedLanguage } from "@/i18n";

const displayNamesByLanguage = new Map<SupportedLanguage, Intl.DisplayNames>();

function getDisplayNames(language: SupportedLanguage): Intl.DisplayNames {
  const cachedDisplayNames = displayNamesByLanguage.get(language);
  if (cachedDisplayNames) return cachedDisplayNames;
  const displayNames = new Intl.DisplayNames(language, {
    type: REGION_DISPLAY_TYPE,
    fallback: REGION_DISPLAY_FALLBACK,
  });
  displayNamesByLanguage.set(language, displayNames);
  return displayNames;
}

/**
 * Country name in the interface language; empty for an empty or unknown code.
 * Implements FR5, FR10 of add-locations-via-search (D9).
 */
export function presentCountryName(
  countryCode: string,
  language: SupportedLanguage,
): string {
  if (countryCode === "") return "";
  return getDisplayNames(language).of(countryCode) ?? "";
}
