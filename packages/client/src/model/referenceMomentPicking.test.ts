// Verifies FR3, FR4, FR6, FR10 of select-date-with-calendar-and-now (D1).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  liveState,
  MAX_INSTANT,
  pinnedInstantOf,
  pinnedState,
  reduceAll,
  setDate,
  shift,
} from "@/test/referenceMomentSupport";
import {
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
} from "./locations";
import { LIVE_REFERENCE_MOMENT } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

describe("date commands: picking, resetting and keeping", () => {
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
