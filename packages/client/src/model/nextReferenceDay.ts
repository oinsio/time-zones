import type { ReferenceDay } from "./dayTrack";

/**
 * The reference day after `day` in the reference zone: the day whose first
 * cells form the strip tail. Its clock change window is the day's.
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4).
 */
export function getNextReferenceDay(
  day: ReferenceDay,
  referenceZoneId: string,
): ReferenceDay {
  const nextStart = day.end.toZonedDateTimeISO(referenceZoneId);
  const nextEnd = nextStart.add({ days: 1 }).startOfDay();
  return {
    start: day.end,
    end: nextEnd.toInstant(),
    lengthMinutes: nextStart.until(nextEnd).total({ unit: "minute" }),
    clockChangeWindow: day.clockChangeWindow,
  };
}
