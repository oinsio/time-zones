/**
 * Truncates a compiled zone to the cutoff (design D1, D7): drops the changes at
 * or before the cutoff, keeps the type in force at it, drops the types nothing
 * uses and re-indexes. When no listed change follows the cutoff, the cutoff
 * type is the one the future rule gives at the cutoff, from the same owner the
 * app uses; with an empty footer it is the last type.
 * Implements FR2 of add-zone-rules-from-iana.
 */
import {
  type LocalTimeType,
  parseFutureRule,
  resolveFutureRule,
  ZONE_RULES_CUTOFF_EPOCH_SECONDS,
} from "../../src/lib/zoneRules/core/index.ts";
import type { TzifZone } from "./readTzif.ts";

/** `[utcOffsetSeconds, designation, isDaylightSavingTime as 0 or 1]`. */
export type ReleaseType = [number, string, number];

/** One zone of the release document (design D1). */
export type ReleaseZone = {
  types: ReleaseType[];
  cutoffType: number;
  changes: [secondsSinceCutoff: number, typeIndex: number][];
  futureRule: string;
};

function toReleaseType(type: LocalTimeType): ReleaseType {
  return [
    type.utcOffsetSeconds,
    type.designation,
    type.isDaylightSavingTime ? 1 : 0,
  ];
}

function isSameType(first: ReleaseType, second: ReleaseType): boolean {
  return (
    first[0] === second[0] && first[1] === second[1] && first[2] === second[2]
  );
}

function findCutoffType(zone: TzifZone): LocalTimeType {
  const [firstType] = zone.types;
  const lastBeforeCutoff = zone.transitions.findLast(
    ([epochSeconds]) => epochSeconds <= ZONE_RULES_CUTOFF_EPOCH_SECONDS,
  );
  const hasChangeAfterCutoff = zone.transitions.some(
    ([epochSeconds]) => epochSeconds > ZONE_RULES_CUTOFF_EPOCH_SECONDS,
  );
  if (!hasChangeAfterCutoff && zone.footer !== "") {
    const futureRule = parseFutureRule(zone.footer);
    if (!futureRule) {
      throw new Error(`The footer "${zone.footer}" is not a future rule`);
    }
    return resolveFutureRule(futureRule, ZONE_RULES_CUTOFF_EPOCH_SECONDS);
  }
  const typeIndex = lastBeforeCutoff ? lastBeforeCutoff[1] : 0;
  return (zone.types[typeIndex] ?? firstType) as LocalTimeType;
}

export function truncateToCutoff(zone: TzifZone): ReleaseZone {
  const types: ReleaseType[] = [];
  const indexOfType = (type: LocalTimeType): number => {
    const releaseType = toReleaseType(type);
    const knownIndex = types.findIndex((known) =>
      isSameType(known, releaseType),
    );
    if (knownIndex >= 0) return knownIndex;
    types.push(releaseType);
    return types.length - 1;
  };
  const cutoffType = indexOfType(findCutoffType(zone));
  const changes: ReleaseZone["changes"] = [];
  for (const [epochSeconds, typeIndex] of zone.transitions) {
    if (epochSeconds <= ZONE_RULES_CUTOFF_EPOCH_SECONDS) continue;
    changes.push([
      epochSeconds - ZONE_RULES_CUTOFF_EPOCH_SECONDS,
      indexOfType(zone.types[typeIndex] as LocalTimeType),
    ]);
  }
  return { types, cutoffType, changes, futureRule: zone.footer };
}
