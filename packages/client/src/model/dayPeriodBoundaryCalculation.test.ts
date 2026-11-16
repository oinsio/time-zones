// Verifies FR5, NFR-P1 of bind-day-periods-to-sun (D2: the half blend window margin).
import { describe, expect, it } from "vitest";
import { DAY_PERIOD_BLEND_MINUTES, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { computeDayPeriodBoundaries } from "./dayPeriodBoundaryCalculation";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";
import { type SolarDay, SunThresholdState } from "./sun";

const DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "UTC" },
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);
const COORDINATES = { latitude: 55.8, longitude: 37.6 };
const HALF_WINDOW_MINUTES = DAY_PERIOD_BLEND_MINUTES / 2;
const MINUTES_PER_HOUR = 60;
const SOLAR_MARGIN_MINUTES = 12 * MINUTES_PER_HOUR;

const minutesToMilliseconds = (minutes: number) =>
  minutes * MILLISECONDS_PER_MINUTE;

/** One solar day around the reference day whose only crossing is the night threshold rising at `crossing`. */
const readSolarDayWithCrossing = (crossing: number) => (): SolarDay => ({
  solarMidnightBefore:
    DAY.start.epochMilliseconds - minutesToMilliseconds(SOLAR_MARGIN_MINUTES),
  solarMidnightAfter:
    DAY.end.epochMilliseconds + minutesToMilliseconds(SOLAR_MARGIN_MINUTES),
  solarNoon:
    DAY.end.epochMilliseconds + minutesToMilliseconds(SOLAR_MARGIN_MINUTES),
  night: { state: SunThresholdState.CROSSES, rising: crossing },
  day: { state: SunThresholdState.STAYS_BELOW },
});

describe("computeDayPeriodBoundaries", () => {
  it.each([
    { name: "after the day end", edge: DAY.end.epochMilliseconds, sign: 1 },
    {
      name: "before the day start",
      edge: DAY.start.epochMilliseconds,
      sign: -1,
    },
  ])(
    "should list a crossing just inside the half window $name",
    ({ edge, sign }) => {
      const crossing =
        edge + sign * minutesToMilliseconds(HALF_WINDOW_MINUTES - 1);
      const boundaries = computeDayPeriodBoundaries(
        readSolarDayWithCrossing(crossing),
        COORDINATES,
        DAY,
      );
      expect(boundaries).toHaveLength(1);
    },
  );

  it.each([
    { name: "after the day end", edge: DAY.end.epochMilliseconds, sign: 1 },
    {
      name: "before the day start",
      edge: DAY.start.epochMilliseconds,
      sign: -1,
    },
  ])(
    "should drop a crossing just outside the half window $name",
    ({ edge, sign }) => {
      const crossing =
        edge + sign * minutesToMilliseconds(HALF_WINDOW_MINUTES + 1);
      const boundaries = computeDayPeriodBoundaries(
        readSolarDayWithCrossing(crossing),
        COORDINATES,
        DAY,
      );
      expect(boundaries).toHaveLength(0);
    },
  );
});
