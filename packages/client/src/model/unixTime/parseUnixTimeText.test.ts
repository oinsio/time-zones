// Verifies FR6, FR7, FR8, FR15 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { ConverterInputError } from "./converterInputError";
import { formatExactIsoInstant } from "./formatUnixTime";
import { parseUnixTimeText } from "./parseUnixTimeText";
import { UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

const readIso = (text: string, choice = UnixTimeUnitChoice.AUTO) => {
  const result = parseUnixTimeText(text, choice);
  return result.ok
    ? formatExactIsoInstant(result.instant, result.precision)
    : result.error;
};

describe("parseUnixTimeText, the texts the input reads", () => {
  it.each([
    ["1795432987", "2026-11-23T11:23:07Z"],
    [" 1795432987 ", "2026-11-23T11:23:07Z"],
    ["1 795 432 987", "2026-11-23T11:23:07Z"],
    ["1 795 432 987", "2026-11-23T11:23:07Z"],
    ["1 795 432 987", "2026-11-23T11:23:07Z"],
    ["1_795_432_987", "2026-11-23T11:23:07Z"],
    ["1,795,432,987", "2026-11-23T11:23:07Z"],
    ["1 795 432 987.5", "2026-11-23T11:23:07.500Z"],
    ["1,795,432,987,123", "2026-11-23T11:23:07.123Z"],
    ["-1", "1969-12-31T23:59:59Z"],
    ["0", "1970-01-01T00:00:00Z"],
    ["1795432987.5", "2026-11-23T11:23:07.500Z"],
    ["1795432987.123456", "2026-11-23T11:23:07.123456Z"],
  ])("should read %j as %s", (text, expectedIso) => {
    expect(readIso(text)).toBe(expectedIso);
  });
});

describe("parseUnixTimeText, detection by digit count", () => {
  it.each([
    ["5", UnixTimeUnit.SECONDS, "1970-01-01T00:00:05Z"],
    ["17954329870", UnixTimeUnit.SECONDS, "2538-12-13T17:51:10Z"],
    ["179543298712", UnixTimeUnit.MILLISECONDS, "1975-09-10T01:08:18.712Z"],
    ["1795432987123", UnixTimeUnit.MILLISECONDS, "2026-11-23T11:23:07.123Z"],
    ["17954329871234", UnixTimeUnit.MILLISECONDS, "2538-12-13T17:51:11.234Z"],
    [
      "179543298712345",
      UnixTimeUnit.MICROSECONDS,
      "1975-09-10T01:08:18.712345Z",
    ],
    [
      "1795432987123456",
      UnixTimeUnit.MICROSECONDS,
      "2026-11-23T11:23:07.123456Z",
    ],
    [
      "17954329871234567",
      UnixTimeUnit.MICROSECONDS,
      "2538-12-13T17:51:11.234567Z",
    ],
    [
      "179543298712345678",
      UnixTimeUnit.NANOSECONDS,
      "1975-09-10T01:08:18.712345678Z",
    ],
    [
      "1795432987123456789",
      UnixTimeUnit.NANOSECONDS,
      "2026-11-23T11:23:07.123456789Z",
    ],
    [
      "1795432987123456789012",
      UnixTimeUnit.NANOSECONDS,
      "+058865-01-02T09:18:43.456789012Z",
    ],
    ["-1795432987123", UnixTimeUnit.MILLISECONDS, "1913-02-08T12:36:52.877Z"],
  ])("should read %s in %s", (text, expectedUnit, expectedIso) => {
    const result = parseUnixTimeText(text, UnixTimeUnitChoice.AUTO);
    expect(result.ok && result.unit).toBe(expectedUnit);
    expect(readIso(text)).toBe(expectedIso);
  });
});

describe("parseUnixTimeText, a fixed unit", () => {
  it("should read every whole number in the chosen unit", () => {
    expect(readIso("1795432987", UnixTimeUnitChoice.MILLISECONDS)).toBe(
      "1970-01-21T18:43:52.987Z",
    );
  });

  it("should read -1 in nanoseconds before 1970", () => {
    expect(readIso("-1", UnixTimeUnitChoice.NANOSECONDS)).toBe(
      "1969-12-31T23:59:59.999999999Z",
    );
  });

  it("should floor a negative millisecond value towards the past", () => {
    expect(readIso("-1500", UnixTimeUnitChoice.MILLISECONDS)).toBe(
      "1969-12-31T23:59:58.500Z",
    );
  });

  it("should read decimal seconds under the seconds unit", () => {
    expect(readIso("1795432987.5", UnixTimeUnitChoice.SECONDS)).toBe(
      "2026-11-23T11:23:07.500Z",
    );
  });

  it("should read decimal seconds under the nanoseconds fixed unit as unreadable", () => {
    expect(readIso("1795432987.5", UnixTimeUnitChoice.NANOSECONDS)).toBe(
      ConverterInputError.UNREADABLE,
    );
  });

  it("should read decimal seconds under the milliseconds fixed unit as unreadable", () => {
    expect(readIso("1795432987.5", UnixTimeUnitChoice.MILLISECONDS)).toBe(
      ConverterInputError.UNREADABLE,
    );
  });

  it("should read a negative decimal as a floor", () => {
    expect(readIso("-1.5")).toBe("1969-12-31T23:59:58.500Z");
  });
});

describe("parseUnixTimeText, precision", () => {
  it.each([
    ["1795432987", UnixTimeUnit.SECONDS],
    ["1795432987.5", UnixTimeUnit.MILLISECONDS],
    ["1795432987.1234", UnixTimeUnit.MICROSECONDS],
    ["1795432987.1234567", UnixTimeUnit.NANOSECONDS],
    ["1795432987123", UnixTimeUnit.MILLISECONDS],
  ])("should give %s the precision %s", (text, expectedPrecision) => {
    const result = parseUnixTimeText(text, UnixTimeUnitChoice.AUTO);
    expect(result.ok && result.precision).toBe(expectedPrecision);
  });
});

describe("parseUnixTimeText, unreadable texts", () => {
  it.each([
    "",
    "abc",
    "1795432987,5",
    "17,95432987",
    "1795432987.123 456",
    "1795432987.1234567890",
    "2026-11-23T14:23:07",
    "2026-11-23",
    "- 1",
    "--1",
    ".5",
    "1.",
    "1,79,543",
  ])("should read %j as unreadable", (text) => {
    expect(readIso(text)).toBe(ConverterInputError.UNREADABLE);
  });
});

describe("parseUnixTimeText, range", () => {
  it.each([
    ["8640000000000", UnixTimeUnitChoice.SECONDS, "+275760-09-13T00:00:00Z"],
    ["-8640000000000", UnixTimeUnitChoice.SECONDS, "-271821-04-20T00:00:00Z"],
    [
      "8640000000001",
      UnixTimeUnitChoice.SECONDS,
      ConverterInputError.OUT_OF_RANGE,
    ],
    [
      "8640000000000.5",
      UnixTimeUnitChoice.SECONDS,
      ConverterInputError.OUT_OF_RANGE,
    ],
    [
      "-8640000000001",
      UnixTimeUnitChoice.SECONDS,
      ConverterInputError.OUT_OF_RANGE,
    ],
    [
      "-8640000000000.5",
      UnixTimeUnitChoice.SECONDS,
      ConverterInputError.OUT_OF_RANGE,
    ],
    [
      "99999999999999999999999999",
      UnixTimeUnitChoice.AUTO,
      ConverterInputError.OUT_OF_RANGE,
    ],
  ])("should read %s under %s as %s", (text, choice, expected) => {
    expect(readIso(text, choice)).toBe(expected);
  });
});
