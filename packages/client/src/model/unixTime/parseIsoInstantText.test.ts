// Verifies FR6, FR8, FR15 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { ConverterInputError } from "./converterInputError";
import { formatExactIsoInstant } from "./formatUnixTime";
import { parseIsoInstantText } from "./parseIsoInstantText";
import { UnixTimeUnit } from "./unixTimeUnit";

const readIso = (text: string) => {
  const result = parseIsoInstantText(text);
  return result.ok
    ? formatExactIsoInstant(result.instant, result.precision)
    : result.error;
};

describe("parseIsoInstantText", () => {
  it.each([
    ["2026-11-23T14:23:07+03:00", "2026-11-23T11:23:07Z"],
    ["2026-11-23T11:23:07Z", "2026-11-23T11:23:07Z"],
    ["2026-11-23T14:23:07.123456+03:00", "2026-11-23T11:23:07.123456Z"],
    ["2026-11-23T11:23:07.123456789Z", "2026-11-23T11:23:07.123456789Z"],
    ["2026-11-23T11:23:07.1234Z", "2026-11-23T11:23:07.123400Z"],
    ["  2026-11-23T11:23:07Z  ", "2026-11-23T11:23:07Z"],
    ["2026-11-23T11:23Z", "2026-11-23T11:23:00Z"],
    ["1969-12-31T23:59:59.5Z", "1969-12-31T23:59:59.500Z"],
    ["+058865-01-02T09:18:43.456789012Z", "+058865-01-02T09:18:43.456789012Z"],
  ])("should read %s as %s", (text, expected) => {
    expect(readIso(text)).toBe(expected);
  });

  it.each([
    ["2026-11-23T11:23:07Z", UnixTimeUnit.SECONDS],
    ["2026-11-23T11:23:07.1Z", UnixTimeUnit.MILLISECONDS],
    ["2026-11-23T11:23:07.1234Z", UnixTimeUnit.MICROSECONDS],
    ["2026-11-23T11:23:07.1234567Z", UnixTimeUnit.NANOSECONDS],
  ])("should give %s the precision %s", (text, precision) => {
    const result = parseIsoInstantText(text);
    expect(result.ok && result.precision).toBe(precision);
  });

  it.each([
    "2026-11-23T14:23:07",
    "2026-11-23",
    "2026-11-23T11:23:07.1234567890Z",
    "2026-13-23T11:23:07Z",
    "2026-11-23 11:23:07Z",
    "abc",
    "",
  ])("should read %j as unreadable", (text) => {
    expect(readIso(text)).toBe(ConverterInputError.UNREADABLE);
  });

  it.each([
    "+275760-09-13T00:00:01Z",
    "+275760-09-13T00:00:00.5Z",
    "-271821-04-19T23:59:59Z",
    "+999999-01-01T00:00:00Z",
  ])("should read %s as out of range", (text) => {
    expect(readIso(text)).toBe(ConverterInputError.OUT_OF_RANGE);
  });

  it("should read the upper bound itself", () => {
    expect(readIso("+275760-09-13T00:00:00Z")).toBe("+275760-09-13T00:00:00Z");
  });
});
