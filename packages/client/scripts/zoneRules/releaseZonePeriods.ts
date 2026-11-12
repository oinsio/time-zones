/**
 * Reads the periods of a zone from the zone rules release, for the zone
 * abbreviation table: the cutoff type until the first change, each change
 * until the next, and for a zone with a future rule the periods of the rules
 * year and the next one, found from `resolveFutureRule`.
 * Implements FR9 of add-zone-rules-from-iana (design D8).
 */
import {
  getEpochDayFromCivilDate,
  type LocalTimeType,
  resolveFutureRule,
  SECONDS_PER_DAY,
  SECONDS_PER_MINUTE,
  type ZoneRules,
  type ZoneRulesRelease,
} from "../../src/lib/zoneRules/core/index.ts";
import {
  ZONE_ABBREVIATION_RULES_YEAR,
  type ZonePeriod,
} from "../zoneData/extractZoneAbbreviations.ts";

const MILLISECONDS_PER_SECOND = 1000;
const JANUARY = 1;
const FIRST_DAY_OF_MONTH = 1;
/** The future rule is read through the year after the rules year. */
const FUTURE_RULE_LAST_YEAR = ZONE_ABBREVIATION_RULES_YEAR + 1;

function toPeriod(
  localTimeType: LocalTimeType,
  untilEpochSeconds: number,
): ZonePeriod {
  return {
    designation: localTimeType.designation,
    utcOffsetMinutes: localTimeType.utcOffsetSeconds / SECONDS_PER_MINUTE,
    untilEpochMilliseconds: untilEpochSeconds * MILLISECONDS_PER_SECOND,
  };
}

function isSameLocalTimeType(
  first: LocalTimeType,
  second: LocalTimeType,
): boolean {
  return (
    first.utcOffsetSeconds === second.utcOffsetSeconds &&
    first.designation === second.designation
  );
}

function getYearStartEpochSeconds(year: number): number {
  return (
    getEpochDayFromCivilDate(year, JANUARY, FIRST_DAY_OF_MONTH) *
    SECONDS_PER_DAY
  );
}

/** The first second at which the rule gives another type than `before`, searched in (low, high]. */
function findTransitionSecond(
  rule: NonNullable<ZoneRules["futureRule"]>,
  before: LocalTimeType,
  lowEpochSeconds: number,
  highEpochSeconds: number,
): number {
  let low = lowEpochSeconds;
  let high = highEpochSeconds;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (isSameLocalTimeType(resolveFutureRule(rule, middle), before)) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return high;
}

/** The periods the future rule gives from the start instant to the end of the last year read. */
function readFutureRulePeriods(
  rule: NonNullable<ZoneRules["futureRule"]>,
  startEpochSeconds: number,
): ZonePeriod[] {
  const scanStart = Math.max(
    startEpochSeconds,
    getYearStartEpochSeconds(ZONE_ABBREVIATION_RULES_YEAR) - SECONDS_PER_DAY,
  );
  const scanEnd = getYearStartEpochSeconds(FUTURE_RULE_LAST_YEAR + 1);
  const periods: ZonePeriod[] = [];
  let current = resolveFutureRule(rule, scanStart);
  let previousSample = scanStart;
  for (
    let sample = scanStart + SECONDS_PER_DAY;
    sample <= scanEnd;
    sample += SECONDS_PER_DAY
  ) {
    const sampled = resolveFutureRule(rule, sample);
    if (!isSameLocalTimeType(sampled, current)) {
      periods.push(
        toPeriod(
          current,
          findTransitionSecond(rule, current, previousSample, sample),
        ),
      );
      current = sampled;
    }
    previousSample = sample;
  }
  periods.push(toPeriod(current, Infinity));
  return periods;
}

function readZoneRulesPeriods(zoneRules: ZoneRules): ZonePeriod[] {
  const { cutoffType, changes, futureRule } = zoneRules;
  const periods: ZonePeriod[] = [];
  let currentType = cutoffType;
  let lastChangeEpochSeconds = -Infinity;
  for (const change of changes) {
    periods.push(toPeriod(currentType, change.epochSeconds));
    currentType = change.localTimeType;
    lastChangeEpochSeconds = change.epochSeconds;
  }
  if (futureRule === undefined) {
    periods.push(toPeriod(currentType, Infinity));
    return periods;
  }
  return [
    ...periods,
    ...readFutureRulePeriods(futureRule, lastChangeEpochSeconds),
  ];
}

export function readReleaseZonePeriods(
  release: ZoneRulesRelease,
  zoneId: string,
): readonly ZonePeriod[] | undefined {
  const zoneRules = release.zones.get(zoneId);
  return zoneRules === undefined ? undefined : readZoneRulesPeriods(zoneRules);
}
