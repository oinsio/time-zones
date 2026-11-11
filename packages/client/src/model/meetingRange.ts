import {
  HOUR_CELL_DURATION,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  NANOSECONDS_PER_MINUTE,
  TRACK_HOUR_MOVE_MINUTES,
  TRACK_STEP_MINUTES,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import {
  getMinutesAfterTrackStep,
  type ReferenceDay,
  TrackMove,
} from "./dayTrack";
import { getHourCellStart } from "./hourCells";

/**
 * The meeting range: a start and an end instant inside one reference day, on
 * whole minutes (ADR-0011, refined by ADR-0013). Pure; lengths come from
 * absolute instants.
 * Implements FR1, FR3, FR5, FR8, FR10, FR12 of add-grid-meeting-range-and-share (D1, D2).
 * Implements FR1, FR4, FR5 of refine-meeting-range-entry-and-handles (D1).
 */
export type MeetingRange = {
  start: Temporal.Instant;
  end: Temporal.Instant;
};

export enum MeetingHandle {
  START = "START",
  END = "END",
}

export type MeetingHandleLimits = { minMinutes: number; maxMinutes: number };

export type MeetingSpan = {
  startMinutes: number;
  endMinutes: number;
  firstColumn: number;
  lastColumn: number;
};

const getMinutesFromDayStart = (day: ReferenceDay, instant: Temporal.Instant) =>
  (instant.epochMilliseconds - day.start.epochMilliseconds) /
  MILLISECONDS_PER_MINUTE;

const getInstantAtMinutes = (day: ReferenceDay, minutes: number) =>
  day.start.add({ nanoseconds: minutes * NANOSECONDS_PER_MINUTE });

const isOnWholeMinute = (day: ReferenceDay, instant: Temporal.Instant) =>
  Number.isInteger(getMinutesFromDayStart(day, instant));

/** Whether the range keeps the invariants of ADR-0011 inside `day`. */
export function isValidMeetingRange(
  day: ReferenceDay,
  start: Temporal.Instant,
  end: Temporal.Instant,
): boolean {
  return (
    start.epochMilliseconds < end.epochMilliseconds &&
    day.start.epochMilliseconds <= start.epochMilliseconds &&
    end.epochMilliseconds <= day.end.epochMilliseconds &&
    isOnWholeMinute(day, start) &&
    isOnWholeMinute(day, end)
  );
}

/** The range from the first touched cell's start to the last one's end, in either direction. */
export function getMeetingRangeOfCells(
  day: ReferenceDay,
  firstColumn: number,
  lastColumn: number,
): MeetingRange {
  const lowColumn = Math.min(firstColumn, lastColumn);
  const highColumn = Math.max(firstColumn, lastColumn);
  const highCellEnd = getHourCellStart(day, highColumn).add(HOUR_CELL_DURATION);
  return {
    start: getHourCellStart(day, lowColumn),
    end:
      highCellEnd.epochMilliseconds < day.end.epochMilliseconds
        ? highCellEnd
        : day.end,
  };
}

/** The minutes from the day's start between which a handle may stand. */
export function getMeetingHandleLimits(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingHandle,
): MeetingHandleLimits {
  const startMinutes = getMinutesFromDayStart(day, meeting.start);
  const endMinutes = getMinutesFromDayStart(day, meeting.end);
  const minimumLengthMinutes = Math.min(
    TRACK_STEP_MINUTES,
    endMinutes - startMinutes,
  );
  if (handle === MeetingHandle.START) {
    return {
      minMinutes: 0,
      maxMinutes: endMinutes - minimumLengthMinutes,
    };
  }
  return {
    minMinutes: startMinutes + minimumLengthMinutes,
    maxMinutes: day.lengthMinutes,
  };
}

function putHandleAtMinutes(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingHandle,
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
  handle: MeetingHandle,
  move: TrackMove,
): MeetingRange {
  const current = getMinutesFromDayStart(
    day,
    handle === MeetingHandle.START ? meeting.start : meeting.end,
  );
  const targetMinutes: Record<TrackMove, number> = {
    [TrackMove.NEXT_STEP]: getMinutesAfterTrackStep(
      current,
      TrackMove.NEXT_STEP,
    ),
    [TrackMove.PREVIOUS_STEP]: getMinutesAfterTrackStep(
      current,
      TrackMove.PREVIOUS_STEP,
    ),
    [TrackMove.HOUR_FORWARD]: current + TRACK_HOUR_MOVE_MINUTES,
    [TrackMove.HOUR_BACK]: current - TRACK_HOUR_MOVE_MINUTES,
    [TrackMove.DAY_START]: 0,
    [TrackMove.DAY_END]: day.lengthMinutes,
  };
  return putHandleAtMinutes(day, meeting, handle, targetMinutes[move]);
}

/** The range after a pointer drag: the handle at the nearest track step, limited. */
export function getMeetingRangeAtHandleMinutes(
  day: ReferenceDay,
  meeting: MeetingRange,
  handle: MeetingHandle,
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
 * The range for a date change: the new start as given, the duration kept, the end clamped to the new day's end.
 */
export function moveMeetingRangeToDay(
  meeting: MeetingRange,
  newStart: Temporal.Instant,
  newDay: ReferenceDay,
): MeetingRange {
  const start = newStart;
  const end = start.add({
    milliseconds:
      meeting.end.epochMilliseconds - meeting.start.epochMilliseconds,
  });
  return {
    start,
    end:
      end.epochMilliseconds < newDay.end.epochMilliseconds ? end : newDay.end,
  };
}
