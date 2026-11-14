import type { TFunction } from "i18next";
import type { CityNameLanguage } from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import { getZoneAbbreviations, type Location } from "@/model";
import { type CitySearchResult, isCityNameOfRecord } from "@/ports";
import { presentCountryName } from "./countryName";
import { formatZoneAbbreviation } from "./zoneAbbreviation";

/**
 * The interface language and the language of the city data it reads.
 * Implements FR5, FR10 of add-interface-language-selection (D5).
 */
export type SearchPresentationContext = {
  language: InterfaceLanguageCode;
  cityNameLanguage: CityNameLanguage;
  /** Spells the zone abbreviations of the pair (FR3 of show-zone-abbreviations-and-zone-label-setting). */
  translate: TFunction;
};

/** One abbreviation of a result's pair; the matched one is emphasised. */
export type PresentedAbbreviation = { text: string; isMatched: boolean };

export type PresentedSearchResult = {
  /** Unique per city: the list key of the results (FR4 of add-geonames-city-source). */
  id: string;
  timeZoneId: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  /** First-level division of a namesake in the interface language (FR7 of add-geonames-city-source). */
  regionName?: string;
  /** The abbreviation pair of an abbreviation match, `EST / EDT`; absent for other matches. */
  abbreviationPair?: readonly PresentedAbbreviation[];
  /** The list already has this zone under this city, in any language. */
  isAdded: boolean;
};

/**
 * Search results in the interface language, each marked when already added.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D9).
 * Implements FR10, FR11, UX3 of show-zone-abbreviations-and-zone-label-setting (D8): the abbreviation pair.
 * Implements FR4, FR7, FR8 of add-geonames-city-source (D7, D9): the result ID and the region.
 */
export function presentSearchResults(
  results: readonly CitySearchResult[],
  locations: readonly Location[],
  context: SearchPresentationContext,
): PresentedSearchResult[] {
  const { language, cityNameLanguage, translate } = context;
  return results.map(({ record, matchedAbbreviation }) => ({
    id: record.id,
    timeZoneId: record.timeZoneId,
    cityName: record.names[cityNameLanguage],
    countryCode: record.countryCode,
    countryName: presentCountryName(record.countryCode, language),
    regionName: record.region?.[cityNameLanguage],
    abbreviationPair:
      matchedAbbreviation === undefined
        ? undefined
        : getZoneAbbreviations(record.timeZoneId).map((abbreviation) => ({
            text: formatZoneAbbreviation(abbreviation, translate),
            isMatched: abbreviation === matchedAbbreviation,
          })),
    isAdded: locations.some(
      (location) =>
        location.timeZoneId === record.timeZoneId &&
        isCityNameOfRecord(record, location.label),
    ),
  }));
}
