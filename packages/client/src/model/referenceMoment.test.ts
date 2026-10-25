// Verifies FR1, FR2, FR3, FR4, FR6, FR10 of select-date-with-calendar-and-now (D1).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  INITIAL_LOCATIONS_STATE,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsState,
  reduceLocations,
} from "./locations";
import {
  getEffectiveInstant,
  getReferenceZone,
  LIVE_REFERENCE_MOMENT,
  ReferenceMode,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const NOW = "2026-03-08T07:30:00Z";
const MAX_INSTANT = "+275760-09-13T00:00:00Z";

const liveState = (deviceTimeZoneId: string): LocationsState => ({
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId,
});

const pinnedState = (
  deviceTimeZoneId: string,
  instant: string,
): LocationsState => ({
  ...liveState(deviceTimeZoneId),
  reference: {
    mode: ReferenceMode.PINNED,
    instant: Temporal.Instant.from(instant),
    wallClockStatus: WallClockStatus.UNIQUE,
    requestedWallTime: Temporal.PlainTime.from("12:30"),
  },
});

const shift = (days: number, now = NOW): LocationCommand => ({
  type: LocationCommandType.SHIFT_DATE,
  days,
  now,
});

const setDate = (date: string, now = NOW): LocationCommand => ({
  type: LocationCommandType.SET_DATE,
  date,
  now,
});

function reduceAll(state: LocationsState, commands: LocationCommand[]) {
  let current = state;
  for (const command of commands) {
    const outcome = reduceLocations(current, command);
    if (!outcome.ok) throw new Error(outcome.error);
    current = outcome.state;
  }
  return current;
}

const pinnedInstantOf = (state: LocationsState) =>
  state.reference.mode === ReferenceMode.PINNED
    ? state.reference.instant.toString()
    : undefined;

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

  it("should pin the picked date keeping the wall time", () => {
    const state = reduceAll(liveState("Asia/Almaty"), [setDate("2026-07-15")]);

    expect(pinnedInstantOf(state)).toBe("2026-07-15T07:30:00Z");
  });

  it("should return the same state when the shown date is picked from live", () => {
    const state = liveState("Asia/Almaty");

    expect(reduceLocations(state, setDate("2026-03-08"))).toEqual({
      ok: true,
      state,
    });
    const outcome = reduceLocations(state, setDate("2026-03-08"));
    expect(outcome.ok && outcome.state).toBe(state);
  });

  it("should return the same state when the pinned date is picked again", () => {
    const state = pinnedState("Asia/Almaty", "2026-03-09T07:30:00Z");

    const outcome = reduceLocations(state, setDate("2026-03-09"));

    expect(outcome.ok && outcome.state).toBe(state);
  });

  it.each([
    [
      "2026-06-01T14:00:00Z",
      "2026-06-02T14:00:00Z",
      WallClockStatus.UNIQUE,
      "10:00",
    ],
    [
      "2026-03-07T07:30:00Z",
      "2026-03-08T07:30:00Z",
      WallClockStatus.GAP,
      "02:30",
    ],
    [
      "2026-10-31T05:30:00Z",
      "2026-11-01T05:30:00Z",
      WallClockStatus.AMBIGUOUS,
      "01:30",
    ],
  ])(
    "should shift from %s to %s as %s in New York",
    (now, expected, status, wallTime) => {
      const state = reduceAll(liveState("America/New_York"), [shift(1, now)]);

      expect(pinnedInstantOf(state)).toBe(expected);
      expect(state.reference).toMatchObject({
        wallClockStatus: status,
        requestedWallTime: Temporal.PlainTime.from(wallTime),
      });
    },
  );

  it("should return to live from pinned", () => {
    const state = pinnedState("UTC", "2026-03-09T07:30:00Z");

    const outcome = reduceLocations(state, {
      type: LocationCommandType.RESET_TO_NOW,
    });

    expect(outcome.ok && outcome.state.reference).toEqual(
      LIVE_REFERENCE_MOMENT,
    );
  });

  it("should return the same state when resetting a live moment", () => {
    const state = liveState("UTC");

    const outcome = reduceLocations(state, {
      type: LocationCommandType.RESET_TO_NOW,
    });

    expect(outcome.ok && outcome.state).toBe(state);
  });

  it("should reject a move beyond the supported range", () => {
    const state = pinnedState("Asia/Almaty", MAX_INSTANT);

    expect(reduceLocations(state, shift(1))).toEqual({
      ok: false,
      error: LocationErrorCode.DATE_OUT_OF_RANGE,
    });
  });

  it("should keep the reference when the device zone changes", () => {
    const state = pinnedState("UTC", "2026-03-09T07:30:00Z");

    const outcome = reduceLocations(state, {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Asia/Almaty",
    });

    expect(outcome.ok && outcome.state.reference).toBe(state.reference);
  });

  it("should keep the reference when the locations are replaced", () => {
    const state = pinnedState("UTC", "2026-03-09T07:30:00Z");

    const outcome = reduceLocations(state, {
      type: LocationCommandType.REPLACE_LOCATIONS,
      locations: [],
    });

    expect(outcome.ok && outcome.state.reference).toBe(state.reference);
  });
});
