/**
 * Constants of the zone rules core. This file imports nothing: Node loads it in
 * strip-only TypeScript mode, so it holds no `enum` (design D11).
 * Implements FR2, FR3, FR9 of add-zone-rules-from-iana.
 */

/** The cutoff: `2000-01-01T00:00:00Z`; the zone rules list no clock change before it. */
export const ZONE_RULES_CUTOFF_EPOCH_SECONDS = 946684800;

/** Largest hour a future rule transition time may carry (RFC 9636 §3.3). */
export const FUTURE_RULE_MAX_TRANSITION_HOURS = 167;

/** A future rule transition without a time happens at 02:00:00. */
export const FUTURE_RULE_DEFAULT_TRANSITION_SECONDS = 7200;

/** A future rule designation is at least three characters long. */
export const FUTURE_RULE_MIN_DESIGNATION_LENGTH = 3;

/** The area of the offset-only zones, such as `Etc/GMT+5`. */
export const ETC_ZONE_AREA = "Etc";

/** The three ways a future rule names the day of a transition. */
export const RuleDateKind = {
  JULIAN_NO_LEAP: "JULIAN_NO_LEAP",
  ZERO_BASED: "ZERO_BASED",
  MONTH_WEEK_DAY: "MONTH_WEEK_DAY",
} as const;
export type RuleDateKind = (typeof RuleDateKind)[keyof typeof RuleDateKind];

export const SECONDS_PER_MINUTE = 60;

/** Milliseconds in one second. */
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86400;
export const HOURS_PER_DAY = 24;
export const MILLISECONDS_PER_HOUR = SECONDS_PER_HOUR * MILLISECONDS_PER_SECOND;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * MILLISECONDS_PER_SECOND;

/** The first month and the first day of a month or year. */
export const JANUARY = 1;
export const FIRST_DAY_OF_MONTH = 1;

/** Splits a sorted range in two halves for a binary search. */
export const BINARY_SEARCH_MIDPOINT_DIVISOR = 2;

/** The calendar facts a future rule date is read against. */
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_COMMON_YEAR = 365;
export const MAX_WEEK_OF_MONTH = 5;

/** The epoch day arithmetic: the Unix epoch is a Thursday, the week starts on Sunday. */
export const EPOCH_YEAR = 1970;
export const EPOCH_WEEKDAY = 4;
export const GREGORIAN_AVERAGE_DAYS_PER_YEAR = 365.2425;
