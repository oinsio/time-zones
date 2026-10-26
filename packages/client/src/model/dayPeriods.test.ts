// Verifies FR6 of add-time-sliders-to-location-cards (D3).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  DAY_PERIOD_SCHEDULE,
  DayPeriod,
  type DayPeriodBoundary,
  getDayPeriod,
} from "./dayPeriods";

describe("getDayPeriod", () => {
  it.each([
    ["06:59", DayPeriod.NIGHT],
    ["07:00", DayPeriod.MORNING],
    ["08:59", DayPeriod.MORNING],
    ["09:00", DayPeriod.WORK],
    ["17:59", DayPeriod.WORK],
    ["18:00", DayPeriod.EVENING],
    ["21:59", DayPeriod.EVENING],
    ["22:00", DayPeriod.NIGHT],
    ["00:00", DayPeriod.NIGHT],
  ])("should put %s in %s", (wallTime, expected) => {
    expect(
      getDayPeriod(Temporal.PlainTime.from(wallTime), DAY_PERIOD_SCHEDULE),
    ).toBe(expected);
  });

  it("should read the schedule from the parameter", () => {
    const customSchedule: readonly DayPeriodBoundary[] = [
      {
        wallTime: "12:00",
        from: DayPeriod.EVENING,
        to: DayPeriod.WORK,
        blendMinutes: 0,
      },
    ];

    expect(getDayPeriod(Temporal.PlainTime.from("06:00"), customSchedule)).toBe(
      DayPeriod.EVENING,
    );
    expect(getDayPeriod(Temporal.PlainTime.from("13:00"), customSchedule)).toBe(
      DayPeriod.WORK,
    );
  });
});
