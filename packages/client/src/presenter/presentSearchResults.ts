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
  timeZoneId: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  /** The abbreviation pair of an abbreviation match, `EST / EDT`; absent for other matches. */
  abbreviationPair?: readonly PresentedAbbreviation[];
  /** The list already has this zone under this city, in any language. */
  isAdded: boolean;
};

/**
 * Search results in the interface language, each marked when already added.
 * Implements FR5, FR8, UX3 of add-locations-via-search (D9).
 * Implements FR10, FR11, UX3 of show-zone-abbreviations-and-zone-label-setting (D8): the abbreviation pair.
 */
export function presentSearchResults(
  results: readonly CitySearchResult[],
  locations: readonly Location[],
  context: SearchPresentationContext,
): PresentedSearchResult[] {
  const { language, cityNameLanguage, translate } = context;
  return results.map(({ record, matchedAbbreviation }) => ({
    timeZoneId: record.timeZoneId,
    cityName: record.names[cityNameLanguage],
    countryCode: record.countryCode,
    countryName: presentCountryName(record.countryCode, language),
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
