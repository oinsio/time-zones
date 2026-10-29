import { WallClockStatus } from "./wallClock";
import type { WorldClockState } from "./locations";
import { getReferenceZone, ReferenceMode } from "./referenceMoment";

/**
 * Ends a gap note when the reference zone changed: the pinned instant stays,
 * its status becomes `UNIQUE` and the requested wall time is the instant's wall
 * time in the new reference zone. Every other state is returned unchanged,
 * with the same `reference` object.
 * Implements FR4 of set-home-location-and-show-differences (D2).
 */
export function followReferenceZone(
  previous: WorldClockState,
  next: WorldClockState,
): WorldClockState {
  const { reference } = next;
  if (
    reference.mode !== ReferenceMode.PINNED ||
    reference.wallClockStatus !== WallClockStatus.GAP
  ) {
    return next;
  }
  const referenceZone = getReferenceZone(next);
  if (getReferenceZone(previous) === referenceZone) return next;
  return {
    ...next,
    reference: {
      ...reference,
      wallClockStatus: WallClockStatus.UNIQUE,
      requestedWallTime: reference.instant
        .toZonedDateTimeISO(referenceZone)
        .toPlainTime(),
    },
  };
}
