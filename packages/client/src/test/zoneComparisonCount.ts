/**
 * Counts the zones `findChangedZones` compares, at the `@/lib/zoneRules`
 * import that the controller uses. `findChangedZones` reads each given zone
 * once per release, so the zone ids it is given are the zones compared. Install
 * it with `vi.mock("@/lib/zoneRules", ...)` wrapping the real function in
 * `countFindChangedZones`.
 * Verifies NFR-P2 of apply-data-updates-silently (D5).
 */
import type { findChangedZones } from "@/lib/zoneRules";

type FindChangedZones = typeof findChangedZones;

let comparedByZone: Map<string, number> | undefined;

export function countFindChangedZones(
  original: FindChangedZones,
): FindChangedZones {
  return (activeRelease, storedRelease, zoneIds, epochSeconds) => {
    if (comparedByZone !== undefined) {
      for (const zoneId of zoneIds) {
        comparedByZone.set(zoneId, (comparedByZone.get(zoneId) ?? 0) + 1);
      }
    }
    return original(activeRelease, storedRelease, zoneIds, epochSeconds);
  };
}

export function startZoneComparisonCount() {
  const counts = new Map<string, number>();
  comparedByZone = counts;
  return {
    /** The zones compared so far, each comparison of a zone counted once. */
    comparedZones: () =>
      [...counts.values()].reduce((total, count) => total + count, 0),
    comparedZonesByZone: (): ReadonlyMap<string, number> => new Map(counts),
    stop: () => {
      comparedByZone = undefined;
    },
  };
}
