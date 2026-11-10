// Verifies FR8 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayShift, getDayShift } from "./dayShift";

describe("getDayShift", () => {
  const instant = Temporal.Instant.from("2026-03-08T04:00:00Z");
  it.each([
    ["Asia/Almaty", DayShift.SAME],
    ["Europe/Moscow", DayShift.SAME],
    ["Asia/Kolkata", DayShift.SAME],
    ["America/New_York", DayShift.EARLIER],
    ["Asia/Tokyo", DayShift.SAME],
  ])("should read %s as %s", (timeZoneId, shift) => {
    expect(getDayShift(timeZoneId, instant, "Asia/Almaty")).toBe(shift);
  });

  it("should read a later local date", () => {
    expect(
      getDayShift(
        "Pacific/Auckland",
        Temporal.Instant.from("2026-03-08T12:00:00Z"),
        "Asia/Almaty",
      ),
    ).toBe(DayShift.LATER);
  });
});
