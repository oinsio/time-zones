// Verifies FR1, FR2, FR3, FR4 of add-time-sliders-to-location-cards (D2).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getInstantAfterTrackMove,
  getInstantAtTrackFraction,
  getLastTrackStepMinutes,
  getReferenceDay,
  getTrackFraction,
  getTrackValueMinutes,
  TrackMove,
} from "./dayTrack";
import { INITIAL_LOCATIONS_STATE, type LocationsState } from "./locations";
import { ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const stateIn = (deviceTimeZoneId: string): LocationsState => ({
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId,
});
const instantOf = (iso: string) => Temporal.Instant.from(iso);
const dayOf = (zone: string, iso: string) =>
  getReferenceDay(stateIn(zone), instantOf(iso));

const ALMATY_DAY = dayOf("Asia/Almaty", "2026-03-08T07:30:00Z");

describe("getReferenceDay", () => {
  it("should span local midnight to local midnight in Almaty", () => {
    expect(ALMATY_DAY.start.toString()).toBe("2026-03-07T19:00:00Z");
    expect(ALMATY_DAY.end.toString()).toBe("2026-03-08T19:00:00Z");
    expect(ALMATY_DAY.lengthMinutes).toBe(1440);
  });

  it.each([
    ["America/New_York", "2026-03-08T12:00:00Z", 1380],
    ["America/New_York", "2026-11-01T12:00:00Z", 1500],
    ["America/New_York", "2026-06-01T12:00:00Z", 1440],
  ])("should be %s %s long %i minutes", (zone, iso, minutes) => {
    expect(dayOf(zone, iso).lengthMinutes).toBe(minutes);
  });

  it("should read the pinned instant instead of now", () => {
    const state: LocationsState = {
      ...stateIn("Asia/Almaty"),
      reference: {
        mode: ReferenceMode.PINNED,
        instant: instantOf("2026-03-10T07:30:00Z"),
        wallClockStatus: WallClockStatus.UNIQUE,
        requestedWallTime: Temporal.PlainTime.from("12:30"),
      },
    };

    const day = getReferenceDay(state, instantOf("2026-03-08T07:30:00Z"));

    expect(day.start.toString()).toBe("2026-03-09T19:00:00Z");
  });
});

describe("track position", () => {
  it("should give the fraction, value and last step of Almaty", () => {
    const instant = instantOf("2026-03-08T07:30:00Z");

    expect(getTrackFraction(ALMATY_DAY, instant)).toBeCloseTo(0.520833, 6);
    expect(getTrackValueMinutes(ALMATY_DAY, instant)).toBe(750);
    expect(getLastTrackStepMinutes(ALMATY_DAY)).toBe(1425);
  });

  it("should floor the value minutes", () => {
    expect(
      getTrackValueMinutes(ALMATY_DAY, instantOf("2026-03-08T07:37:59Z")),
    ).toBe(757);
  });

  it("should give the fraction of a UTC day at 12:01", () => {
    const day = dayOf("UTC", "2026-07-15T12:00:00Z");

    expect(
      getTrackFraction(day, instantOf("2026-07-15T12:01:00Z")),
    ).toBeCloseTo(0.500694, 6);
  });

  it.each([
    [0.75, "2026-03-08T13:00:00Z"],
    [0.52, "2026-03-08T07:30:00Z"],
    [1, "2026-03-08T18:45:00Z"],
    [0, "2026-03-07T19:00:00Z"],
    [-0.3, "2026-03-07T19:00:00Z"],
    [7, "2026-03-08T18:45:00Z"],
  ])("should pick fraction %f at %s", (fraction, expected) => {
    expect(getInstantAtTrackFraction(ALMATY_DAY, fraction).toString()).toBe(
      expected,
    );
  });

  it("should pick half of a 23-hour New York day at 12:30", () => {
    const day = dayOf("America/New_York", "2026-03-08T12:00:00Z");

    expect(getLastTrackStepMinutes(day)).toBe(1365);
    expect(getInstantAtTrackFraction(day, 0.5).toString()).toBe(
      "2026-03-08T16:30:00Z",
    );
  });

  it("should have a last step of 1485 on a 25-hour day", () => {
    expect(
      getLastTrackStepMinutes(
        dayOf("America/New_York", "2026-11-01T12:00:00Z"),
      ),
    ).toBe(1485);
  });
});

describe("getInstantAfterTrackMove", () => {
  it.each([
    [TrackMove.NEXT_STEP, "2026-03-08T07:30:00Z", "2026-03-08T07:45:00Z"],
    [TrackMove.PREVIOUS_STEP, "2026-03-08T07:30:00Z", "2026-03-08T07:15:00Z"],
    [TrackMove.HOUR_FORWARD, "2026-03-08T07:30:00Z", "2026-03-08T08:30:00Z"],
    [TrackMove.HOUR_BACK, "2026-03-08T07:30:00Z", "2026-03-08T06:30:00Z"],
    [TrackMove.DAY_START, "2026-03-08T07:30:00Z", "2026-03-07T19:00:00Z"],
    [TrackMove.DAY_END, "2026-03-08T07:30:00Z", "2026-03-08T18:45:00Z"],
    [TrackMove.NEXT_STEP, "2026-03-08T07:37:00Z", "2026-03-08T07:45:00Z"],
    [TrackMove.PREVIOUS_STEP, "2026-03-08T07:37:00Z", "2026-03-08T07:30:00Z"],
    [TrackMove.NEXT_STEP, "2026-03-08T18:45:00Z", "2026-03-08T18:45:00Z"],
    [TrackMove.PREVIOUS_STEP, "2026-03-07T19:00:00Z", "2026-03-07T19:00:00Z"],
    [TrackMove.HOUR_FORWARD, "2026-03-08T07:37:00Z", "2026-03-08T08:30:00Z"],
    [TrackMove.HOUR_BACK, "2026-03-08T07:37:00Z", "2026-03-08T06:45:00Z"],
  ])("should move %s from %s to %s", (move, from, expected) => {
    expect(
      getInstantAfterTrackMove(ALMATY_DAY, instantOf(from), move).toString(),
    ).toBe(expected);
  });
});
