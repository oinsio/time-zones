/**
 * Zone rules fixtures of a zone that behaves like Lisbon: the rules of the
 * tests of the difference between two releases and of its scenarios.
 * Implements FR8 of apply-data-updates-silently.
 */

import { Temporal } from "@/lib/temporal";
import {
  type ListedClockChange,
  type LocalTimeType,
  MILLISECONDS_PER_SECOND,
  parseFutureRule,
  type ZoneRules,
  type ZoneRulesRelease,
} from "@/lib/zoneRules";

export const instantSeconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND;
export const COMPARISON_SECONDS = instantSeconds("2026-11-15T12:00:00Z");
export const AFTER_LAST_CHANGE_SECONDS = instantSeconds("2031-06-01T12:00:00Z");

export const WINTER: LocalTimeType = {
  utcOffsetSeconds: 0,
  designation: "WET",
  isDaylightSavingTime: false,
};
export const SUMMER: LocalTimeType = {
  utcOffsetSeconds: 3600,
  designation: "WEST",
  isDaylightSavingTime: true,
};
export const MARCH_2027 = "2027-03-28T01:00:00Z";
export const OCTOBER_2027 = "2027-10-31T01:00:00Z";
export const FUTURE_RULE_TEXT = "WET0WEST,M3.5.0/1,M10.5.0";

export const clockChange = (
  instant: string,
  localTimeType: LocalTimeType,
): ListedClockChange => ({
  epochSeconds: instantSeconds(instant),
  localTimeType,
});

/** Indexes: 0 and 1 in the past, 2 starts 2026 summer, 3 is in force at the comparison, 4 and 5 are later. */
export const lisbonLikeChanges = (): ListedClockChange[] => [
  clockChange("2009-03-29T01:00:00Z", SUMMER),
  clockChange("2009-10-25T01:00:00Z", WINTER),
  clockChange("2026-03-29T01:00:00Z", SUMMER),
  clockChange("2026-10-25T01:00:00Z", WINTER),
  clockChange(MARCH_2027, SUMMER),
  clockChange(OCTOBER_2027, WINTER),
];
export const IN_FORCE_INDEX = 3;
export const LATER_INDEX = 4;
export const PAST_INDEX = 0;

export function createZone(overrides: Partial<ZoneRules> = {}): ZoneRules {
  return {
    types: [WINTER, SUMMER],
    cutoffType: WINTER,
    changes: lisbonLikeChanges(),
    futureRule: parseFutureRule(FUTURE_RULE_TEXT),
    ...overrides,
  };
}

export const changesWith = (
  index: number,
  change: Partial<ListedClockChange>,
): ListedClockChange[] =>
  lisbonLikeChanges().map((listed, position) =>
    position === index ? { ...listed, ...change } : listed,
  );

export const releaseOf = (
  zones: Record<string, ZoneRules>,
  release = "2026f",
): ZoneRulesRelease => ({ release, zones: new Map(Object.entries(zones)) });
