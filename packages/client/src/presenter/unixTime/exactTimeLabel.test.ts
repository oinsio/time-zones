// Verifies FR8, FR9 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { formatExactLocalTime } from "./exactTimeLabel";

const MOSCOW_NOON = Temporal.Instant.from(
  "2026-11-23T11:23:07Z",
).toZonedDateTimeISO("Europe/Moscow");

describe("formatExactLocalTime", () => {
  it.each([
    [0, "14:23:07"],
    [3, "14:23:07.123"],
    [6, "14:23:07.123456"],
    [9, "14:23:07.123456789"],
  ])(
    "should show %i fraction digits in the 24-hour format",
    (digits, expected) => {
      expect(
        formatExactLocalTime(
          MOSCOW_NOON,
          123_456_789,
          digits,
          "en",
          HourFormat.H24,
        ),
      ).toBe(expected);
    },
  );

  it.each([
    [0, "2:23:07 PM"],
    [3, "2:23:07.123 PM"],
    [9, "2:23:07.123456789 PM"],
  ])(
    "should put %i fraction digits before the day period marker",
    (digits, expected) => {
      const label = formatExactLocalTime(
        MOSCOW_NOON,
        123_456_789,
        digits,
        "en",
        HourFormat.H12,
      ).replace(/\s/g, " ");
      expect(label).toBe(expected);
    },
  );

  it("should pad a small fraction with zeros", () => {
    expect(
      formatExactLocalTime(MOSCOW_NOON, 5_000_000, 3, "en", HourFormat.H24),
    ).toBe("14:23:07.005");
  });
});
