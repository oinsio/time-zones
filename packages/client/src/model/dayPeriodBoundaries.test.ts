// Verifies FR1, FR2, FR3, FR7 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { DAY_PERIOD_BLEND_MINUTES, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getLocalNoon,
  minutesBetween,
  REFERENCE_CITIES,
  toEpochMilliseconds,
} from "@/test/sunFixtures";
import { getDayPeriodBoundaries } from "./dayPeriodBoundaries";
import { DayPeriod, getDayPeriodAt } from "./dayPeriods";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";

const STEP_MINUTES = 5;
const EDGE_MARGIN_MINUTES = 1;

const getDayOf = (timeZoneId: string, date: string) =>
  getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: timeZoneId },
    Temporal.Instant.fromEpochMilliseconds(getLocalNoon(date, timeZoneId)),
  );

describe("getDayPeriodBoundaries", () => {
  it.each(REFERENCE_CITIES)(
    "should keep getDayPeriodAt constant between the boundaries of $name",
    ({ latitude, longitude, timeZoneId, date }) => {
      const coordinates = { latitude, longitude };
      const day = getDayOf(timeZoneId, date);
      const boundaries = getDayPeriodBoundaries(coordinates, day);
      const startMilliseconds = day.start.epochMilliseconds;
      for (
        let minutes = 0;
        minutes < day.lengthMinutes;
        minutes += STEP_MINUTES
      ) {
        const instant = startMilliseconds + minutes * MILLISECONDS_PER_MINUTE;
        const isNearBoundary = boundaries.some(
          (boundary) =>
            minutesBetween(boundary.instant.epochMilliseconds, instant) <=
            EDGE_MARGIN_MINUTES,
        );
        if (isNearBoundary) continue;
        const passed = boundaries.filter(
          (boundary) => boundary.instant.epochMilliseconds <= instant,
        );
        const expected =
          passed.length > 0
            ? passed[passed.length - 1].to
            : (boundaries[0]?.from ?? getDayPeriodAt(coordinates, instant));
        expect(getDayPeriodAt(coordinates, instant)).toBe(expected);
      }
    },
  );

  it("should list the four crossings of Almaty in order", () => {
    const day = getDayOf("Asia/Almaty", "2026-03-08");
    const boundaries = getDayPeriodBoundaries(
      { latitude: 43.3, longitude: 76.9 },
      day,
    );
    expect(boundaries.map(({ from, to }) => [from, to])).toEqual([
      [DayPeriod.NIGHT, DayPeriod.MORNING],
      [DayPeriod.MORNING, DayPeriod.DAY],
      [DayPeriod.DAY, DayPeriod.EVENING],
      [DayPeriod.EVENING, DayPeriod.NIGHT],
    ]);
  });

  it("should put solar noon as morning to evening for Murmansk in December", () => {
    const day = getDayOf("Europe/Moscow", "2026-12-21");
    const boundaries = getDayPeriodBoundaries(
      { latitude: 69.0, longitude: 33.1 },
      day,
    );
    expect(boundaries.map(({ from, to }) => [from, to])).toEqual([
      [DayPeriod.NIGHT, DayPeriod.MORNING],
      [DayPeriod.MORNING, DayPeriod.EVENING],
      [DayPeriod.EVENING, DayPeriod.NIGHT],
    ]);
  });

  it("should put solar midnight as evening to morning for Murmansk in June", () => {
    const day = getDayOf("Europe/Moscow", "2026-06-21");
    const boundaries = getDayPeriodBoundaries(
      { latitude: 69.0, longitude: 33.1 },
      day,
    );
    const midnight = boundaries[0];
    expect([midnight.from, midnight.to]).toEqual([
      DayPeriod.EVENING,
      DayPeriod.MORNING,
    ]);
    expect(
      minutesBetween(
        midnight.instant.epochMilliseconds,
        toEpochMilliseconds("2026-06-21", "00:49", "Europe/Moscow"),
      ),
    ).toBeLessThan(DAY_PERIOD_BLEND_MINUTES);
  });

  it.each([
    ["Longyearbyen December", "Arctic/Longyearbyen", "2026-12-21"],
    ["Longyearbyen June", "Arctic/Longyearbyen", "2026-06-21"],
  ])("should list no boundary for %s", (_name, timeZoneId, date) => {
    expect(
      getDayPeriodBoundaries(
        { latitude: 78.2, longitude: 15.6 },
        getDayOf(timeZoneId, date),
      ),
    ).toEqual([]);
  });

  it("should not move a boundary at a clock change", () => {
    const newYork = { latitude: 40.7, longitude: -74.0 };
    const boundaries = getDayPeriodBoundaries(
      newYork,
      getDayOf("America/New_York", "2026-03-08"),
    );
    const nightEnds = boundaries[0].instant.toZonedDateTimeISO("UTC");
    expect(
      minutesBetween(
        nightEnds.epochMilliseconds,
        toEpochMilliseconds("2026-03-08", "06:51", "America/New_York"),
      ),
    ).toBeLessThan(DAY_PERIOD_BLEND_MINUTES / 2);
  });
});
