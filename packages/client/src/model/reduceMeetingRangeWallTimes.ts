import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import {
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { reduceSetMeetingRange } from "./reduceMeetingRange";
import { ReferenceMode } from "./referenceMoment";
import { isCanonicalWallTime, resolveWallClock } from "./wallClock";

type SetMeetingRangeWallTimesCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SET_MEETING_RANGE_WALL_TIMES }
>;

const fail = (error: LocationErrorCode): LocationsReduceResult => ({
  ok: false,
  error,
});

/**
 * Whether the start lies outside the reference day the grid shows. While the
 * moment is live the model does not know that day (it has no clock), so only
 * `reduceSetMeetingRange` checks the range then. The end may lie after the
 * day's end (ADR-0019).
 */
function isStartOutsideShownDay(
  state: WorldClockState,
  start: Temporal.Instant,
): boolean {
  if (state.reference.mode !== ReferenceMode.PINNED) return false;
  const day = getReferenceDay(state, state.reference.instant);
  return (
    Temporal.Instant.compare(start, day.start) < 0 ||
    Temporal.Instant.compare(day.end, start) <= 0
  );
}

/**
 * Sets the meeting range from wall-clock times in a row's zone: the start on
 * the given date, the end on the first following moment with its wall time.
 * The start must lie in the reference day the grid shows; an end time earlier
 * than the start time ends the range on the next date, also after midnight of
 * the reference zone. Equal start and end times are refused.
 * The instants are then set by `reduceSetMeetingRange`, which owns the
 * invariants and the pin.
 * Implements FR5 of fix-grid-meeting-range-lock-and-layering (D2).
 * Implements FR1, FR2 of refine-meeting-range-entry-and-handles (D2).
 * Implements FR3 of move-meeting-range-and-extend-past-midnight (D2).
 */
export function reduceMeetingRangeWallTimes(
  state: WorldClockState,
  command: SetMeetingRangeWallTimesCommand,
): LocationsReduceResult {
  if (
    !isCanonicalWallTime(command.start) ||
    !isCanonicalWallTime(command.end)
  ) {
    return fail(LocationErrorCode.INVALID_TIME);
  }
  let date: Temporal.PlainDate;
  try {
    date = Temporal.PlainDate.from(command.date);
  } catch (e) {
    if (e instanceof RangeError) return fail(LocationErrorCode.INVALID_DATE);
    throw e;
  }
  const zone = state.locations.find(
    (location) => location.id === command.target.locationId,
  )?.timeZoneId;
  if (zone === undefined) return fail(LocationErrorCode.LOCATION_NOT_FOUND);
  try {
    const start = resolveWallClock(
      zone,
      date.toPlainDateTime(Temporal.PlainTime.from(command.start)),
    ).instant;
    const startTime = Temporal.PlainTime.from(command.start);
    const endTime = Temporal.PlainTime.from(command.end);
    const timeOrder = Temporal.PlainTime.compare(endTime, startTime);
    if (timeOrder === 0) {
      return fail(LocationErrorCode.MEETING_START_EQUALS_END);
    }
    const endDate = timeOrder < 0 ? date.add({ days: 1 }) : date;
    const end = resolveWallClock(
      zone,
      endDate.toPlainDateTime(endTime),
    ).instant;
    if (isStartOutsideShownDay(state, start)) {
      return fail(LocationErrorCode.INVALID_MEETING_RANGE);
    }
    return reduceSetMeetingRange(state, {
      type: LocationCommandType.SET_MEETING_RANGE,
      start: start.toString(),
      end: end.toString(),
    });
  } catch (e) {
    if (e instanceof RangeError) {
      return fail(LocationErrorCode.INVALID_MEETING_RANGE);
    }
    throw e;
  }
}
