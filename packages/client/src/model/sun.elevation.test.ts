// Verifies FR1, FR3 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { getLocalNoon, toEpochMilliseconds } from "@/test/sunFixtures";
import { getSunElevation } from "./sun";

describe("getSunElevation", () => {
  it.each([
    ["Almaty", 43.3, 76.9, "Asia/Almaty", "2026-03-08"],
    ["Quito", -0.2, -78.5, "America/Guayaquil", "2026-03-20"],
    ["Sydney", -33.9, 151.2, "Australia/Sydney", "2026-12-21"],
  ])(
    "should be positive at local noon and negative at local midnight in %s",
    (_city, latitude, longitude, timeZoneId, date) => {
      const coordinates = { latitude, longitude };
      expect(
        getSunElevation(coordinates, getLocalNoon(date, timeZoneId)),
      ).toBeGreaterThan(0);
      expect(
        getSunElevation(
          coordinates,
          toEpochMilliseconds(date, "00:00", timeZoneId),
        ),
      ).toBeLessThan(0);
    },
  );

  it("should be within 1 degree of the zenith at the equator at the solar noon of the equinox (12:07 UTC)", () => {
    const coordinates = { latitude: 0, longitude: 0 };
    const noon = toEpochMilliseconds("2026-03-20", "12:07", "UTC");
    expect(getSunElevation(coordinates, noon)).toBeGreaterThan(89);
  });

  it("should be the mirror at the antipode half a day later", () => {
    const noon = toEpochMilliseconds("2026-03-20", "12:00", "UTC");
    const midnight = toEpochMilliseconds("2026-03-21", "00:00", "UTC");
    expect(
      getSunElevation({ latitude: 0, longitude: 0 }, midnight),
    ).toBeLessThan(-80);
    expect(getSunElevation({ latitude: 0, longitude: 180 }, noon)).toBeLessThan(
      -80,
    );
  });

  it("should accept an instant before 1970", () => {
    const instant = toEpochMilliseconds("1960-06-21", "12:00", "UTC");
    expect(
      getSunElevation({ latitude: 0, longitude: 0 }, instant),
    ).toBeGreaterThan(60);
  });
});
