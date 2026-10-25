// Verifies FR6 of add-time-sliders-to-location-cards (D7).
import { describe, expect, it } from "vitest";
import { DayPeriod } from "@/presenter";
import {
  buildDayTrackGradient,
  DAY_PERIOD_COLOR_VARIABLES,
  formatPercent,
} from "./dayTrackGradient";

describe("buildDayTrackGradient", () => {
  it("should turn the Almaty stops into a token gradient", () => {
    const gradient = buildDayTrackGradient([
      { fraction: 0.2708333333, period: DayPeriod.NIGHT },
      { fraction: 0.3125, period: DayPeriod.MORNING },
      { fraction: 0.38020833, period: DayPeriod.WORK },
    ]);

    expect(gradient).toBe(
      "linear-gradient(to right, var(--color-day-night) 27.0833%, var(--color-day-morning) 31.25%, var(--color-day-working) 38.0208%)",
    );
  });

  it.each([
    [DayPeriod.NIGHT, "--color-day-night"],
    [DayPeriod.MORNING, "--color-day-morning"],
    [DayPeriod.WORK, "--color-day-working"],
    [DayPeriod.EVENING, "--color-day-evening"],
  ])("should map %s to %s", (period, variable) => {
    expect(DAY_PERIOD_COLOR_VARIABLES[period]).toBe(variable);
  });

  it("should keep a position outside the track", () => {
    expect(formatPercent(-0.02)).toBe("-2%");
  });

  it("should give no gradient without stops", () => {
    expect(buildDayTrackGradient([])).toBe("none");
  });
});
