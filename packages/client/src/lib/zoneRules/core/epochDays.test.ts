// FR3 of add-zone-rules-from-iana: integer calendar arithmetic of the core
import { describe, expect, it } from "vitest";
import {
  getCivilDateFromEpochDay,
  getDaysInMonth,
  getEpochDayFromCivilDate,
  getWeekdayOfEpochDay,
  isLeapYear,
} from "./epochDays.ts";

const SUNDAY = 0;
const THURSDAY = 4;

describe("epoch days", () => {
  it.each([
    [1970, 1, 1, 0],
    [2000, 2, 29, 11016],
    [2040, 3, 31, 25657],
    [2100, 3, 1, 47541],
    [1969, 12, 31, -1],
  ])(
    "converts %i-%i-%i to epoch day %i and back",
    (year, month, day, epochDay) => {
      expect(getEpochDayFromCivilDate(year, month, day)).toBe(epochDay);
      expect(getCivilDateFromEpochDay(epochDay)).toEqual({ year, month, day });
    },
  );

  it.each([
    [2000, true],
    [2100, false],
    [2024, true],
    [2026, false],
  ])("knows whether %i is a leap year: %s", (year, expected) => {
    expect(isLeapYear(year)).toBe(expected);
  });

  it.each([
    [2040, 2, 29],
    [2100, 2, 28],
    [2026, 12, 31],
    [2026, 4, 30],
  ])("counts the days of %i-%i: %i", (year, month, expected) => {
    expect(getDaysInMonth(year, month)).toBe(expected);
  });

  it("finds Sunday on 2040-01-01", () => {
    expect(getWeekdayOfEpochDay(getEpochDayFromCivilDate(2040, 1, 1))).toBe(
      SUNDAY,
    );
  });

  it("finds Thursday on 1970-01-01 and on the day before 1970", () => {
    expect(getWeekdayOfEpochDay(0)).toBe(THURSDAY);
    expect(getWeekdayOfEpochDay(-1)).toBe(THURSDAY - 1);
  });

  it("round-trips every day of 2096 to 2104", () => {
    const firstDay = getEpochDayFromCivilDate(2096, 1, 1);
    const lastDay = getEpochDayFromCivilDate(2104, 12, 31);
    for (let epochDay = firstDay; epochDay <= lastDay; epochDay++) {
      const { year, month, day } = getCivilDateFromEpochDay(epochDay);
      expect(getEpochDayFromCivilDate(year, month, day)).toBe(epochDay);
    }
  });
});
