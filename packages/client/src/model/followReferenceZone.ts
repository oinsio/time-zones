import type { WorldClockState } from "./locations";
import {
  getReferenceZone,
  ReferenceMode,
  WallTimeTargetKind,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

/**
 * Ends a note about a wall-clock time when the zone it is about changed: the
 * pinned instant stays, its status becomes `UNIQUE` and the requested wall time
 * is the instant's wall time in the reference zone. The gap note of a date
 * change follows the reference zone. A wall-time hint on a location never
 * ends, because that row's zone does not change; a hint on the Here entry ends
 * with a change of the device time zone. Every other state is returned
 * unchanged, with the same `reference` object.
 * Implements FR4 of set-home-location-and-show-differences (D2).
 * Implements FR7 of add-wall-time-input-with-hint (D2).
 */
export function followReferenceZone(
  previous: WorldClockState,
  next: WorldClockState,
): WorldClockState {
  const { reference } = next;
  if (
    reference.mode !== ReferenceMode.PINNED ||
    reference.wallClockStatus === WallClockStatus.UNIQUE
  ) {
    return next;
  }
  const { wallTimeTarget } = reference;
  const isNoteEnded =
    wallTimeTarget === undefined
      ? reference.wallClockStatus === WallClockStatus.GAP &&
        getReferenceZone(previous) !== getReferenceZone(next)
      : wallTimeTarget.kind === WallTimeTargetKind.HERE_ENTRY &&
        previous.deviceTimeZoneId !== next.deviceTimeZoneId;
  if (!isNoteEnded) return next;
  const { wallTimeTarget: _endedTarget, ...plainMoment } = reference;
  return {
    ...next,
    reference: {
      ...plainMoment,
      wallClockStatus: WallClockStatus.UNIQUE,
      requestedWallTime: reference.instant
        .toZonedDateTimeISO(getReferenceZone(next))
        .toPlainTime(),
    },
  };
}
