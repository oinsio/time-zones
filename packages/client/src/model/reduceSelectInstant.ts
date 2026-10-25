import { Temporal } from "@/lib/temporal";
import {
  type LocationCommand,
  type LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type LocationsState,
} from "./locations";
import { getReferenceZone, ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

type SelectInstantCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SELECT_INSTANT }
>;

/**
 * Pins the reference moment to an exact instant picked on a day track.
 * The status is always `UNIQUE`, which ends a gap note. Selecting the
 * instant that is already pinned returns the same state object.
 * Implements FR3, FR5, FR8 of add-time-sliders-to-location-cards (D1).
 */
export function reduceSelectInstant(
  state: LocationsState,
  command: SelectInstantCommand,
): LocationsReduceResult {
  let instant: Temporal.Instant;
  try {
    instant = Temporal.Instant.from(command.instant);
  } catch (e) {
    if (e instanceof RangeError) {
      return { ok: false, error: LocationErrorCode.INVALID_INSTANT };
    }
    throw e;
  }
  const { reference } = state;
  if (
    reference.mode === ReferenceMode.PINNED &&
    reference.instant.equals(instant)
  ) {
    return { ok: true, state };
  }
  const requestedWallTime = instant
    .toZonedDateTimeISO(getReferenceZone(state))
    .toPlainTime();
  return {
    ok: true,
    state: {
      ...state,
      reference: {
        mode: ReferenceMode.PINNED,
        instant,
        wallClockStatus: WallClockStatus.UNIQUE,
        requestedWallTime,
      },
    },
  };
}
