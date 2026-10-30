import type { Temporal } from "@/lib/temporal";
import type { WorldClockState } from "./locations";
import { ReferenceMode, type WallTimeTarget } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

/** Where the one note about a wall-clock time is shown. */
export enum WallClockNotePlacement {
  NONE = "NONE",
  DATE_BAR = "DATE_BAR",
  ROW = "ROW",
}

export type WallClockNote =
  | { placement: WallClockNotePlacement.NONE }
  | {
      placement: WallClockNotePlacement.DATE_BAR;
      requestedWallTime: Temporal.PlainTime;
    }
  | {
      placement: WallClockNotePlacement.ROW;
      target: WallTimeTarget;
      status: WallClockStatus;
      requestedWallTime: Temporal.PlainTime;
    };

const NO_NOTE: WallClockNote = { placement: WallClockNotePlacement.NONE };

function isTargetShown(
  state: WorldClockState,
  target: WallTimeTarget,
): boolean {
  return state.locations.some((location) => location.id === target.locationId);
}

/**
 * The one note about a wall-clock time: the gap note in the date bar after a
 * date change, or the wall-time hint in the row a time was typed in, never
 * both. The one place that decides it.
 * Implements FR7, FR9 of add-wall-time-input-with-hint (D2).
 */
export function getWallClockNote(state: WorldClockState): WallClockNote {
  const { reference } = state;
  if (
    reference.mode !== ReferenceMode.PINNED ||
    reference.wallClockStatus === WallClockStatus.UNIQUE
  ) {
    return NO_NOTE;
  }
  const { wallTimeTarget, wallClockStatus, requestedWallTime } = reference;
  if (wallTimeTarget === undefined) {
    return wallClockStatus === WallClockStatus.GAP
      ? { placement: WallClockNotePlacement.DATE_BAR, requestedWallTime }
      : NO_NOTE;
  }
  return isTargetShown(state, wallTimeTarget)
    ? {
        placement: WallClockNotePlacement.ROW,
        target: wallTimeTarget,
        status: wallClockStatus,
        requestedWallTime,
      }
    : NO_NOTE;
}
