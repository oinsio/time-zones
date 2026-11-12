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
