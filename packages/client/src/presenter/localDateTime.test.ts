// Verifies FR1, FR2 of show-local-time-and-date-on-location-cards (D3).
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { formatLocalDate, formatLocalTime } from "./localDateTime";

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
