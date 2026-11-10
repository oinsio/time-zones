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
 * Why the range lies outside the reference day the grid shows, or `undefined`
 * when it lies inside. While the moment is live the model does not know that
 * day (it has no clock), so only `reduceSetMeetingRange` checks the range then.
 * An end time earlier than the start time that reaches past the day's end,
 * from a start inside the day, is `MEETING_END_BEFORE_START`.
 */
function getShownDayRefusal(
  state: WorldClockState,
  start: Temporal.Instant,
  end: Temporal.Instant,
  isEndTimeEarlier: boolean,
): LocationErrorCode | undefined {
  if (state.reference.mode !== ReferenceMode.PINNED) return undefined;
  const day = getReferenceDay(state, state.reference.instant);
  const isStartInside =
    Temporal.Instant.compare(day.start, start) <= 0 &&
    Temporal.Instant.compare(start, day.end) < 0;
  if (Temporal.Instant.compare(end, day.end) <= 0 && isStartInside) {
    return undefined;
  }
  return isStartInside && isEndTimeEarlier
    ? LocationErrorCode.MEETING_END_BEFORE_START
    : LocationErrorCode.INVALID_MEETING_RANGE;
}

/**
 * Sets the meeting range from wall-clock times in a row's zone: the start on
 * the given date, the end on the first following moment with its wall time.
 * The range must lie in the reference day the grid shows. Equal start and end
 * times, and an end time earlier than the start time, have their own errors.
 * The instants are then set by `reduceSetMeetingRange`, which owns the
 * invariants and the pin.
 * Implements FR5 of fix-grid-meeting-range-lock-and-layering (D2).
 * Implements FR1, FR2 of refine-meeting-range-entry-and-handles (D2).
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
    const isEndTimeEarlier = timeOrder < 0;
    let end = resolveWallClock(zone, date.toPlainDateTime(endTime)).instant;
    if (isEndTimeEarlier) {
      end = resolveWallClock(
        zone,
        date.add({ days: 1 }).toPlainDateTime(endTime),
      ).instant;
    }
    const refusal = getShownDayRefusal(state, start, end, isEndTimeEarlier);
    if (refusal !== undefined) return fail(refusal);
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
