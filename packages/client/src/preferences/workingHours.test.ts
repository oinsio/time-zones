// Verifies FR6, FR7 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import {
  checkWorkingHours,
  DEFAULT_WORKING_HOURS,
  isWorkingHours,
  WorkingHoursError,
} from ".";

describe("DEFAULT_WORKING_HOURS", () => {
  it("should be 10:00 to 18:00", () => {
    expect(DEFAULT_WORKING_HOURS).toEqual({ start: "10:00", end: "18:00" });
  });
});

describe("checkWorkingHours", () => {
  it.each([
    ["10:00", "18:00", undefined],
    ["09:07", "17:30", undefined],
    ["12:00", "12:00", WorkingHoursError.START_NOT_BEFORE_END],
    ["18:00", "10:00", WorkingHoursError.START_NOT_BEFORE_END],
  ])("should check %s to %s", (start, end, expected) => {
    expect(checkWorkingHours({ start, end })).toBe(expected);
  });
});

describe("isWorkingHours", () => {
  it.each([
    [{ start: "10:00", end: "18:00" }, true],
    [{ start: "09:07", end: "17:30" }, true],
    [{ start: "12:00", end: "12:00" }, false],
    [{ start: "18:00", end: "10:00" }, false],
    [{ start: "25:00", end: "18:00" }, false],
    [{ start: "9:00", end: "18:00" }, false],
    [{ start: "10:00", end: "18:00:00" }, false],
    [{ start: 10, end: 18 }, false],
    [{ start: "10:00" }, false],
    [null, false],
    ["10:00-18:00", false],
    [undefined, false],
  ])("should answer %j with %s", (value, expected) => {
    expect(isWorkingHours(value)).toBe(expected);
  });
});
