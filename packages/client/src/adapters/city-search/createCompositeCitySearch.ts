import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import {
  type CitySearch,
  type CitySearchResult,
  SearchMatchKind,
} from "@/ports";
import { createAbbreviationSource } from "./abbreviationSource";
import type { ZoneCityData } from "./citySource";
import { normalizeSearchText } from "./normalizeSearchText";
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
 * Keeps one result per zone: the first one. Abbreviation results come first
 * and the zone source returns one result per zone at its best kind, so the
 * first result of a zone is its best.
 */
function keepFirstResultPerZone(
  results: readonly CitySearchResult[],
): CitySearchResult[] {
  const firstByZoneId = new Map<string, CitySearchResult>();
  for (const result of results) {
    if (!firstByZoneId.has(result.record.timeZoneId)) {
      firstByZoneId.set(result.record.timeZoneId, result);
    }
  }
  return [...firstByZoneId.values()];
}

/**
 * Searches zone cities and abbreviations together, merges the results and
 * ranks them: kind, then popularity, then name (abbreviations keep the order
 * of the abbreviation table).
 * Implements FR1–FR7, NFR-P1 of add-locations-via-search (D7, ADR-0006).
 */
export function createCompositeCitySearch(
  zoneCityRecords: readonly ZoneCityData[],
): CitySearch {
  const zoneSource = createZoneCitiesSource(zoneCityRecords);
  const abbreviationSource = createAbbreviationSource(zoneSource.records);
  const recordsById = new Map(
    zoneSource.records.map((record) => [record.id, record]),
  );

  return {
    search(query: string, language: SupportedLanguage) {
      const normalizedQuery = normalizeSearchText(query);
      if (normalizedQuery === "") return [];
      const collator = new Intl.Collator(language);
      const uniqueResults = keepFirstResultPerZone([
        ...abbreviationSource.match(normalizedQuery),
        ...zoneSource.match(normalizedQuery),
      ]);
      const orderedResults = uniqueResults.sort((first, second) => {
        const byKind =
          kindPosition(first.matchKind) - kindPosition(second.matchKind);
        if (byKind !== 0) return byKind;
        if (first.matchKind === SearchMatchKind.ABBREVIATION) {
          return 0; // the sort is stable: table order is kept
        }
        return (
          second.record.rank - first.record.rank ||
          collator.compare(
            first.record.names[language],
            second.record.names[language],
          )
        );
      });
      return orderedResults.slice(0, MAX_SEARCH_RESULTS);
    },
    suggest: () =>
      POPULAR_TIME_ZONE_IDS.flatMap((zoneId) => {
        const record = recordsById.get(zoneId);
        return record
          ? [{ record, matchKind: SearchMatchKind.SUGGESTION }]
          : [];
      }),
  };
}
