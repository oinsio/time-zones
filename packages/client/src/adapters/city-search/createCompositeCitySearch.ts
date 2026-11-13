import type { CityNameLanguage } from "@/constants";
import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import { normalizeSearchText } from "@/lib/searchText";
import {
  type CityRecord,
  type CitySearch,
  type CitySearchResult,
  isCityNameOfRecord,
  SearchMatchKind,
} from "@/ports";
import { createAbbreviationSource } from "./abbreviationSource";
import {
  EMPTY_GEONAMES_CITY_DATA,
  type GeoNamesCityData,
  type ZoneCityData,
} from "./citySource";
import { createCountryTextCache } from "./cityTextMatching";
import { deriveCityNameFromTimeZoneId } from "./deriveCityNameFromTimeZoneId";
import { createGeoNamesCitySource } from "./geoNamesCitySource";
import { createZoneCitiesSource } from "./zoneCitiesSource";

/** Match kinds, best first. */
const MATCH_KIND_ORDER: readonly SearchMatchKind[] = [
  SearchMatchKind.ABBREVIATION,
  SearchMatchKind.CITY_PREFIX,
  SearchMatchKind.CITY_WORD_PREFIX,
  SearchMatchKind.COUNTRY,
];

const kindPosition = (matchKind: SearchMatchKind): number =>
  MATCH_KIND_ORDER.indexOf(matchKind);

/**
 * Keeps one result per city: the first one. Abbreviation results come first
 * and each source returns one result per record at its best kind, so the
 * first result of a city is its best. Namesakes in one zone are two cities.
 * Implements FR4 of add-geonames-city-source (D7).
 */
function keepFirstResultPerCity(
  results: readonly CitySearchResult[],
): CitySearchResult[] {
  const firstById = new Map<string, CitySearchResult>();
  for (const result of results) {
    if (!firstById.has(result.record.id)) {
      firstById.set(result.record.id, result);
    }
  }
  return [...firstById.values()];
}

const isZoneCity = (record: CityRecord): boolean =>
  record.id === record.timeZoneId;

/**
 * Orders results: kind, then, among country matches, zone cities first, then
 * popularity rank, population and the name.
 * Implements FR5 of add-geonames-city-source (D7).
 */
function createResultComparator(language: CityNameLanguage) {
  const collator = new Intl.Collator(language);
  return (first: CitySearchResult, second: CitySearchResult): number => {
    const byKind =
      kindPosition(first.matchKind) - kindPosition(second.matchKind);
    if (byKind !== 0) return byKind;
    if (first.matchKind === SearchMatchKind.COUNTRY) {
      const byZoneCity =
        Number(isZoneCity(second.record)) - Number(isZoneCity(first.record));
      if (byZoneCity !== 0) return byZoneCity;
    }
    return (
      second.record.rank - first.record.rank ||
      second.record.population - first.record.population ||
      collator.compare(
        first.record.names[language],
        second.record.names[language],
      )
    );
  };
}

/** Zone → its records, the zone city first, then by population; built once, without normalization. */
function groupRecordsByZone(
  zoneRecords: readonly CityRecord[],
  geoNamesRecords: readonly CityRecord[],
): Map<string, CityRecord[]> {
  const recordsByZone = new Map<string, CityRecord[]>(
    zoneRecords.map((record) => [record.timeZoneId, [record]]),
  );
  const byPopulation = [...geoNamesRecords].sort(
    (first, second) => second.population - first.population,
  );
  for (const record of byPopulation) {
    const zoneRecordsOfZone = recordsByZone.get(record.timeZoneId);
    if (zoneRecordsOfZone) zoneRecordsOfZone.push(record);
    else recordsByZone.set(record.timeZoneId, [record]);
  }
  return recordsByZone;
}

/**
 * Searches zone cities, GeoNames cities and abbreviations together, merges
 * the results per city and ranks them: kind, then popularity, then population,
 * then name.
 * Implements FR1–FR7, NFR-P1 of add-locations-via-search (D7, ADR-0006).
 * Implements FR5 of add-interface-language-selection (D5): matches names of the active language.
 * Implements FR1 of show-city-labels-in-interface-language (D2): getCityLabel.
 * Implements FR11, NFR-P3 of show-zone-abbreviations-and-zone-label-setting (D8): abbreviation results rank like the other kinds.
 * Implements FR3–FR6, FR8, FR9 of add-geonames-city-source (D7).
 */
export function createCompositeCitySearch(
  zoneCityRecords: readonly ZoneCityData[],
  cityData: GeoNamesCityData = EMPTY_GEONAMES_CITY_DATA,
): CitySearch {
  const readCountryTexts = createCountryTextCache();
  const zoneSource = createZoneCitiesSource(
    zoneCityRecords,
    undefined,
    cityData,
    readCountryTexts,
  );
  const geoNamesSource = createGeoNamesCitySource(
    cityData,
    undefined,
    readCountryTexts,
  );
  const recordsByZone = groupRecordsByZone(
    zoneSource.records,
    geoNamesSource.records,
  );
  const abbreviationSource = createAbbreviationSource(zoneSource.records);
  const recordsById = new Map(
    zoneSource.records.map((record) => [record.id, record]),
  );

  return {
    search(query: string, language: CityNameLanguage) {
      const normalizedQuery = normalizeSearchText(query);
      if (normalizedQuery === "") return [];
      const uniqueResults = keepFirstResultPerCity([
        ...abbreviationSource.match(normalizedQuery),
        ...zoneSource.match(normalizedQuery),
        ...geoNamesSource.match(normalizedQuery),
      ]);
      const orderedResults = uniqueResults.sort(
        createResultComparator(language),
      );
      return orderedResults.slice(0, MAX_SEARCH_RESULTS);
    },
    getExemplarCity: (timeZoneId, language) =>
      recordsById.get(timeZoneId)?.names[language] ??
      deriveCityNameFromTimeZoneId(timeZoneId),
    getCityLabel: (timeZoneId, storedLabel, language) =>
      recordsByZone
        .get(timeZoneId)
        ?.find((record) => isCityNameOfRecord(record, storedLabel))?.names[
        language
      ] ?? storedLabel,
    suggest: () =>
      POPULAR_TIME_ZONE_IDS.flatMap((zoneId) => {
        const record = recordsById.get(zoneId);
        return record
          ? [{ record, matchKind: SearchMatchKind.SUGGESTION }]
          : [];
      }),
  };
}
