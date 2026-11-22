import { parseCommandInstant } from "./commandInstant";
import { getReferenceDay } from "./dayTrack";
import {
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { isValidMeetingRange } from "./meetingRange";
import {
  getMeetingRangeAfterMove,
  getMeetingRangeAtStartMinutes,
} from "./meetingRangeMove";
import { getReferenceZone, ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

type SetMeetingRangeCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SET_MEETING_RANGE }
>;

type MoveMeetingRangeCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.MOVE_MEETING_RANGE }
>;

/** The state without a meeting range; the same object when none is set. */
export function withoutMeetingRange(state: WorldClockState): WorldClockState {
  if (state.meeting === undefined) return state;
  const { meeting: _removed, ...rest } = state;
  return rest;
}

/**
 * Sets a meeting range and pins the reference moment at its start. An invalid
 * range is refused with `INVALID_MEETING_RANGE`; the same range returns the
 * same state object.
 * Implements FR1, FR2 of add-grid-meeting-range-and-share (D1).
 */
export function reduceSetMeetingRange(
  state: WorldClockState,
  command: SetMeetingRangeCommand,
): LocationsReduceResult {
  const start = parseCommandInstant(command.start);
  const end = parseCommandInstant(command.end);
  if (start === undefined || end === undefined) {
    return { ok: false, error: LocationErrorCode.INVALID_MEETING_RANGE };
  }
  const reference = {
    mode: ReferenceMode.PINNED,
    instant: start,
    wallClockStatus: WallClockStatus.UNIQUE,
    requestedWallTime: start
      .toZonedDateTimeISO(getReferenceZone(state))
      .toPlainTime(),
  } as const;
  const day = getReferenceDay({ ...state, reference }, start);
  if (!isValidMeetingRange(day, start, end)) {
    return { ok: false, error: LocationErrorCode.INVALID_MEETING_RANGE };
  }
  const { meeting, reference: previous } = state;
  if (
    meeting?.start.equals(start) &&
    meeting.end.equals(end) &&
    previous.mode === ReferenceMode.PINNED &&
    previous.wallClockStatus === WallClockStatus.UNIQUE &&
    previous.wallTimeTarget === undefined
  ) {
    return { ok: true, state };
  }
  return { ok: true, state: { ...state, meeting: { start, end }, reference } };
}

/**
 * Moves the whole meeting range: start and end shift together, the length
 * never changes, and the reference moment is pinned at the new start. With no
 * range set the state is unchanged.
 * Implements FR14, FR20 of move-meeting-range-and-extend-past-midnight (D3).
 */
export function reduceMoveMeetingRange(
  state: WorldClockState,
  command: MoveMeetingRangeCommand,
): LocationsReduceResult {
  const { meeting } = state;
  if (meeting === undefined) return { ok: true, state };
  const day = getReferenceDay(state, meeting.start);
  const { target } = command;
  const moved =
    "move" in target
      ? getMeetingRangeAfterMove(meeting, day, target.move)
      : getMeetingRangeAtStartMinutes(meeting, day, target.startMinutes);
  return reduceSetMeetingRange(state, {
    type: LocationCommandType.SET_MEETING_RANGE,
    start: moved.start.toString(),
    end: moved.end.toString(),
  });
}

/** Removes the meeting range and keeps the moment pinned at its former start. */
export function reduceClearMeetingRange(
  state: WorldClockState,
): LocationsReduceResult {
  return { ok: true, state: withoutMeetingRange(state) };
}

/**
 * Removes the meeting range when the reference zone changed or the list became
 * empty; the reference moment stays pinned at the former start.
 * Implements FR4 of add-grid-meeting-range-and-share (D1).
 */
export function followMeetingRange(
  previous: WorldClockState,
  next: WorldClockState,
): WorldClockState {
  if (next.meeting === undefined) return next;
  const isZoneChanged = getReferenceZone(previous) !== getReferenceZone(next);
  return isZoneChanged || next.locations.length === 0
    ? withoutMeetingRange(next)
    : next;
}
