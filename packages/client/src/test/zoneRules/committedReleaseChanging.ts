/**
 * A release built from the committed one (the active release of every unit
 * test) that differs from it only in the named zones: each gets another UTC
 * offset for good, or is left out when listed in `removedZoneIds`.
 * Implements FR8 of apply-data-updates-silently.
 */
import zoneRulesDocument from "virtual:zone-rules";

type DocumentZone = { types: [number, string, number][]; futureRule: string };
type ReleaseDocument = {
  release: string;
  zones: Record<string, DocumentZone | string>;
};

const SECONDS_PER_HOUR = 3600;

const resolveZone = (zones: ReleaseDocument["zones"], zoneId: string) => {
  const zone = zones[zoneId];
  return typeof zone === "string" ? (zones[zone] as DocumentZone) : zone;
};

export function buildReleaseChangingZones(
  release: string,
  changedZoneIds: readonly string[],
  removedZoneIds: readonly string[] = [],
): unknown {
  const document = structuredClone(zoneRulesDocument) as ReleaseDocument;
  for (const zoneId of changedZoneIds) {
    const zone = structuredClone(
      resolveZone(document.zones, zoneId),
    ) as DocumentZone;
    zone.types = zone.types.map(([offset, designation, flag]) => [
      offset + SECONDS_PER_HOUR,
      designation,
      flag,
    ]);
    zone.futureRule = "";
    document.zones[zoneId] = zone;
  }
  for (const zoneId of removedZoneIds) delete document.zones[zoneId];
  return { ...document, release };
}
