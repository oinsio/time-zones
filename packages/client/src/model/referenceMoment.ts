import type { Temporal } from "@/lib/temporal";
import type { WorldClockState } from "./locations";
import type { WallClockStatus } from "./wallClock";

/** Whether the reference moment follows the clock or is fixed by the user. */
export enum ReferenceMode {
  LIVE = "LIVE",
  PINNED = "PINNED",
}

/** Which row a wall-time input was typed in. */
export enum WallTimeTargetKind {
  LOCATION = "LOCATION",
  HERE_ENTRY = "HERE_ENTRY",
}

/**
 * The row a wall-time input was typed in: a listed location or the Here entry.
 * Implements FR3, FR7 of add-wall-time-input-with-hint (D2).
 */
export type WallTimeTarget =
  | { kind: WallTimeTargetKind.LOCATION; locationId: string }
  | { kind: WallTimeTargetKind.HERE_ENTRY };
/**
 * The one moment every location's time is derived from (ADR-0003). The
 * instant exists only while pinned; it is never stored.
 * Implements FR1 of select-date-with-calendar-and-now (D1).
 */
export type ReferenceMoment =
  | { mode: ReferenceMode.LIVE }
  | {
      mode: ReferenceMode.PINNED;
      instant: Temporal.Instant;
      wallClockStatus: WallClockStatus;
      /** The wall time kept from the previous moment, before any gap shift. */
      requestedWallTime: Temporal.PlainTime;
      /** The row a wall-time input was typed in; ends with any other change of the moment. */
      wallTimeTarget?: WallTimeTarget;
    };

export const LIVE_REFERENCE_MOMENT: ReferenceMoment = {
  mode: ReferenceMode.LIVE,
};

/**
 * Zone the reference date is read in: the home location's zone, else the
 * device zone (ADR-0007). The one place that decides it.
 * Implements FR4 of set-home-location-and-show-differences (D2).
 */
export function getReferenceZone(state: WorldClockState): string {
  const home = state.locations.find(
    (location) => location.id === state.homeLocationId,
  );
  return home?.timeZoneId ?? state.deviceTimeZoneId;
}

/** `now` while live, the pinned instant otherwise. Implements FR1, FR5. */
export function getEffectiveInstant(
  state: WorldClockState,
  now: Temporal.Instant,
): Temporal.Instant {
  return state.reference.mode === ReferenceMode.PINNED
    ? state.reference.instant
    : now;
}
