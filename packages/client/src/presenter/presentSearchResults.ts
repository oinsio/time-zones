import type { CityNameLanguage } from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import type { Location } from "@/model";
import { type CitySearchResult, isCityNameOfRecord } from "@/ports";
import { presentCountryName } from "./countryName";

/**
 * The interface language and the language of the city data it reads.
 * Implements FR5, FR10 of add-interface-language-selection (D5).
 */
export type SearchPresentationContext = {
  language: InterfaceLanguageCode;
  cityNameLanguage: CityNameLanguage;
};

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
  context: SearchPresentationContext,
): PresentedSearchResult[] {
  const { language, cityNameLanguage } = context;
  return results.map(({ record, matchedAbbreviation }) => ({
    timeZoneId: record.timeZoneId,
    cityName: record.names[cityNameLanguage],
    countryCode: record.countryCode,
    countryName: presentCountryName(record.countryCode, language),
    matchedAbbreviation,
    isAdded: locations.some(
      (location) =>
        location.timeZoneId === record.timeZoneId &&
        isCityNameOfRecord(record, location.label),
    ),
  }));
}
