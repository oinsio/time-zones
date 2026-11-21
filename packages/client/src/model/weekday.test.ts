// Verifies FR7 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getWeekday, Weekday } from "./weekday";

describe("getWeekday", () => {
  it.each([
    ["2026-03-09", Weekday.MONDAY],
    ["2026-03-10", Weekday.TUESDAY],
    ["2026-03-11", Weekday.WEDNESDAY],
    ["2026-03-12", Weekday.THURSDAY],
    ["2026-03-13", Weekday.FRIDAY],
    ["2026-03-14", Weekday.SATURDAY],
    ["2026-03-15", Weekday.SUNDAY],
  ])("should map %s to %s", (date, expected) => {
    expect(getWeekday(Temporal.PlainDate.from(date))).toBe(expected);
  });
});
