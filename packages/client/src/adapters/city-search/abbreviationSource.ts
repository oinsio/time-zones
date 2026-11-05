import { getZoneAbbreviations } from "@/model";
import type { CityRecord, CitySearchResult } from "@/ports";
import { SearchMatchKind } from "@/ports";
import type { CitySource } from "./citySource";

/**
 * Matches a query that equals a whole zone abbreviation to every zone whose
 * abbreviation pair holds it, in record order. Built from the zone records
 * because the names shown for a zone come from that data.
 * Implements FR4 of add-locations-via-search (D7).
 * Implements FR8, FR9, FR11 of show-zone-abbreviations-and-zone-label-setting (D8): reads the zone abbreviation table.
 */
export function createAbbreviationSource(
  zoneRecords: readonly CityRecord[],
): CitySource {
  const resultsByAbbreviation = new Map<string, CitySearchResult[]>();
  for (const record of zoneRecords) {
    for (const abbreviation of getZoneAbbreviations(record.timeZoneId)) {
      const key = abbreviation.toUpperCase();
      const results = resultsByAbbreviation.get(key) ?? [];
      results.push({
        record,
        matchKind: SearchMatchKind.ABBREVIATION,
        matchedAbbreviation: abbreviation,
      });
      resultsByAbbreviation.set(key, results);
    }
  }
  return {
    records: zoneRecords,
    match: (normalizedQuery) =>
      resultsByAbbreviation.get(normalizedQuery.toUpperCase()) ?? [],
  };
}
