/**
 * Evaluates the future rule at an instant (design D4). Each transition is the
 * rule's local wall time in the type in force before it, converted to UTC. The
 * transitions of the instant's UTC year and of both neighbouring years are
 * considered, because an hour outside 0-24 or a negative daylight saving time
 * moves a transition across a year boundary. Instants per (rule, year) are
 * memoized on the parsed rule.
 * Implements FR3 of add-zone-rules-from-iana.
 */
import {
  getDaysInMonth,
  getEpochDayFromCivilDate,
  getWeekdayOfEpochDay,
  getYearOfEpochDay,
  isLeapYear,
} from "./epochDays.ts";
import type { FutureRule, RuleDate } from "./futureRule.ts";
import {
  DAYS_PER_WEEK,
  RuleDateKind,
  SECONDS_PER_DAY,
} from "./zoneRulesConstants.ts";
import type { LocalTimeType } from "./zoneRulesRelease.ts";

type DaylightRule = NonNullable<FutureRule["daylight"]>;

type RuleCache = {
  standardType: LocalTimeType;
  daylightType: LocalTimeType | undefined;
  transitionsByYear: Map<number, YearTransitions>;
};

type YearTransitions = {
  startEpochSeconds: number;
  endEpochSeconds: number;
};

const NEIGHBOURING_YEARS = [-1, 0, 1];
const JANUARY = 1;
const FIRST_DAY = 1;
const LEAP_DAY_JULIAN_NUMBER = 60;

const cachesByRule = new WeakMap<FutureRule, RuleCache>();

function buildCache(rule: FutureRule): RuleCache {
  const { daylight, standard } = rule;
  return {
    standardType: {
      utcOffsetSeconds: standard.offsetSeconds,
      designation: standard.designation,
      isDaylightSavingTime: false,
    },
    daylightType: daylight && {
      utcOffsetSeconds: daylight.offsetSeconds,
      designation: daylight.designation,
      isDaylightSavingTime: true,
    },
    transitionsByYear: new Map(),
  };
}

function getCache(rule: FutureRule): RuleCache {
  const knownCache = cachesByRule.get(rule);
  if (knownCache) return knownCache;
  const cache = buildCache(rule);
  cachesByRule.set(rule, cache);
  return cache;
}

function getMonthWeekDayEpochDay(
  year: number,
  date: Extract<RuleDate, { kind: typeof RuleDateKind.MONTH_WEEK_DAY }>,
): number {
  const firstOfMonth = getEpochDayFromCivilDate(year, date.month, FIRST_DAY);
  const daysToFirstMatch =
    (date.weekday - getWeekdayOfEpochDay(firstOfMonth) + DAYS_PER_WEEK) %
    DAYS_PER_WEEK;
  let epochDay =
    firstOfMonth + daysToFirstMatch + (date.week - 1) * DAYS_PER_WEEK;
  while (epochDay >= firstOfMonth + getDaysInMonth(year, date.month)) {
    epochDay -= DAYS_PER_WEEK;
  }
  return epochDay;
}

function getRuleDateEpochDay(year: number, date: RuleDate): number {
  const yearStart = getEpochDayFromCivilDate(year, JANUARY, FIRST_DAY);
  switch (date.kind) {
    case RuleDateKind.MONTH_WEEK_DAY:
      return getMonthWeekDayEpochDay(year, date);
    case RuleDateKind.ZERO_BASED:
      return yearStart + date.day;
    case RuleDateKind.JULIAN_NO_LEAP: {
      const skipsLeapDay =
        isLeapYear(year) && date.day >= LEAP_DAY_JULIAN_NUMBER;
      return yearStart + date.day - 1 + (skipsLeapDay ? 1 : 0);
    }
  }
}

/** The transition as an instant: local wall time in the type in force before it. */
function getTransitionEpochSeconds(
  year: number,
  date: RuleDate,
  offsetBeforeSeconds: number,
): number {
  return (
    getRuleDateEpochDay(year, date) * SECONDS_PER_DAY +
    date.timeSeconds -
    offsetBeforeSeconds
  );
}

function getYearTransitions(
  cache: RuleCache,
  daylight: DaylightRule,
  year: number,
): YearTransitions {
  const knownTransitions = cache.transitionsByYear.get(year);
  if (knownTransitions) return knownTransitions;
  const transitions = {
    startEpochSeconds: getTransitionEpochSeconds(
      year,
      daylight.start,
      cache.standardType.utcOffsetSeconds,
    ),
    endEpochSeconds: getTransitionEpochSeconds(
      year,
      daylight.end,
      daylight.offsetSeconds,
    ),
  };
  cache.transitionsByYear.set(year, transitions);
  return transitions;
}

/** The type in force at the instant, from the rule alone. */
export function resolveFutureRule(
  rule: FutureRule,
  epochSeconds: number,
): LocalTimeType {
  const cache = getCache(rule);
  const { daylight } = rule;
  if (!daylight || !cache.daylightType) return cache.standardType;
  const year = getYearOfEpochDay(Math.floor(epochSeconds / SECONDS_PER_DAY));
  let latestEpochSeconds = -Infinity;
  let typeInForce = cache.standardType;
  for (const yearShift of NEIGHBOURING_YEARS) {
    const { startEpochSeconds, endEpochSeconds } = getYearTransitions(
      cache,
      daylight,
      year + yearShift,
    );
    if (
      endEpochSeconds <= epochSeconds &&
      endEpochSeconds >= latestEpochSeconds
    ) {
      latestEpochSeconds = endEpochSeconds;
      typeInForce = cache.standardType;
    }
    // At a tie the start wins: the daylight type begins where the standard type ends.
    if (
      startEpochSeconds <= epochSeconds &&
      startEpochSeconds >= latestEpochSeconds
    ) {
      latestEpochSeconds = startEpochSeconds;
      typeInForce = cache.daylightType;
    }
  }
  return typeInForce;
}
