// Verifies FR5 of fix-grid-meeting-range-lock-and-layering.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import { ReferenceMode, WallTimeTargetKind } from "./referenceMoment";

const city = (timeZoneId: string, label: string): Location => ({
  id: label,
  kind: LocationKind.CITY,
  timeZoneId,
  label,
  countryCode: "XX",
});
const baseState: WorldClockState = {
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "Asia/Almaty",
  locations: [
    city("Asia/Almaty", "Almaty"),
    city("Europe/Moscow", "Moscow"),
    city("Asia/Kolkata", "Kolkata"),
    city("America/New_York", "New York"),
  ],
  homeLocationId: "Almaty",
};
const setFromWallTimes = (
  state: WorldClockState,
  locationId: string,
  date: string,
  start: string,
  end: string,
) =>
  reduceLocations(state, {
    type: LocationCommandType.SET_MEETING_RANGE_WALL_TIMES,
    target: { kind: WallTimeTargetKind.LOCATION, locationId },
    date,
    start,
    end,
  });
const rangeOf = (state: WorldClockState) =>
  `${state.meeting?.start.toString()}/${state.meeting?.end.toString()}`;
const SAMPLE_RANGE = "2026-03-08T04:00:00Z/2026-03-08T06:00:00Z";
const sampleState = (() => {
  const outcome = setFromWallTimes(
    baseState,
    "Almaty",
    "2026-03-08",
    "09:00",
    "11:00",
  );
  if (!outcome.ok) throw new Error("sample failed");
  return outcome.state;
})();

describe("SET_MEETING_RANGE_WALL_TIMES", () => {
  it.each([
    [
      "Almaty",
      "2026-03-08",
      "10:00",
      "12:30",
      "2026-03-08T05:00:00Z/2026-03-08T07:30:00Z",
    ],
    [
      "Moscow",
      "2026-03-08",
      "08:00",
      "10:30",
      "2026-03-08T05:00:00Z/2026-03-08T07:30:00Z",
    ],
    ["Kolkata", "2026-03-08", "09:30", "11:30", SAMPLE_RANGE],
    ["New York", "2026-03-07", "23:00", "01:00", SAMPLE_RANGE],
  ])(
    "should set the range from %s wall times",
    (cityLabel, date, start, end, range) => {
      const outcome = setFromWallTimes(baseState, cityLabel, date, start, end);
      if (!outcome.ok) throw new Error(outcome.error);
      expect(rangeOf(outcome.state)).toBe(range);
    },
  );

  it("should pin the reference moment at the start", () => {
    const { reference, meeting } = sampleState;
    if (reference.mode !== ReferenceMode.PINNED) throw new Error("not pinned");
    expect(reference.instant.equals(meeting?.start ?? reference.instant)).toBe(
      true,
    );
    expect(reference.instant.toString()).toBe("2026-03-08T04:00:00Z");
  });

  it.each([
    [
      "Almaty",
      "2026-03-08",
      "09:10",
      "11:00",
      LocationErrorCode.INVALID_MEETING_RANGE,
    ],
    [
      "Almaty",
      "2026-03-08",
      "22:00",
      "02:00",
      LocationErrorCode.INVALID_MEETING_RANGE,
    ],
    [
      "New York",
      "2026-03-07",
      "13:00",
      "15:00",
      LocationErrorCode.INVALID_MEETING_RANGE,
    ],
    ["Almaty", "2026-03-08", "25:00", "11:00", LocationErrorCode.INVALID_TIME],
    ["Almaty", "2026-03-08", "09:00", "9:00", LocationErrorCode.INVALID_TIME],
    ["Almaty", "2026-13-08", "09:00", "11:00", LocationErrorCode.INVALID_DATE],
    [
      "Tokyo",
      "2026-03-08",
      "09:00",
      "11:00",
      LocationErrorCode.LOCATION_NOT_FOUND,
    ],
    [
      "Almaty",
      "+275760-09-13",
      "09:00",
      "11:00",
      LocationErrorCode.INVALID_MEETING_RANGE,
    ],
  ])(
    "should refuse %s %s %s-%s with %s",
    (cityLabel, date, start, end, error) => {
      const outcome = setFromWallTimes(
        sampleState,
        cityLabel,
        date,
        start,
        end,
      );
      expect(outcome).toEqual({ ok: false, error });
    },
  );

  it("should set the whole reference day from 00:00 to 00:00", () => {
    const outcome = setFromWallTimes(
      baseState,
      "Almaty",
      "2026-03-08",
      "00:00",
      "00:00",
    );
    if (!outcome.ok) throw new Error(outcome.error);
    expect(rangeOf(outcome.state)).toBe(
      "2026-03-07T19:00:00Z/2026-03-08T19:00:00Z",
    );
  });

  it("should resolve a start in a gap forward", () => {
    const outcome = setFromWallTimes(
      baseState,
      "New York",
      "2026-03-08",
      "02:30",
      "04:00",
    );
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.state.meeting?.start.toString()).toBe(
      "2026-03-08T07:30:00Z",
    );
  });

  it("should return the same state for the same range", () => {
    const outcome = setFromWallTimes(
      sampleState,
      "Almaty",
      "2026-03-08",
      "09:00",
      "11:00",
    );
    expect(outcome).toEqual({ ok: true, state: sampleState });
  });
});
