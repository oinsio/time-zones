import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import {
  type LocationCommand,
  type LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { isValidMeetingRange } from "./meetingRange";
import { getReferenceZone, ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const UTC_DESIGNATOR = "Z";

type SetMeetingRangeCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SET_MEETING_RANGE }
>;

function parseInstant(text: string): Temporal.Instant | undefined {
  if (!text.endsWith(UTC_DESIGNATOR)) return undefined;
  try {
    return Temporal.Instant.from(text);
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
}

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
  const start = parseInstant(command.start);
  const end = parseInstant(command.end);
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
