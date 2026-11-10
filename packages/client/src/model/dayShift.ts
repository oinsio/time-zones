import { Temporal } from "@/lib/temporal";

/**
 * Day shift of a location: how its local date at an instant compares with the
 * reference zone's local date at the same instant.
 * Implements FR8 of add-grid-meeting-range-and-share (D2).
 */
export enum DayShift {
  EARLIER = "EARLIER",
  SAME = "SAME",
  LATER = "LATER",
}

export function getDayShift(
  timeZoneId: string,
  instant: Temporal.Instant,
  referenceZoneId: string,
): DayShift {
  const comparison = Temporal.PlainDate.compare(
    instant.toZonedDateTimeISO(timeZoneId).toPlainDate(),
    instant.toZonedDateTimeISO(referenceZoneId).toPlainDate(),
  );
  if (comparison < 0) return DayShift.EARLIER;
  return comparison > 0 ? DayShift.LATER : DayShift.SAME;
}
