/**
 * The local time type of a zone at an instant (design D4): before the cutoff
 * the cutoff type; up to the last listed clock change the type after the
 * latest change at or before the instant; after it the type the future rule
 * gives, else the last type. It never predicts from the listed changes.
 * Implements FR4 of add-zone-rules-from-iana.
 */
import { resolveFutureRule } from "./futureRuleOffset.ts";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";
import type { LocalTimeType, ZoneRules } from "./zoneRulesRelease.ts";

const NO_CHANGE_AT_OR_BEFORE = -1;

/** Index of the latest change at or before the instant, by binary search. */
function findLatestChangeIndex(
  changes: ZoneRules["changes"],
  epochSeconds: number,
): number {
  let low = 0;
  let high = changes.length - 1;
  let latestIndex = NO_CHANGE_AT_OR_BEFORE;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (changes[middle].epochSeconds <= epochSeconds) {
      latestIndex = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return latestIndex;
}

export function getLocalTimeType(
  zoneRules: ZoneRules,
  epochSeconds: number,
): LocalTimeType {
  const { changes, cutoffType, futureRule } = zoneRules;
  if (epochSeconds < ZONE_RULES_CUTOFF_EPOCH_SECONDS) return cutoffType;
  const latestIndex = findLatestChangeIndex(changes, epochSeconds);
  const isAfterLastChange = latestIndex === changes.length - 1;
  if (isAfterLastChange && futureRule) {
    return resolveFutureRule(futureRule, epochSeconds);
  }
  return latestIndex === NO_CHANGE_AT_OR_BEFORE
    ? cutoffType
    : changes[latestIndex].localTimeType;
}
