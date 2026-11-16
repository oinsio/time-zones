// Verifies FR1, FR2, FR3, FR4 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import {
  getLocalNoon,
  MINUTES_TOLERANCE,
  minutesBetween,
  toEpochMilliseconds,
} from "@/test/sunFixtures";
import { getSolarDay, SunThresholdState } from "./sun";

const MOSCOW = { latitude: 55.8, longitude: 37.6 };
const LONGYEARBYEN = { latitude: 78.2, longitude: 15.6 };

describe("getSolarDay", () => {
  it.each([
    [
      "Almaty",
      43.3,
      76.9,
      "2026-03-08",
      "Asia/Almaty",
      "05:48",
      "06:55",
      "17:11",
      "18:18",
    ],
    [
      "Moscow",
      55.8,
      37.6,
      "2026-12-21",
      "Europe/Moscow",
      "08:10",
      "10:16",
      "14:38",
      "16:44",
    ],
    [
      "Moscow",
      55.8,
      37.6,
      "2026-06-21",
      "Europe/Moscow",
      "02:42",
      "04:48",
      "20:14",
      "22:20",
    ],
    [
      "Quito",
      -0.2,
      -78.5,
      "2026-03-20",
      "America/Guayaquil",
      "05:57",
      "06:45",
      "17:57",
      "18:45",
    ],
    [
      "Sydney",
      -33.9,
      151.2,
      "2026-12-21",
      "Australia/Sydney",
      "05:11",
      "06:17",
      "19:28",
      "20:34",
    ],
    [
      "Kolkata",
      22.5,
      88.4,
      "2026-03-08",
      "Asia/Kolkata",
      "05:29",
      "06:21",
      "17:13",
      "18:05",
    ],
  ])(
    "should cross the thresholds in %s %s %s as published",
    (_city, latitude, longitude, date, timeZoneId, dawn, dayStart, dayEnd, dusk) => {
      const solarDay = getSolarDay(
        { latitude, longitude },
        getLocalNoon(date, timeZoneId),
      );
      const at = (time: string) => toEpochMilliseconds(date, time, timeZoneId);
      expect(
        minutesBetween(solarDay.night.rising as number, at(dawn)),
      ).toBeLessThan(MINUTES_TOLERANCE);
      expect(
        minutesBetween(solarDay.day.rising as number, at(dayStart)),
      ).toBeLessThan(MINUTES_TOLERANCE);
      expect(
        minutesBetween(solarDay.day.setting as number, at(dayEnd)),
      ).toBeLessThan(MINUTES_TOLERANCE);
      expect(
        minutesBetween(solarDay.night.setting as number, at(dusk)),
      ).toBeLessThan(MINUTES_TOLERANCE);
    },
  );

  it("should order the solar midnights around the solar noon", () => {
    const solarDay = getSolarDay(
      MOSCOW,
      getLocalNoon("2026-06-21", "Europe/Moscow"),
    );
    expect(solarDay.solarMidnightBefore).toBeLessThan(solarDay.solarNoon);
    expect(solarDay.solarNoon).toBeLessThan(solarDay.solarMidnightAfter);
  });

  it("should tile solar days: the midnight after is the midnight before of the next day", () => {
    const first = getSolarDay(
      MOSCOW,
      getLocalNoon("2026-06-21", "Europe/Moscow"),
    );
    const next = getSolarDay(MOSCOW, first.solarMidnightAfter);
    expect(next.solarMidnightBefore).toBe(first.solarMidnightAfter);
  });

  it("should pick the previous solar day for an instant before its midnight", () => {
    const first = getSolarDay(
      MOSCOW,
      getLocalNoon("2026-06-21", "Europe/Moscow"),
    );
    const previous = getSolarDay(MOSCOW, first.solarMidnightBefore - 1);
    expect(previous.solarMidnightAfter).toBe(first.solarMidnightBefore);
  });

  it("should say the sun stays below both thresholds at Longyearbyen in December", () => {
    const solarDay = getSolarDay(
      LONGYEARBYEN,
      getLocalNoon("2026-12-21", "Europe/Oslo"),
    );
    expect(solarDay.night.state).toBe(SunThresholdState.STAYS_BELOW);
    expect(solarDay.day.state).toBe(SunThresholdState.STAYS_BELOW);
  });

  it("should say the sun stays above both thresholds at Longyearbyen in June", () => {
    const solarDay = getSolarDay(
      LONGYEARBYEN,
      getLocalNoon("2026-06-21", "Europe/Oslo"),
    );
    expect(solarDay.night.state).toBe(SunThresholdState.STAYS_ABOVE);
    expect(solarDay.day.state).toBe(SunThresholdState.STAYS_ABOVE);
  });

  it("should leave no crossing instants when the sun stays on one side", () => {
    const solarDay = getSolarDay(
      LONGYEARBYEN,
      getLocalNoon("2026-12-21", "Europe/Oslo"),
    );
    expect(solarDay.night.rising).toBeUndefined();
    expect(solarDay.day.setting).toBeUndefined();
  });

  it("should end the night of Moscow on 2090-12-21 at 05:10 UTC", () => {
    const solarDay = getSolarDay(
      MOSCOW,
      toEpochMilliseconds("2090-12-21", "09:00", "UTC"),
    );
    expect(
      minutesBetween(
        solarDay.night.rising as number,
        toEpochMilliseconds("2090-12-21", "05:10", "UTC"),
      ),
    ).toBeLessThan(MINUTES_TOLERANCE);
  });
});
