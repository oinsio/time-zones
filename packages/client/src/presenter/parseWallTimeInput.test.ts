// Verifies FR2, FR6 of add-wall-time-input-with-hint (D3, M4).
// Verifies FR6 of add-settings-page-and-device-time-location (D9).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { getDayPeriodMarkers } from "./dayPeriodMarkers";
import { formatLocalTime } from "./localDateTime";
import { parseWallTimeInput } from "./parseWallTimeInput";

const englishMarkers = getDayPeriodMarkers("en");

describe("parseWallTimeInput", () => {
  it.each([
    ["9", "09:00"],
    ["09", "09:00"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["9:30", "09:30"],
    ["09:30", "09:30"],
    ["09.30", "09:30"],
    ["9.30", "09:30"],
    [" 9:30 ", "09:30"],
    ["0:00", "00:00"],
    ["23:59", "23:59"],
    ["2359", "23:59"],
  ])("reads %j as %s", (text, expected) => {
    expect(parseWallTimeInput(text, englishMarkers)).toBe(expected);
  });

  it.each([
    ["9 PM", "21:00"],
    ["9pm", "21:00"],
    ["9:30 am", "09:30"],
    ["09.30 PM", "21:30"],
    ["12 AM", "00:00"],
    ["12:15 PM", "12:15"],
    ["9:30 PM", "21:30"],
    ["9 PM", "21:00"],
    ["9 pm", "21:00"],
  ])("reads the 12-hour text %j as %s", (text, expected) => {
    expect(parseWallTimeInput(text, englishMarkers)).toBe(expected);
  });

  it.each([
    ["24:00"],
    ["9:60"],
    ["abc"],
    ["12345"],
    ["9:3"],
    [""],
    ["   "],
    ["24"],
    ["9,30"],
    ["09:30\n10"],
    ["13 PM"],
    ["0 AM"],
    ["9:60 PM"],
    ["9 XM"],
  ])("rejects %j", (text) => {
    expect(parseWallTimeInput(text, englishMarkers)).toBeUndefined();
  });

  it.each(["en", "ru"] as const)(
    "should accept the time shown in the 12-hour format in %s",
    (language) => {
      const shownTime = formatLocalTime(
        Temporal.Instant.from("2026-03-08T16:30:00Z").toZonedDateTimeISO(
          "Asia/Almaty",
        ),
        language,
        HourFormat.H12,
      );
      expect(parseWallTimeInput(shownTime, getDayPeriodMarkers(language))).toBe(
        "21:30",
      );
    },
  );
});
