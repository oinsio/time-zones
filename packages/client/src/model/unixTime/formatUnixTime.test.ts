// Verifies FR8, FR12 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { formatExactIsoInstant, formatUnixTime } from "./formatUnixTime";
import { parseUnixTimeText } from "./parseUnixTimeText";
import { UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

const SAMPLE = { unixSeconds: 1_795_432_987, nanoseconds: 123_456_000 };

describe("formatUnixTime", () => {
  it.each([
    [UnixTimeUnit.SECONDS, "1795432987"],
    [UnixTimeUnit.MILLISECONDS, "1795432987123"],
    [UnixTimeUnit.MICROSECONDS, "1795432987123456"],
    [UnixTimeUnit.NANOSECONDS, "1795432987123456000"],
  ])("should write the sample in %s", (unit, expected) => {
    expect(formatUnixTime(SAMPLE, unit)).toBe(expected);
  });

  it.each([
    [UnixTimeUnit.SECONDS, "-2"],
    [UnixTimeUnit.MILLISECONDS, "-1500"],
    [UnixTimeUnit.MICROSECONDS, "-1500000"],
    [UnixTimeUnit.NANOSECONDS, "-1500000000"],
  ])(
    "should drop digits towards the past for -1500 ms in %s",
    (unit, expected) => {
      expect(
        formatUnixTime({ unixSeconds: -2, nanoseconds: 500_000_000 }, unit),
      ).toBe(expected);
    },
  );

  it.each(Object.values(UnixTimeUnit))(
    "should write -1 ns as -1 in %s",
    (unit) => {
      const expected = unit === UnixTimeUnit.NANOSECONDS ? "-1" : "-1";
      expect(
        formatUnixTime({ unixSeconds: -1, nanoseconds: 999_999_999 }, unit),
      ).toBe(expected);
    },
  );

  it.each([
    [{ unixSeconds: 0, nanoseconds: 0 }, UnixTimeUnit.NANOSECONDS, "0"],
    [{ unixSeconds: 0, nanoseconds: 5 }, UnixTimeUnit.NANOSECONDS, "5"],
    [
      { unixSeconds: 0, nanoseconds: 5_000_000 },
      UnixTimeUnit.MILLISECONDS,
      "5",
    ],
    [
      { unixSeconds: 3, nanoseconds: 5_000_000 },
      UnixTimeUnit.MILLISECONDS,
      "3005",
    ],
    [{ unixSeconds: -3, nanoseconds: 0 }, UnixTimeUnit.MILLISECONDS, "-3000"],
    [
      { unixSeconds: -3, nanoseconds: 5_000_000 },
      UnixTimeUnit.MILLISECONDS,
      "-2995",
    ],
    [
      { unixSeconds: 1_795_432_987, nanoseconds: 123_456_789 },
      UnixTimeUnit.NANOSECONDS,
      "1795432987123456789",
    ],
  ])("should write %j in %s as %s", (instant, unit, expected) => {
    expect(formatUnixTime(instant, unit)).toBe(expected);
  });

  it("should keep 22 digits that a number cannot hold", () => {
    expect(
      formatUnixTime(
        { unixSeconds: 1_795_432_987_123, nanoseconds: 456_789_012 },
        UnixTimeUnit.NANOSECONDS,
      ),
    ).toBe("1795432987123456789012");
  });
});

describe("formatExactIsoInstant", () => {
  it.each([
    [UnixTimeUnit.SECONDS, "2026-11-23T11:23:07Z"],
    [UnixTimeUnit.MILLISECONDS, "2026-11-23T11:23:07.123Z"],
    [UnixTimeUnit.MICROSECONDS, "2026-11-23T11:23:07.123456Z"],
    [UnixTimeUnit.NANOSECONDS, "2026-11-23T11:23:07.123456000Z"],
  ])("should write the sample with the precision %s", (precision, expected) => {
    expect(formatExactIsoInstant(SAMPLE, precision)).toBe(expected);
  });

  it("should write a year after 9999 with a sign and six digits", () => {
    expect(
      formatExactIsoInstant(
        { unixSeconds: 1_795_432_987_123, nanoseconds: 456_789_012 },
        UnixTimeUnit.NANOSECONDS,
      ),
    ).toBe("+058865-01-02T09:18:43.456789012Z");
  });
});

describe("round trip of text, instant and text", () => {
  const VALUES = [
    "0",
    "1",
    "-1",
    "59",
    "-59",
    "1795432987",
    "-1795432987",
    "1700000000",
    "1795432987123",
    "-1795432987123",
    "1795432987123456",
    "-1795432987123456",
    "1795432987123456789",
    "-1795432987123456789",
    "179543298712345678",
    "999999999999999999",
    "-999999999999999999",
    "17954329870",
    "1795432987123456789012",
    "-1795432987123456789012",
  ];

  it.each(VALUES)("should write %s back as the same digits", (text) => {
    const parsed = parseUnixTimeText(text, UnixTimeUnitChoice.AUTO);
    expect(
      parsed.ok && formatUnixTime(parsed.instant, parsed.unit as UnixTimeUnit),
    ).toBe(text);
  });
});
