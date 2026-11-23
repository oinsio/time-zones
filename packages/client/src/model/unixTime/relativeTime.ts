import type { Temporal } from "@/lib/temporal";

/** The unit of a relative time; the largest non-zero of the calendar units. */
export enum RelativeTimeUnit {
  NOW = "NOW",
  MINUTES = "MINUTES",
  HOURS = "HOURS",
  DAYS = "DAYS",
  MONTHS = "MONTHS",
  YEARS = "YEARS",
}

export enum RelativeTimeDirection {
  PAST = "PAST",
  FUTURE = "FUTURE",
}

export type RelativeTime =
  | { unit: RelativeTimeUnit.NOW }
  | {
      unit: Exclude<RelativeTimeUnit, RelativeTimeUnit.NOW>;
      count: number;
      direction: RelativeTimeDirection;
    };

const UNIT_OF_DURATION_FIELD = [
  ["years", RelativeTimeUnit.YEARS],
  ["months", RelativeTimeUnit.MONTHS],
  ["days", RelativeTimeUnit.DAYS],
  ["hours", RelativeTimeUnit.HOURS],
  ["minutes", RelativeTimeUnit.MINUTES],
] as const;

/**
 * The time between a moment and now in the largest non-zero unit of years,
 * months, days, hours and minutes on the UTC calendar, rounded towards zero;
 * `NOW` under one minute.
 * Implements FR13 of add-unix-time-converter-tool (D7).
 */
export function getRelativeTime(
  moment: Temporal.Instant,
  now: Temporal.Instant,
): RelativeTime {
  const isPast = moment.epochMilliseconds < now.epochMilliseconds;
  const [earlier, later] = isPast ? [moment, now] : [now, moment];
  const span = later
    .toZonedDateTimeISO("UTC")
    .since(earlier.toZonedDateTimeISO("UTC"), {
      largestUnit: "year",
      smallestUnit: "minute",
      roundingMode: "trunc",
    });
  for (const [field, unit] of UNIT_OF_DURATION_FIELD) {
    if (span[field] !== 0) {
      return {
        unit,
        count: span[field],
        direction: isPast
          ? RelativeTimeDirection.PAST
          : RelativeTimeDirection.FUTURE,
      };
    }
  }
  return { unit: RelativeTimeUnit.NOW };
}
