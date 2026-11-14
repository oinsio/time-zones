import {
  CITY_NAME_LANGUAGES,
  REGION_DISPLAY_FALLBACK,
  REGION_DISPLAY_TYPE,
} from "@/constants";
import { normalizeSearchText, splitIntoWords } from "@/lib/searchText";
import { ETC_ZONE_AREA, getKnownZoneIds } from "@/lib/zoneRules";
import {
  type CityRecord,
  type CitySearchResult,
  SearchMatchKind,
} from "@/ports";

/**
 * The name and country matching shared by the zone cities source and the
 * GeoNames source: one owner of the matching rule, one formatter per language.
 * Implements FR3 of add-geonames-city-source; NFR-P2, NFR-P3 (D6).
 */

/** Zones the search may offer, or `undefined` when no zone list is known. */
export type ListTimeZones = () => readonly string[] | undefined;

const AREA_SEPARATOR = "/";

/**
 * The zones of the installed release that have an area outside `Etc`: no
 * offset-only zone and no area-less id.
 * Implements FR9 of add-zone-rules-from-iana (design D6); FR11 of add-geonames-city-source.
 */
export const listKnownZones: ListTimeZones = () =>
  getKnownZoneIds()?.filter(
    (zoneId) =>
      zoneId.includes(AREA_SEPARATOR) &&
      !zoneId.startsWith(`${ETC_ZONE_AREA}${AREA_SEPARATOR}`),
  );

export type SearchableText = { normalized: string; words: string[] };
export type ReadCountryTexts = (countryCode: string) => SearchableText[];

export const toSearchableText = (text: string): SearchableText => {
  const normalized = normalizeSearchText(text);
  return { normalized, words: splitIntoWords(normalized) };
};

const startsWithQuery = (text: SearchableText, query: string): boolean =>
  text.normalized.startsWith(query);
const hasWordStartingWithQuery = (text: SearchableText, query: string) =>
  text.words.some((word) => word.startsWith(query));

export const findMatchKind = (
  cityTexts: SearchableText[],
  countryTexts: SearchableText[],
  query: string,
): SearchMatchKind | undefined => {
  if (cityTexts.some((text) => startsWithQuery(text, query))) {
    return SearchMatchKind.CITY_PREFIX;
  }
  if (cityTexts.some((text) => hasWordStartingWithQuery(text, query))) {
    return SearchMatchKind.CITY_WORD_PREFIX;
  }
  const isCountryMatch = countryTexts.some(
    (text) =>
      startsWithQuery(text, query) || hasWordStartingWithQuery(text, query),
  );
  return isCountryMatch ? SearchMatchKind.COUNTRY : undefined;
};

/**
 * Country texts per country code, with one `Intl.DisplayNames` per city-name
 * language built on the first read and one lookup per country code.
 * Implements FR5 of support-legacy-ios-12-safari (no texts without Intl.DisplayNames).
 */
export function createCountryTextCache(): ReadCountryTexts {
  const textsByCountryCode = new Map<string, SearchableText[]>();
  let formatters: Intl.DisplayNames[] | undefined;
  const readFormatters = () => {
    formatters ??= CITY_NAME_LANGUAGES.map(
      (language) =>
        new Intl.DisplayNames(language, {
          type: REGION_DISPLAY_TYPE,
          fallback: REGION_DISPLAY_FALLBACK,
        }),
    );
    return formatters;
  };
  return (countryCode) => {
    if (countryCode === "" || typeof Intl.DisplayNames !== "function") {
      return [];
    }
    const known = textsByCountryCode.get(countryCode);
    if (known !== undefined) return known;
    const texts = readFormatters().flatMap((formatter) => {
      const countryName = formatter.of(countryCode);
      return countryName === undefined ? [] : [toSearchableText(countryName)];
    });
    textsByCountryCode.set(countryCode, texts);
    return texts;
  };
}

/**
 * Matches a normalized query against the records' names and countries. The
 * searchable texts are built on the first call, so building a source
 * normalizes nothing (NFR-P3).
 */
export function createRecordMatcher(
  records: readonly CityRecord[],
  readCountryTexts: ReadCountryTexts,
): (normalizedQuery: string) => readonly CitySearchResult[] {
  let searchableRecords:
    | {
        record: CityRecord;
        cityTexts: SearchableText[];
        countryTexts: SearchableText[];
      }[]
    | undefined;
  return (normalizedQuery) => {
    searchableRecords ??= records.map((record) => ({
      record,
      cityTexts: CITY_NAME_LANGUAGES.map((language) =>
        toSearchableText(record.names[language]),
      ),
      countryTexts: readCountryTexts(record.countryCode),
    }));
    return searchableRecords.flatMap<CitySearchResult>(
      ({ record, cityTexts, countryTexts }) => {
        const matchKind = findMatchKind(
          cityTexts,
          countryTexts,
          normalizedQuery,
        );
        return matchKind === undefined ? [] : [{ record, matchKind }];
      },
    );
  };
}
