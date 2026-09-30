import type { SupportedLanguage } from "@/i18n";

const REGION_DISPLAY_TYPE = "region";

const displayNamesByLanguage = new Map<SupportedLanguage, Intl.DisplayNames>();

function getDisplayNames(language: SupportedLanguage): Intl.DisplayNames {
  const cachedDisplayNames = displayNamesByLanguage.get(language);
  if (cachedDisplayNames) return cachedDisplayNames;
  const displayNames = new Intl.DisplayNames(language, {
    type: REGION_DISPLAY_TYPE,
    fallback: "none",
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
