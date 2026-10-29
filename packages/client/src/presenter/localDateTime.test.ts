// Verifies FR1, FR2 of show-local-time-and-date-on-location-cards (D3).
import { describe, expect, it } from "vitest";
import { fakeClock, Temporal } from "@/lib/temporal";
import { startWorkCount } from "@/test/workCounters";
import {
  formatLocalDate,
  formatLocalTime,
  formatWallClockTime,
} from "./localDateTime";

const localDateTimeOf = (zone: string, timestamp: string) =>
  fakeClock(timestamp).instant().toZonedDateTimeISO(zone);

describe("formatLocalTime", () => {
  it.each([
    ["en", "Asia/Almaty", "2026-03-08T07:30:00Z", "12:30"],
    ["en", "America/New_York", "2026-03-08T07:30:00Z", "03:30"],
    ["en", "Asia/Tokyo", "2026-03-08T16:00:00Z", "01:00"],
    ["ru", "Asia/Almaty", "2026-03-08T07:30:00Z", "12:30"],
    ["en", "UTC", "2026-07-15T12:00:00Z", "12:00"],
  ] as const)(
    "should write %s %s at %s as %s",
    (language, zone, timestamp, expected) => {
      expect(formatLocalTime(localDateTimeOf(zone, timestamp), language)).toBe(
        expected,
      );
    },
  );
});

describe("formatLocalDate", () => {
  it.each([
    ["en", "Asia/Almaty", "2026-03-08T07:30:00Z", "Sun, Mar 8"],
    ["en", "Asia/Tokyo", "2026-03-08T16:00:00Z", "Mon, Mar 9"],
    ["ru", "Asia/Almaty", "2026-03-08T07:30:00Z", "вс, 8 мар."],
  ] as const)(
    "should write %s %s at %s as %s",
    (language, zone, timestamp, expected) => {
      expect(formatLocalDate(localDateTimeOf(zone, timestamp), language)).toBe(
        expected,
      );
    },
  );
});

// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks
describe("local labels (characterization)", () => {
  it.each([
    ["en", "Asia/Kolkata", "2026-07-15T12:00:00Z", "17:30", "Wed, Jul 15"],
    ["en", "Asia/Kathmandu", "2026-07-15T12:00:00Z", "17:45", "Wed, Jul 15"],
    ["en", "America/New_York", "2026-07-15T12:00:00Z", "08:00", "Wed, Jul 15"],
    ["en", "America/New_York", "2026-03-08T06:59:00Z", "01:59", "Sun, Mar 8"],
    ["en", "America/New_York", "2026-03-08T07:00:00Z", "03:00", "Sun, Mar 8"],
    ["ru", "Asia/Kolkata", "2026-07-15T12:00:00Z", "17:30", "ср, 15 июл."],
    ["ru", "Asia/Kathmandu", "2026-07-15T12:00:00Z", "17:45", "ср, 15 июл."],
    ["ru", "America/New_York", "2026-07-15T12:00:00Z", "08:00", "ср, 15 июл."],
    ["ru", "America/New_York", "2026-03-08T06:59:00Z", "01:59", "вс, 8 мар."],
    ["ru", "America/New_York", "2026-03-08T07:00:00Z", "03:00", "вс, 8 мар."],
  ] as const)(
    "should label %s %s at %s as %s and %s",
    (language, zone, timestamp, expectedTime, expectedDate) => {
      const localDateTime = localDateTimeOf(zone, timestamp);

      expect([
        formatLocalTime(localDateTime, language),
        formatLocalDate(localDateTime, language),
      ]).toEqual([expectedTime, expectedDate]);
    },
  );
});

// Verifies NFR-P1 of add-wall-time-input-with-hint (D4).
describe("formatWallClockTime", () => {
  it.each([
    ["en", "02:30", "02:30"],
    ["ru", "02:30", "02:30"],
    ["en", "00:00", "00:00"],
    ["en", "23:59", "23:59"],
  ] as const)("should write %s %s as %s", (language, time, expected) => {
    expect(formatWallClockTime(Temporal.PlainTime.from(time), language)).toBe(
      expected,
    );
  });

  it("should build one formatter for repeated formatting", () => {
    formatWallClockTime(Temporal.PlainTime.from("04:10"), "en");
    const workCount = startWorkCount();
    formatWallClockTime(Temporal.PlainTime.from("02:30"), "en");
    formatWallClockTime(Temporal.PlainTime.from("03:30"), "en");
    workCount.stop();
    expect(workCount.formatters()).toBe(0);
  });
});
