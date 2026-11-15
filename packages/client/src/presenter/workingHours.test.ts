// Verifies FR5 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { HourFormat } from "@/preferences";
import { startWorkCount } from "@/test/workCounters";
import { getDayPeriodMarkers } from "./dayPeriodMarkers";
import {
  formatWorkingHoursTime,
  presentWorkingHoursTexts,
} from "./workingHours";

describe("formatWorkingHoursTime", () => {
  it.each([
    ["10:00", "en", HourFormat.H24, "10:00"],
    ["09:07", "en", HourFormat.H24, "09:07"],
    ["10:00", "en", HourFormat.H12, "10:00 AM"],
    ["18:00", "en", HourFormat.H12, "6:00 PM"],
    ["17:30", "en", HourFormat.H12, "5:30 PM"],
  ])(
    "should write %s in %s %s as %s",
    (wallTime, language, hourFormat, text) => {
      expect(formatWorkingHoursTime(wallTime, language, hourFormat)).toBe(text);
    },
  );

  it("should write the Russian 12-hour markers of the language", () => {
    const { pm } = getDayPeriodMarkers("ru");
    expect(formatWorkingHoursTime("18:00", "ru", HourFormat.H12)).toContain(pm);
  });
});

describe("presentWorkingHoursTexts", () => {
  it("should present the start and the end", () => {
    expect(
      presentWorkingHoursTexts(
        { start: "09:07", end: "18:00" },
        "en",
        HourFormat.H24,
      ),
    ).toEqual({ startText: "09:07", endText: "18:00" });
  });

  it("should build no formatter on a repeated call", () => {
    const hours = { start: "10:00", end: "18:00" };
    presentWorkingHoursTexts(hours, "en", HourFormat.H12);
    const workCount = startWorkCount();
    presentWorkingHoursTexts(hours, "en", HourFormat.H12);
    workCount.stop();
    expect(workCount.formatters()).toBe(0);
  });
});
