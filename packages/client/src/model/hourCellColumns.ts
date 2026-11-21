import {
  HOUR_CELL_DURATION,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { ReferenceDay } from "./dayTrack";
import type { MeetingRange } from "./meetingRange";
import { getNextReferenceDay } from "./nextReferenceDay";

/**
 * The column arithmetic of the hour cells: how many cells the reference day
 * and the strip tail have and where a column starts. Kept apart from the cell
 * builder, so the meeting range rules do not pull the builder in.
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4, D10).
 */

/** The number of hour cells of the reference day: 23, 24 or 25, one more when it ends with a shorter cell. */
export function getHourCellCount(day: ReferenceDay): number {
  return Math.ceil(day.lengthMinutes / MINUTES_PER_HOUR);
}

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
  const endMinutes =
    (meeting.end.epochMilliseconds - day.start.epochMilliseconds) /
    MILLISECONDS_PER_MINUTE;
  const lastColumn = Math.ceil(endMinutes / MINUTES_PER_HOUR) - 1;
  const tailCount = lastColumn + 2 - getHourCellCount(day);
  return Math.min(
    Math.max(tailCount, 0),
    getHourCellCount(getNextReferenceDay(day, referenceZoneId)),
  );
}

/**
 * The start of the hour cell in a column: the one owner of the column
 * arithmetic. A column past the reference day's cells is a tail column: it
 * starts the next reference day's hours from its start.
 * Implements FR5 of add-grid-meeting-range-and-share (D2).
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4, D10).
 */
export function getHourCellStart(
  day: ReferenceDay,
  column: number,
): Temporal.Instant {
  const dayCellCount = getHourCellCount(day);
  return column < dayCellCount
    ? day.start.add({ hours: column * HOUR_CELL_DURATION.hours })
    : day.end.add({
        hours: (column - dayCellCount) * HOUR_CELL_DURATION.hours,
      });
}

/** The column of the hour frame: the cell that contains the instant, clamped to the day. */
export function getHourFrameIndex(
  day: ReferenceDay,
  instant: Temporal.Instant,
): number {
  const minutesFromStart =
    (instant.epochMilliseconds - day.start.epochMilliseconds) /
    MILLISECONDS_PER_MINUTE;
  const lastColumn = getHourCellCount(day) - 1;
  return Math.min(
    Math.max(Math.floor(minutesFromStart / MINUTES_PER_HOUR), 0),
    lastColumn,
  );
}
