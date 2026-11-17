/**
 * Whether a stored release changes the rules of a zone from an instant on
 * (design D4): the local time type in force, the listed clock changes after
 * the instant and the rule after the listed changes, compared by value.
 * Differences before the instant do not count, and a link is compared by the
 * rules it leads to, which the release already resolves.
 * Implements FR8, NFR-P2 of apply-data-updates-silently (D4).
 */
import { getLocalTimeType } from "./localTimeType.ts";
import type {
  ListedClockChange,
  LocalTimeType,
  ZoneRules,
  ZoneRulesRelease,
} from "./zoneRulesRelease.ts";

const areLocalTimeTypesEqual = (
  first: LocalTimeType,
  second: LocalTimeType,
): boolean =>
  first.utcOffsetSeconds === second.utcOffsetSeconds &&
  first.designation === second.designation &&
  first.isDaylightSavingTime === second.isDaylightSavingTime;

const areClockChangesEqual = (
  first: ListedClockChange,
  second: ListedClockChange,
): boolean =>
  first.epochSeconds === second.epochSeconds &&
  areLocalTimeTypesEqual(first.localTimeType, second.localTimeType);

const getChangesAfter = (
  zoneRules: ZoneRules,
  epochSeconds: number,
): ListedClockChange[] =>
  zoneRules.changes.filter((change) => change.epochSeconds > epochSeconds);

/** The future rule is plain data built by one parser, so its JSON is its value. */
const areFutureRulesEqual = (first: ZoneRules, second: ZoneRules): boolean =>
  JSON.stringify(first.futureRule) === JSON.stringify(second.futureRule);

export function hasZoneRulesChangeFrom(
  activeRules: ZoneRules,
  storedRules: ZoneRules,
  epochSeconds: number,
): boolean {
  if (
    !areLocalTimeTypesEqual(
      getLocalTimeType(activeRules, epochSeconds),
      getLocalTimeType(storedRules, epochSeconds),
    )
  ) {
    return true;
  }
  const activeChanges = getChangesAfter(activeRules, epochSeconds);
  const storedChanges = getChangesAfter(storedRules, epochSeconds);
  return (
    activeChanges.length !== storedChanges.length ||
    activeChanges.some(
      (change, index) =>
        !areClockChangesEqual(
          change,
          storedChanges[index] as ListedClockChange,
        ),
    ) ||
    !areFutureRulesEqual(activeRules, storedRules)
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
