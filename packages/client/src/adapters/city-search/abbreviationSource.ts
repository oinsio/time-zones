import type { CityRecord } from "@/ports";
import { SearchMatchKind } from "@/ports";
import type { CitySource } from "./citySource";
import { TIME_ZONE_ABBREVIATIONS } from "./timeZoneAbbreviations";

/**
 * Matches a query that equals a whole abbreviation of the app's own table to
 * every zone it maps to, in table order. Built from the zone records because
 * the names shown for a zone come from that data.
 * Implements FR4 of add-locations-via-search (D7).
 */
export function createAbbreviationSource(
  zoneRecords: readonly CityRecord[],
): CitySource {
  const recordsByZoneId = new Map(
    zoneRecords.map((record) => [record.timeZoneId, record]),
  );
  const zoneIdsByAbbreviation = new Map(
    Object.entries(TIME_ZONE_ABBREVIATIONS),
  );
  return {
    records: zoneRecords,
    match: (normalizedQuery) => {
      const abbreviation = normalizedQuery.toUpperCase();
      const zoneIds = zoneIdsByAbbreviation.get(abbreviation) ?? [];
      return zoneIds.flatMap((zoneId) => {
        const record = recordsByZoneId.get(zoneId);
        return record
          ? [
              {
                record,
                matchKind: SearchMatchKind.ABBREVIATION,
                matchedAbbreviation: abbreviation,
              },
            ]
          : [];
      });
    },
  };
}
