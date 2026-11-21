import {
  HOUR_CELL_DURATION,
  MEETING_RANGE_MAX_MINUTES,
  MINUTES_PER_HOUR,
  NANOSECONDS_PER_MINUTE,
  TRACK_STEP_MINUTES,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { ReferenceDay, TrackMove } from "./dayTrack";
import { getHourCellCount, getHourCellStart } from "./hourCellColumns";
import {
  getLastStartMinutes,
  getMinutesAfterMove,
  getMinutesFromDayStart,
} from "./meetingRangeMove";

/**
 * The meeting range: a start inside one reference day and an end at most 24
 * hours later, on whole minutes (ADR-0011, refined by ADR-0013 and ADR-0019). Pure; lengths come from
 * absolute instants.
 * Implements FR1, FR3, FR5, FR8, FR10, FR12 of add-grid-meeting-range-and-share (D1, D2).
 * Implements FR1, FR4, FR5 of refine-meeting-range-entry-and-handles (D1).
 * Implements FR1, FR2, FR4, FR5, FR11 of move-meeting-range-and-extend-past-midnight (D1).
 */
export type MeetingRange = {
  start: Temporal.Instant;
  end: Temporal.Instant;
};

export enum MeetingHandle {
  START = "START",
  END = "END",
  /** Moves the whole range (FR17); it has no limits of its own end. */
  MOVE = "MOVE",
}

/** The handles that move one end of the range. */
export type MeetingEndHandle = MeetingHandle.START | MeetingHandle.END;

export type MeetingHandleLimits = { minMinutes: number; maxMinutes: number };

export type MeetingSpan = {
  startMinutes: number;
  endMinutes: number;
  firstColumn: number;
  lastColumn: number;
};

const getInstantAtMinutes = (day: ReferenceDay, minutes: number) =>
  day.start.add({ nanoseconds: minutes * NANOSECONDS_PER_MINUTE });

const isOnWholeMinute = (day: ReferenceDay, instant: Temporal.Instant) =>
  Number.isInteger(getMinutesFromDayStart(day, instant));

/** Whether the range keeps the invariants of ADR-0011 and ADR-0019 for `day`. */
export function isValidMeetingRange(
  day: ReferenceDay,
  start: Temporal.Instant,
  end: Temporal.Instant,
): boolean {
  return (
    start.epochMilliseconds < end.epochMilliseconds &&
    day.start.epochMilliseconds <= start.epochMilliseconds &&
    start.epochMilliseconds < day.end.epochMilliseconds &&
    getMinutesFromDayStart(day, end) - getMinutesFromDayStart(day, start) <=
      MEETING_RANGE_MAX_MINUTES &&
    isOnWholeMinute(day, start) &&
    isOnWholeMinute(day, end)
  );
}

/**
 * The range from the first touched cell's start to the last one's end, in
 * either direction. A column past the day's cells is a tail column: its end is
 * limited to the end of the next reference day, and the range to 24 hours.
 * Implements FR9 of move-meeting-range-and-extend-past-midnight (D10).
 */
export function getMeetingRangeOfCells(
  day: ReferenceDay,
  referenceZoneId: string,
  firstColumn: number,
  lastColumn: number,
): MeetingRange {
  const lowColumn = Math.min(firstColumn, lastColumn);
  const highColumn = Math.max(firstColumn, lastColumn);
  const start = getHourCellStart(day, lowColumn);
  const highCellEnd = getHourCellStart(day, highColumn).add(HOUR_CELL_DURATION);
  const highDayEnd =
    highColumn < getHourCellCount(day)
      ? day.end
      : day.end
          .toZonedDateTimeISO(referenceZoneId)
          .add({ days: 1 })
          .startOfDay()
          .toInstant();
  const longestEnd = start.add({ minutes: MEETING_RANGE_MAX_MINUTES });
  const [end] = [highCellEnd, highDayEnd, longestEnd].sort(
    Temporal.Instant.compare,
  );
  return { start, end };
}

/** The minutes from the day's start between which a handle may stand. */
export function getMeetingHandleLimits(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingEndHandle,
): MeetingHandleLimits {
  const startMinutes = getMinutesFromDayStart(day, meeting.start);
  const endMinutes = getMinutesFromDayStart(day, meeting.end);
  const minimumLengthMinutes = Math.min(
    TRACK_STEP_MINUTES,
    endMinutes - startMinutes,
  );
  if (handle === MeetingHandle.START) {
    return {
      minMinutes: Math.max(0, endMinutes - MEETING_RANGE_MAX_MINUTES),
      maxMinutes: Math.min(
        endMinutes - minimumLengthMinutes,
        getLastStartMinutes(day),
      ),
    };
  }
  return {
    minMinutes: startMinutes + minimumLengthMinutes,
    maxMinutes: startMinutes + MEETING_RANGE_MAX_MINUTES,
  };
}

function putHandleAtMinutes(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingEndHandle,
  minutes: number,
): MeetingRange {
  const { minMinutes, maxMinutes } = getMeetingHandleLimits(
    day,
    meeting,
    handle,
  );
  const instant = getInstantAtMinutes(
    day,
    Math.min(Math.max(minutes, minMinutes), maxMinutes),
  );
  return handle === MeetingHandle.START
    ? { start: instant, end: meeting.end }
    : { start: meeting.start, end: instant };
}

/** The range after a keyboard move of one handle, limited so the range keeps one step (or its shorter length). */
export function getMeetingRangeAfterHandleMove(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingEndHandle,
  move: TrackMove,
): MeetingRange {
  const current = getMinutesFromDayStart(
    day,
    handle === MeetingHandle.START ? meeting.start : meeting.end,
  );
  // For a handle the day's ends are the limits of the handle (D1).
  return putHandleAtMinutes(
    day,
    meeting,
    handle,
    getMinutesAfterMove(current, move, -Infinity, Infinity),
  );
}

/** The range after a pointer drag: the handle at the nearest track step, limited. */
export function getMeetingRangeAtHandleMinutes(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingEndHandle,
  minutes: number,
): MeetingRange {
  const steppedMinutes =
    Math.round(minutes / TRACK_STEP_MINUTES) * TRACK_STEP_MINUTES;
  return putHandleAtMinutes(day, meeting, handle, steppedMinutes);
}

/** Minutes from the day's start and the hour-cell columns the range overlaps. */
export function getMeetingSpan(
  day: ReferenceDay,
  meeting: MeetingRange,
): MeetingSpan {
  const startMinutes = getMinutesFromDayStart(day, meeting.start);
  const endMinutes = getMinutesFromDayStart(day, meeting.end);
  return {
    startMinutes,
    endMinutes,
    firstColumn: Math.floor(startMinutes / MINUTES_PER_HOUR),
    lastColumn: Math.ceil(endMinutes / MINUTES_PER_HOUR) - 1,
  };
}

/**
 * The range for a date change: the new start as given and the duration kept
 * exactly; the end is never clamped to the new day's end (FR5).
 */
export function moveMeetingRangeToDay(
  meeting: MeetingRange,
  newStart: Temporal.Instant,
): MeetingRange {
  const start = newStart;
  const end = start.add({
    milliseconds:
      meeting.end.epochMilliseconds - meeting.start.epochMilliseconds,
  });
  return { start, end };
}
