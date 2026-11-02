import { REGION_DISPLAY_FALLBACK, REGION_DISPLAY_TYPE } from "@/constants";
import {
  type InterfaceLanguageCode,
  resolveLanguageFallbacks,
} from "@/locales";

const displayNamesByLanguage = new Map<
  InterfaceLanguageCode,
  Intl.DisplayNames
>();

function getDisplayNames(language: InterfaceLanguageCode): Intl.DisplayNames {
  const cachedDisplayNames = displayNamesByLanguage.get(language);
  if (cachedDisplayNames) return cachedDisplayNames;
  const displayNames = new Intl.DisplayNames(
    [...resolveLanguageFallbacks(language)],
    {
      type: REGION_DISPLAY_TYPE,
      fallback: REGION_DISPLAY_FALLBACK,
    },
  );
  displayNamesByLanguage.set(language, displayNames);
  return displayNames;
}

/**
 * Country name in the interface language; empty for an empty or unknown code.
 * Implements FR5, FR10 of add-locations-via-search (D9),
 * FR5 of support-legacy-ios-12-safari (empty without Intl.DisplayNames).
 * Implements FR5 of show-city-labels-in-interface-language (D5): names along the fallback order.
 */
export function presentCountryName(
  countryCode: string,
  language: InterfaceLanguageCode,
): string {
  if (countryCode === "" || typeof Intl.DisplayNames !== "function") return "";
  return getDisplayNames(language).of(countryCode) ?? "";
}
