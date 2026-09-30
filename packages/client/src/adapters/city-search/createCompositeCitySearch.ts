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

/** Keeps one result per zone: the one with the best match kind. */
function keepBestResultPerZone(
  results: readonly CitySearchResult[],
): CitySearchResult[] {
  const bestByZoneId = new Map<string, CitySearchResult>();
  for (const result of results) {
    const known = bestByZoneId.get(result.record.timeZoneId);
    const isBetter =
      known === undefined ||
      kindPosition(result.matchKind) < kindPosition(known.matchKind);
    if (isBetter) bestByZoneId.set(result.record.timeZoneId, result);
  }
  return [...bestByZoneId.values()];
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
      const uniqueResults = keepBestResultPerZone([
        ...abbreviationSource.match(normalizedQuery),
        ...zoneSource.match(normalizedQuery),
      ]);
      const orderedResults = uniqueResults
        .map((result, position) => ({ result, position }))
        .sort((first, second) => {
          const byKind =
            kindPosition(first.result.matchKind) -
            kindPosition(second.result.matchKind);
          if (byKind !== 0) return byKind;
          if (first.result.matchKind === SearchMatchKind.ABBREVIATION) {
            return first.position - second.position;
          }
          return (
            second.result.record.rank - first.result.record.rank ||
            collator.compare(
              first.result.record.names[language],
              second.result.record.names[language],
            )
          );
        })
        .map(({ result }) => result);
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
