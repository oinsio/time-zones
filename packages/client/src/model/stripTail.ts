import type { ReferenceDay } from "./dayTrack";
import { getHourCellCount } from "./hourCellColumns";
import { getMeetingSpan, type MeetingRange } from "./meetingRange";
import { getNextReferenceDay } from "./nextReferenceDay";

/**
 * The number of cells of the strip tail: from the cell after the last one the
 * range overlaps, one spare cell more, as far as the next reference day has
 * cells. Zero without a meeting range.
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4).
 */
export function getStripTailCellCount(
  meeting: MeetingRange | undefined,
  day: ReferenceDay,
  referenceZoneId: string,
): number {
  if (meeting === undefined) return 0;
  const { lastColumn } = getMeetingSpan(day, meeting);
  const tailCount = lastColumn + 2 - getHourCellCount(day);
  return Math.min(
    Math.max(tailCount, 0),
    getHourCellCount(getNextReferenceDay(day, referenceZoneId)),
  );
}
