import type { TFunction } from "i18next";
import type { Temporal } from "@/lib/temporal";
import {
  getRelativeTime,
  type RelativeTime,
  RelativeTimeDirection,
  RelativeTimeUnit,
} from "@/model/unixTime";

/** The key stem of each unit, written once; the plural suffixes are i18next's. */
const UNIT_KEY_PART = {
  [RelativeTimeUnit.MINUTES]: "Minutes",
  [RelativeTimeUnit.HOURS]: "Hours",
  [RelativeTimeUnit.DAYS]: "Days",
  [RelativeTimeUnit.MONTHS]: "Months",
  [RelativeTimeUnit.YEARS]: "Years",
} as const;

const DIRECTION_KEY_PART = {
  [RelativeTimeDirection.PAST]: "relativePast",
  [RelativeTimeDirection.FUTURE]: "relativeFuture",
} as const;

/**
 * The text of the relative time between the converter moment and now: only
 * the pick of a plural key; the time math is `getRelativeTime`'s.
 * Implements FR13, FR18 of add-unix-time-converter-tool (D7).
 */
export function presentRelativeTime(
  moment: Temporal.Instant,
  now: Temporal.Instant,
  translate: TFunction,
): string {
  const relativeTime: RelativeTime = getRelativeTime(moment, now);
  if (relativeTime.unit === RelativeTimeUnit.NOW) {
    return translate("unixTime.relativeNow");
  }
  const key = `unixTime.${DIRECTION_KEY_PART[relativeTime.direction]}${UNIT_KEY_PART[relativeTime.unit]}`;
  return translate(key, { count: relativeTime.count });
}
