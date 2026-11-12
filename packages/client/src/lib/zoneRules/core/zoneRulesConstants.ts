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
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86400;

/** The calendar facts a future rule date is read against. */
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_YEAR_WITHOUT_LEAP_DAY = 365;
export const MAX_WEEK_OF_MONTH = 5;

/** The epoch day arithmetic: the Unix epoch is a Thursday, the week starts on Sunday. */
export const EPOCH_YEAR = 1970;
export const EPOCH_WEEKDAY = 4;
export const DAYS_PER_COMMON_YEAR = 365;
export const GREGORIAN_AVERAGE_DAYS_PER_YEAR = 365.2425;
