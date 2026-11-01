// Verifies FR5, FR6 of show-clock-change-note-on-location-cards (D4).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ClockChangeDirection, ClockChangeTense } from "./clockChange";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";
import { WallTimeTargetKind } from "./referenceMoment";
import { getRowNote, RowNoteKind } from "./rowNote";
import { WallClockStatus } from "./wallClock";
import { type WallClockNote, WallClockNotePlacement } from "./wallClockNote";

const instant = Temporal.Instant.from("2026-10-20T09:00:00Z");
const window = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Europe/Belgrade" },
  instant,
).clockChangeWindow;
const rowNoteAbout = (locationId: string): WallClockNote => ({
  placement: WallClockNotePlacement.ROW,
  target: { kind: WallTimeTargetKind.LOCATION, locationId },
  status: WallClockStatus.GAP,
  requestedWallTime: Temporal.PlainTime.from("02:30"),
});
const noteFor = (
  timeZoneId: string,
  wallClockNote: WallClockNote | undefined,
  locationId = "belgrade",
) => getRowNote({ wallClockNote, locationId, timeZoneId, window, instant });

describe("getRowNote", () => {
  it("should return the wall-time hint for its row even with a clock change", () => {
    const wallClockNote = rowNoteAbout("belgrade");

    expect(noteFor("Europe/Belgrade", wallClockNote)).toEqual({
      kind: RowNoteKind.WALL_TIME_HINT,
      wallClockNote,
    });
  });

  it("should return the clock change note for another row", () => {
    const note = noteFor("Europe/Belgrade", rowNoteAbout("new-york"));

    expect(note.kind).toBe(RowNoteKind.CLOCK_CHANGE_NOTE);
    expect(note).toMatchObject({
      tense: ClockChangeTense.FUTURE,
      clockChange: { direction: ClockChangeDirection.BACK, amountMinutes: 60 },
    });
  });

  it("should return the clock change note when the note is in the date bar", () => {
    const note = noteFor("Europe/Belgrade", {
      placement: WallClockNotePlacement.DATE_BAR,
      requestedWallTime: Temporal.PlainTime.from("02:30"),
    });

    expect(note.kind).toBe(RowNoteKind.CLOCK_CHANGE_NOTE);
  });

  it("should return the clock change note without any wall-clock note", () => {
    expect(noteFor("Europe/Belgrade", undefined).kind).toBe(
      RowNoteKind.CLOCK_CHANGE_NOTE,
    );
  });

  it("should return none for a zone without a change", () => {
    expect(noteFor("Asia/Tokyo", undefined)).toEqual({
      kind: RowNoteKind.NONE,
    });
  });

  it("should return none for an unknown zone", () => {
    expect(noteFor("Mars/Olympus", undefined)).toEqual({
      kind: RowNoteKind.NONE,
    });
  });
});
