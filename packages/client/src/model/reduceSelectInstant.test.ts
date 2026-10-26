// Verifies FR3, FR5, FR8 of add-time-sliders-to-location-cards (D1).
import { describe, expect, it } from "vitest";
import {
  INITIAL_LOCATIONS_STATE,
  LocationCommandType,
  LocationErrorCode,
  type LocationsState,
  reduceLocations,
} from "./locations";
import { ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const ALMATY_STATE: LocationsState = {
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId: "Asia/Almaty",
};
const NEW_YORK_STATE: LocationsState = {
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId: "America/New_York",
};

const selectInstant = (state: LocationsState, instant: string) =>
  reduceLocations(state, {
    type: LocationCommandType.SELECT_INSTANT,
    instant,
  });

const expectOk = (outcome: ReturnType<typeof reduceLocations>) => {
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};

describe("reduceLocations SELECT_INSTANT", () => {
  it("should pin a live moment to the instant with the reference wall time", () => {
    const state = expectOk(selectInstant(ALMATY_STATE, "2026-03-08T13:00:00Z"));

    expect(state.reference).toMatchObject({
      mode: ReferenceMode.PINNED,
      wallClockStatus: WallClockStatus.UNIQUE,
    });
    if (state.reference.mode !== ReferenceMode.PINNED) throw new Error();
    expect(state.reference.instant.toString()).toBe("2026-03-08T13:00:00Z");
    expect(state.reference.requestedWallTime.toString()).toBe("18:00:00");
  });

  it("should return the same state when the instant is already pinned", () => {
    const pinned = expectOk(
      selectInstant(ALMATY_STATE, "2026-03-08T13:00:00Z"),
    );

    const outcome = selectInstant(pinned, "2026-03-08T13:00:00Z");

    expect(expectOk(outcome)).toBe(pinned);
  });

  it("should end a gap status with a unique one", () => {
    const gapState = expectOk(
      reduceLocations(NEW_YORK_STATE, {
        type: LocationCommandType.SHIFT_DATE,
        days: 0,
        now: "2026-03-07T07:30:00Z",
      }),
    );
    const pinnedInGap = expectOk(
      reduceLocations(gapState, {
        type: LocationCommandType.SET_DATE,
        date: "2026-03-08",
        now: "2026-03-07T07:30:00Z",
      }),
    );
    expect(pinnedInGap.reference).toMatchObject({
      wallClockStatus: WallClockStatus.GAP,
    });

    const state = expectOk(selectInstant(pinnedInGap, "2026-03-08T07:45:00Z"));

    expect(state.reference).toMatchObject({
      wallClockStatus: WallClockStatus.UNIQUE,
    });
  });

  it.each([
    "2026-03-08T07:30:00",
    "2026-03-08T07:30:00+05:00",
    "not-an-instant",
  ])("should reject the malformed instant %s", (instant) => {
    expect(selectInstant(ALMATY_STATE, instant)).toEqual({
      ok: false,
      error: LocationErrorCode.INVALID_INSTANT,
    });
  });

  it("should replay from JSON", () => {
    const command = {
      type: LocationCommandType.SELECT_INSTANT,
      instant: "2026-03-08T13:00:00Z",
    } as const;

    expect(JSON.parse(JSON.stringify(command))).toEqual(command);
  });

  it("should keep the wall time on a later date shift", () => {
    const pinned = expectOk(
      selectInstant(ALMATY_STATE, "2026-03-08T13:00:00Z"),
    );

    const state = expectOk(
      reduceLocations(pinned, {
        type: LocationCommandType.SHIFT_DATE,
        days: 1,
        now: "2026-03-08T13:00:00Z",
      }),
    );

    if (state.reference.mode !== ReferenceMode.PINNED) throw new Error();
    expect(state.reference.instant.toString()).toBe("2026-03-09T13:00:00Z");
  });

  it("should keep the pinned moment when the locations are replaced", () => {
    const pinned = expectOk(
      selectInstant(ALMATY_STATE, "2026-03-08T13:00:00Z"),
    );

    const state = expectOk(
      reduceLocations(pinned, {
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations: [],
      }),
    );

    expect(state.reference).toBe(pinned.reference);
  });
});

describe("reduceLocations SELECT_INSTANT with a non-string instant", () => {
  it("should not hide a programming error as an invalid instant", () => {
    expect(() =>
      selectInstant(ALMATY_STATE, undefined as unknown as string),
    ).toThrow(TypeError);
  });
});
