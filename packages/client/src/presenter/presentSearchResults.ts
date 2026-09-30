import type { SupportedLanguage } from "@/i18n";
import type { Location } from "@/model";
import type { CitySearchResult } from "@/ports";
import { presentCountryName } from "./countryName";

export type PresentedSearchResult = {
  timeZoneId: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  matchedAbbreviation?: string;
  /** The list already has this zone under this city, in any language. */
  isAdded: boolean;
};

/**
 * Search results in the interface language, each marked when already added.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D9).
 */
export function presentSearchResults(
  results: readonly CitySearchResult[],
  locations: readonly Location[],
  language: SupportedLanguage,
): PresentedSearchResult[] {
  return results.map(({ record, matchedAbbreviation }) => ({
    timeZoneId: record.timeZoneId,
    cityName: record.names[language],
    countryCode: record.countryCode,
    countryName: presentCountryName(record.countryCode, language),
    matchedAbbreviation,
    isAdded: locations.some(
      (location) =>
        location.timeZoneId === record.timeZoneId &&
        Object.values(record.names).includes(location.label),
    ),
  }));
}
