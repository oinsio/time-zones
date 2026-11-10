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
 * Whether the range lies in the reference day the grid shows. While the
 * moment is live the model does not know that day (it has no clock), so only
 * `reduceSetMeetingRange` checks the range then.
 */
function isInShownDay(
  state: WorldClockState,
  start: Temporal.Instant,
  end: Temporal.Instant,
): boolean {
  if (state.reference.mode !== ReferenceMode.PINNED) return true;
  const day = getReferenceDay(state, state.reference.instant);
  return (
    Temporal.Instant.compare(day.start, start) <= 0 &&
    Temporal.Instant.compare(end, day.end) <= 0
  );
}

/**
 * Sets the meeting range from wall-clock times in a row's zone: the start on
 * the given date, the end on the first following moment with its wall time.
 * The range must lie in the reference day the grid shows. The instants are then set by `reduceSetMeetingRange`, which owns the
 * invariants and the pin.
 * Implements FR5 of fix-grid-meeting-range-lock-and-layering (D2).
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
    const endTime = Temporal.PlainTime.from(command.end);
    let end = resolveWallClock(zone, date.toPlainDateTime(endTime)).instant;
    if (Temporal.Instant.compare(end, start) <= 0) {
      end = resolveWallClock(
        zone,
        date.add({ days: 1 }).toPlainDateTime(endTime),
      ).instant;
    }
    if (!isInShownDay(state, start, end)) {
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
