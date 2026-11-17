/**
 * Whether a stored release changes the rules of a zone from an instant on
 * (design D4): the local time type in force, the listed clock changes after
 * the instant and the rule after the listed changes, compared by value.
 * Differences before the instant do not count, and a link is compared by the
 * rules it leads to, which the release already resolves.
 * Implements FR8, NFR-P2 of apply-data-updates-silently (D4).
 */
import { getLocalTimeType } from "./localTimeType.ts";
import type { ZoneRules, ZoneRulesRelease } from "./zoneRulesRelease.ts";

/** Rules are plain data that one reader builds in one key order, so their JSON is their value. */
const isSameValue = (first: unknown, second: unknown): boolean =>
  JSON.stringify(first) === JSON.stringify(second);

const getChangesAfter = (zoneRules: ZoneRules, epochSeconds: number) =>
  zoneRules.changes.filter((change) => change.epochSeconds > epochSeconds);

export function hasZoneRulesChangeFrom(
  activeRules: ZoneRules,
  storedRules: ZoneRules,
  epochSeconds: number,
): boolean {
  return (
    !isSameValue(
      getLocalTimeType(activeRules, epochSeconds),
      getLocalTimeType(storedRules, epochSeconds),
    ) ||
    !isSameValue(
      getChangesAfter(activeRules, epochSeconds),
      getChangesAfter(storedRules, epochSeconds),
    ) ||
    !isSameValue(activeRules.futureRule, storedRules.futureRule)
  );
}

/**
 * The given zones whose rules the stored release changes from the instant on.
 * Reads each given zone once from each release, so the zones passed in are
 * exactly the zones compared.
 */
export function findChangedZones(
  activeRelease: ZoneRulesRelease,
  storedRelease: ZoneRulesRelease,
  zoneIds: readonly string[],
  epochSeconds: number,
): string[] {
  return zoneIds.filter((zoneId) => {
    const activeRules = activeRelease.zones.get(zoneId);
    const storedRules = storedRelease.zones.get(zoneId);
    if (activeRules === undefined || storedRules === undefined) {
      return activeRules !== storedRules;
    }
    return hasZoneRulesChangeFrom(activeRules, storedRules, epochSeconds);
  });
}
