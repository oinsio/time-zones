import {
  MAX_WALL_TIME_HOUR,
  MAX_WALL_TIME_MINUTE,
  WALL_TIME_COMMAND_PATTERN,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { getHereEntry } from "./hereEntry";
import type { LocationCommand, LocationCommandType } from "./locationCommands";
import { LocationErrorCode } from "./locationCommands";
import type { LocationsReduceResult, WorldClockState } from "./locations";
import { ReferenceMode, WallTimeTargetKind } from "./referenceMoment";
import { resolveWallClock } from "./wallClock";

type SetWallTimeCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SET_WALL_TIME }
>;

const fail = (error: LocationErrorCode): LocationsReduceResult => ({
  ok: false,
  error,
});

/** The zone of the targeted row, or `undefined` when that row is gone. */
function findTargetZone(
  state: WorldClockState,
  target: SetWallTimeCommand["target"],
): string | undefined {
  if (target.kind === WallTimeTargetKind.HERE_ENTRY) {
    return getHereEntry(state)?.timeZoneId;
  }
  return state.locations.find((location) => location.id === target.locationId)
    ?.timeZoneId;
}

function isCanonicalTime(time: string): boolean {
  const groups = WALL_TIME_COMMAND_PATTERN.exec(time)?.groups;
  return (
    groups !== undefined &&
    Number(groups.hour) <= MAX_WALL_TIME_HOUR &&
    Number(groups.minute) <= MAX_WALL_TIME_MINUTE
  );
}

/**
 * Pins the reference moment to a typed wall-clock time in a row's zone. The
 * wall-clock time is resolved by `resolveWallClock` (`compatible`); the
 * instant, status and target already pinned return the same state object.
 * Implements FR3, FR4, FR10, FR13 of add-wall-time-input-with-hint (D1).
 */
export function reduceWallTime(
  state: WorldClockState,
  command: SetWallTimeCommand,
): LocationsReduceResult {
  if (!isCanonicalTime(command.time)) {
    return fail(LocationErrorCode.INVALID_TIME);
  }
  let date: Temporal.PlainDate;
  try {
    date = Temporal.PlainDate.from(command.date);
  } catch (e) {
    if (e instanceof RangeError) return fail(LocationErrorCode.INVALID_DATE);
    throw e;
  }
  const zone = findTargetZone(state, command.target);
  if (zone === undefined) return fail(LocationErrorCode.LOCATION_NOT_FOUND);
  const requestedWallTime = Temporal.PlainTime.from(command.time);
  try {
    const { instant, status } = resolveWallClock(
      zone,
      date.toPlainDateTime(requestedWallTime),
    );
    const { reference } = state;
    if (
      reference.mode === ReferenceMode.PINNED &&
      reference.instant.equals(instant) &&
      reference.wallClockStatus === status &&
      JSON.stringify(reference.wallTimeTarget) ===
        JSON.stringify(command.target)
    ) {
      return { ok: true, state };
    }
    return {
      ok: true,
      state: {
        ...state,
        reference: {
          mode: ReferenceMode.PINNED,
          instant,
          wallClockStatus: status,
          requestedWallTime,
          wallTimeTarget: command.target,
        },
      },
    };
  } catch (e) {
    if (e instanceof RangeError) {
      return fail(LocationErrorCode.DATE_OUT_OF_RANGE);
    }
    throw e;
  }
}
