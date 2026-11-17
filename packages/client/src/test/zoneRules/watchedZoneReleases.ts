/**
 * Releases with named zones, for the tests of the zone rules update notice:
 * the stored release changes only the zones named in `changedZoneIds`.
 * Implements FR8, FR9, FR10 of apply-data-updates-silently.
 */
import { parseZoneRulesRelease, type ZoneRulesRelease } from "@/lib/zoneRules";
import { buildDocument } from "./releaseDocuments";

const SECONDS_PER_HOUR = 3600;

const fixedOffsetZone = (utcOffsetHours: number) => ({
  types: [[utcOffsetHours * SECONDS_PER_HOUR, "ZONE", 0]],
  cutoffType: 0,
  changes: [],
  futureRule: "",
});

export const LISBON_ZONE_ID = "Europe/Lisbon";
export const CAIRO_ZONE_ID = "Africa/Cairo";
export const MOSCOW_ZONE_ID = "Europe/Moscow";
export const ASUNCION_ZONE_ID = "America/Asuncion";

const ZONE_OFFSET_HOURS: Record<string, number> = {
  [LISBON_ZONE_ID]: 0,
  [CAIRO_ZONE_ID]: 2,
  [MOSCOW_ZONE_ID]: 3,
  [ASUNCION_ZONE_ID]: -3,
};

/** The document of a release; a zone in `changedZoneIds` has another UTC offset than in the others. */
export function buildWatchedZonesDocument(
  release: string,
  changedZoneIds: readonly string[] = [],
) {
  const zones = Object.fromEntries(
    Object.entries(ZONE_OFFSET_HOURS).map(([zoneId, offsetHours]) => [
      zoneId,
      fixedOffsetZone(offsetHours + (changedZoneIds.includes(zoneId) ? 1 : 0)),
    ]),
  );
  return buildDocument({ release, zones });
}

export function parseWatchedZonesRelease(
  release: string,
  changedZoneIds: readonly string[] = [],
): ZoneRulesRelease {
  return parseZoneRulesRelease(
    buildWatchedZonesDocument(release, changedZoneIds),
  ) as ZoneRulesRelease;
}
