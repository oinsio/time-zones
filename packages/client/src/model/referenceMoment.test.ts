// Verifies FR1, FR2, FR6 of select-date-with-calendar-and-now (D1).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  liveState,
  NOW,
  pinnedInstantOf,
  pinnedState,
  reduceAll,
  setDate,
  shift,
} from "@/test/referenceMomentSupport";
import {
  INITIAL_LOCATIONS_STATE,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
} from "./locations";
import {
  getEffectiveInstant,
  getReferenceZone,
  LIVE_REFERENCE_MOMENT,
  ReferenceMode,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

describe("reference moment state", () => {
  it("should start live", () => {
    expect(INITIAL_LOCATIONS_STATE.reference).toEqual(LIVE_REFERENCE_MOMENT);
  });

  it("should use the clock instant while live", () => {
    const now = Temporal.Instant.from(NOW);

    expect(getEffectiveInstant(liveState("UTC"), now)).toBe(now);
  });

  it("should use the pinned instant while pinned", () => {
    const state = pinnedState("UTC", "2026-03-09T07:30:00Z");

    expect(
      getEffectiveInstant(state, Temporal.Instant.from(NOW)).toString(),
    ).toBe("2026-03-09T07:30:00Z");
  });

  it("should take the reference zone from the device zone", () => {
    expect(getReferenceZone(liveState("Asia/Almaty"))).toBe("Asia/Almaty");
  });
});

describe("date commands", () => {
  it.each([
    [shift(1)],
    [shift(-1)],
    [setDate("2026-07-15")],
    [{ type: LocationCommandType.RESET_TO_NOW } as LocationCommand],
  ])("should reduce %j the same after a JSON round trip", (command) => {
    const state = liveState("Asia/Almaty");
    const replayed = JSON.parse(JSON.stringify(command)) as LocationCommand;

    expect(replayed).toEqual(command);
    expect(reduceLocations(state, replayed)).toEqual(
      reduceLocations(state, command),
    );
  });

  it.each([
    ["SET_DATE with month 13", setDate("2026-13-01")],
    ["SET_DATE with a garbage date", setDate("tomorrow")],
    [
      "SET_DATE with now lacking Z",
      setDate("2026-03-09", "2026-03-08T07:30:00"),
    ],
    ["SHIFT_DATE with now lacking Z", shift(1, "2026-03-08T07:30:00")],
  ])("should reject %s as an invalid date", (_name, command) => {
    expect(reduceLocations(liveState("Asia/Almaty"), command)).toEqual({
      ok: false,
      error: LocationErrorCode.INVALID_DATE,
    });
  });

  it.each([
    [1, "2026-03-09T07:30:00Z"],
    [-1, "2026-03-07T07:30:00Z"],
  ])("should shift %i day(s) from live", (days, expected) => {
    const state = reduceAll(liveState("Asia/Almaty"), [shift(days)]);

    expect(state.reference).toMatchObject({
      mode: ReferenceMode.PINNED,
      wallClockStatus: WallClockStatus.UNIQUE,
    });
    expect(pinnedInstantOf(state)).toBe(expected);
  });

  it("should add up moves from the pinned moment", () => {
    const state = reduceAll(liveState("Asia/Almaty"), [
      shift(1),
      shift(1),
      shift(-1),
    ]);

    expect(pinnedInstantOf(state)).toBe("2026-03-09T07:30:00Z");
  });
});
