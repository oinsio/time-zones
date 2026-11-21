import {
  MILLISECONDS_PER_MINUTE,
  NANOSECONDS_PER_MINUTE,
  TRACK_HOUR_MOVE_MINUTES,
  TRACK_STEP_MINUTES,
} from "@/constants";
import {
  getMinutesAfterTrackStep,
  type ReferenceDay,
  TrackMove,
} from "./dayTrack";
import type { MeetingRange } from "./meetingRange";

/** The move of the whole meeting range: a keyboard move, or a start at a position in minutes. */
export type MeetingRangeMove = { move: TrackMove } | { startMinutes: number };

/** The last track step position of the day: the latest a start may stand. */
export const getLastStartMinutes = (day: ReferenceDay) =>
  Math.floor((day.lengthMinutes - 1) / TRACK_STEP_MINUTES) * TRACK_STEP_MINUTES;

/** The minutes from the start of the reference day to an instant. */
export const getMinutesFromDayStart = (
  day: ReferenceDay,
  instant: MeetingRange["start"],
) =>
  (instant.epochMilliseconds - day.start.epochMilliseconds) /
  MILLISECONDS_PER_MINUTE;

/** The range with its start at `startMinutes` (limited to the day) and its length in absolute time unchanged. */
function putStartAtMinutes(
  day: ReferenceDay,
  meeting: MeetingRange,
  startMinutes: number,
): MeetingRange {
  const limitedMinutes = Math.min(
    Math.max(startMinutes, 0),
    getLastStartMinutes(day),
  );
  const start = day.start.add({
    nanoseconds: limitedMinutes * NANOSECONDS_PER_MINUTE,
  });
  const lengthMilliseconds =
    meeting.end.epochMilliseconds - meeting.start.epochMilliseconds;
  return { start, end: start.add({ milliseconds: lengthMilliseconds }) };
}

/**
 * The minutes a keyboard move leads to from `current`: the next or previous
 * track step, an hour on, or the earliest or the latest position given. The
 * one table of keyboard moves for a handle and for the whole range.
 * Implements FR4, FR14 of move-meeting-range-and-extend-past-midnight (D1, D3).
 */
export function getMinutesAfterMove(
  current: number,
  move: TrackMove,
  earliestMinutes: number,
  latestMinutes: number,
): number {
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
    [TrackMove.DAY_START]: earliestMinutes,
    [TrackMove.DAY_END]: latestMinutes,
  };
  return targetMinutes[move];
}

/**
 * The range after a keyboard move of the whole range: the start goes to the
 * next or previous track step, an hour on, or to the earliest or latest
 * position; the length never changes.
 * Implements FR14 of move-meeting-range-and-extend-past-midnight (D3).
 */
export function getMeetingRangeAfterMove(
  meeting: MeetingRange,
  day: ReferenceDay,
  move: TrackMove,
): MeetingRange {
  const current = getMinutesFromDayStart(day, meeting.start);
  return putStartAtMinutes(
    day,
    meeting,
    getMinutesAfterMove(current, move, 0, getLastStartMinutes(day)),
  );
}

/**
 * The range after a pointer drag of the whole range: the start at the nearest
 * track step to `minutes`, limited to the day.
 * Implements FR20 of move-meeting-range-and-extend-past-midnight (D3).
 */
export function getMeetingRangeAtStartMinutes(
  meeting: MeetingRange,
  day: ReferenceDay,
  minutes: number,
): MeetingRange {
  const steppedMinutes =
    Math.round(minutes / TRACK_STEP_MINUTES) * TRACK_STEP_MINUTES;
  return putStartAtMinutes(day, meeting, steppedMinutes);
}
