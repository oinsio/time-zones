import { parseCommandInstant } from "./commandInstant";
import {
  type LocationCommand,
  type LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { withoutMeetingRange } from "./reduceMeetingRange";
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
 * Implements FR3 of add-grid-meeting-range-and-share (D1): the meeting range ends.
 */
export function reduceSelectInstant(
  state: WorldClockState,
  command: SelectInstantCommand,
): LocationsReduceResult {
  const instant = parseCommandInstant(command.instant);
  if (instant === undefined) {
    return { ok: false, error: LocationErrorCode.INVALID_INSTANT };
  }
  const { reference } = state;
  if (
    state.meeting === undefined &&
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
      ...withoutMeetingRange(state),
      reference: {
        mode: ReferenceMode.PINNED,
        instant,
        wallClockStatus: WallClockStatus.UNIQUE,
        requestedWallTime,
      },
    },
  };
}
