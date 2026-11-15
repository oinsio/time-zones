// Verifies FR1, FR2, FR6, FR7 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { DAY_COLOURING_ORDER } from "@/constants";
import {
  DayColouring,
  DEFAULT_PREFERENCES,
  DEFAULT_WORKING_HOURS,
  PreferencesCommandType,
  reducePreferences,
} from ".";

const setWorkingHours = (
  start: string,
  end: string,
  base = DEFAULT_PREFERENCES,
) =>
  reducePreferences(base, {
    type: PreferencesCommandType.SET_WORKING_HOURS,
    workingHours: { start, end },
  });

describe("the day colouring defaults", () => {
  it("should default to Time of day", () => {
    expect(DEFAULT_PREFERENCES.dayColouring).toBe(DayColouring.TIME_OF_DAY);
  });

  it("should default to the default working hours", () => {
    expect(DEFAULT_PREFERENCES.workingHours).toBe(DEFAULT_WORKING_HOURS);
  });

  it("should list Plain, Time of day, Working hours in that order", () => {
    expect(DAY_COLOURING_ORDER).toEqual([
      DayColouring.PLAIN,
      DayColouring.TIME_OF_DAY,
      DayColouring.WORKING_HOURS,
    ]);
  });
});

describe("SET_DAY_COLOURING", () => {
  it("should replace the colouring and keep the working hours", () => {
    const withHours = setWorkingHours("09:07", "17:00");
    const next = reducePreferences(withHours, {
      type: PreferencesCommandType.SET_DAY_COLOURING,
      dayColouring: DayColouring.PLAIN,
    });
    expect(next).toEqual({
      ...withHours,
      dayColouring: DayColouring.PLAIN,
    });
  });

  it("should return the same object for an unchanged value", () => {
    expect(
      reducePreferences(DEFAULT_PREFERENCES, {
        type: PreferencesCommandType.SET_DAY_COLOURING,
        dayColouring: DayColouring.TIME_OF_DAY,
      }),
    ).toBe(DEFAULT_PREFERENCES);
  });
});

describe("SET_WORKING_HOURS", () => {
  it("should replace the range and keep the colouring", () => {
    const next = setWorkingHours("09:07", "17:30");
    expect(next).toEqual({
      ...DEFAULT_PREFERENCES,
      workingHours: { start: "09:07", end: "17:30" },
    });
  });

  it("should return the same object for an unchanged range", () => {
    expect(setWorkingHours("10:00", "18:00")).toBe(DEFAULT_PREFERENCES);
  });

  it.each([
    ["18:00", "10:00"],
    ["12:00", "12:00"],
  ])("should refuse %s to %s", (start, end) => {
    expect(setWorkingHours(start, end)).toBe(DEFAULT_PREFERENCES);
  });
});
