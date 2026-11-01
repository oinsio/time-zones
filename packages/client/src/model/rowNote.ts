import type { Temporal } from "@/lib/temporal";
import {
  type ClockChange,
  type ClockChangeTense,
  findNearestClockChange,
  getClockChanges,
} from "./clockChange";
import type { ClockChangeWindow } from "./dayTrack";
import { type WallClockNote, WallClockNotePlacement } from "./wallClockNote";

/**
 * The one note a location row shows after its day track: the wall-time hint
 * of the row a time was typed in, else the clock change note of its zone,
 * never both. The one place that decides it.
 * Implements FR6 of show-clock-change-note-on-location-cards (D4).
 */

export enum RowNoteKind {
  NONE = "NONE",
  WALL_TIME_HINT = "WALL_TIME_HINT",
  CLOCK_CHANGE_NOTE = "CLOCK_CHANGE_NOTE",
}

export type RowWallClockNote = Extract<
  WallClockNote,
  { placement: WallClockNotePlacement.ROW }
>;

export type RowNote =
  | { kind: RowNoteKind.NONE }
  | { kind: RowNoteKind.WALL_TIME_HINT; wallClockNote: RowWallClockNote }
  | {
      kind: RowNoteKind.CLOCK_CHANGE_NOTE;
      clockChange: ClockChange;
      tense: ClockChangeTense;
    };

const NO_ROW_NOTE: RowNote = { kind: RowNoteKind.NONE };

export function getRowNote({
  wallClockNote,
  locationId,
  timeZoneId,
  window,
  instant,
}: {
  wallClockNote: WallClockNote | undefined;
  locationId: string;
  timeZoneId: string;
  window: ClockChangeWindow;
  instant: Temporal.Instant;
}): RowNote {
  if (
    wallClockNote?.placement === WallClockNotePlacement.ROW &&
    wallClockNote.target.locationId === locationId
  ) {
    return { kind: RowNoteKind.WALL_TIME_HINT, wallClockNote };
  }
  const nearest = findNearestClockChange(
    getClockChanges(timeZoneId, window),
    instant,
  );
  return nearest === undefined
    ? NO_ROW_NOTE
    : { kind: RowNoteKind.CLOCK_CHANGE_NOTE, ...nearest };
}
