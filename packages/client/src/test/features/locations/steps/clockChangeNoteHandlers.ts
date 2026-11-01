// Verifies FR1–FR8 of show-clock-change-note-on-location-cards.
import { expect } from "vitest";
import type { createClockChangeNoteWorld } from "./clockChangeNoteWorld";
import { plainSpaces } from "./clockChangeNoteWorld";

type ClockChangeNoteWorld = ReturnType<typeof createClockChangeNoteWorld>;

/** Step handlers shared by the clock change note unit step files. */
export function createClockChangeNoteHandlers(world: ClockChangeNoteWorld) {
  const noteOf = (label: string) =>
    plainSpaces(world.rowOf(label).clockChangeNote);
  const thenNoNote = (_ctx: unknown, label: string) =>
    expect(world.rowOf(label).clockChangeNote).toBeUndefined();
  return {
    noteOf,
    thenNoNote,
    givenLanguage: (_ctx: unknown, name: string) => world.setLanguage(name),
    givenHourFormat: (_ctx: unknown, name: string) => world.setHourFormat(name),
    givenZone: (_ctx: unknown, timeZoneId: string) =>
      world.setDeviceTimeZone(timeZoneId),
    givenInstant: (_ctx: unknown, timestamp: string) => world.setNow(timestamp),
    givenList: (_ctx: unknown, labels: string) => world.setList(labels),
    whenPinned: (_ctx: unknown, instant: string) => world.pin(instant),
    whenHome: (_ctx: unknown, label: string) => world.setHome(label),
    whenOpened: () => undefined,
    whenTyped: (_ctx: unknown, time: string, label: string) =>
      world.typeWallTime(label, time),
    thenNote: (_ctx: unknown, label: string, text: string) =>
      expect(noteOf(label)).toBe(text),
    thenHasNote: (_ctx: unknown, label: string) =>
      expect(world.rowOf(label).clockChangeNote).toBeDefined(),
    thenHintOnly: (_ctx: unknown, label: string) => {
      const row = world.rowOf(label);
      expect(row.wallTimeHint).toBeDefined();
      expect(row.clockChangeNote).toBeUndefined();
    },
  };
}
