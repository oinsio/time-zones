// Verifies FR12, NFR-P3 of apply-data-updates-silently (D6): the dump date of the committed city data.
import { describe, expect, it } from "vitest";
import { TEST_CITY_DATA_DATE } from "../../../app.config.ts";
import {
  isDumpDate,
  readCommittedDumpDate,
} from "../../../scripts/cityData/committedDumpDate.ts";

const committedWith = (dumpDate: unknown) =>
  JSON.stringify({ source: { name: "GeoNames", dumpDate } });

describe("isDumpDate", () => {
  it("should accept an ISO date", () => {
    expect(isDumpDate("2026-11-14")).toBe(true);
  });

  it.each([
    ["an empty text", ""],
    ["a date in the day.month.year form", "14.11.2026"],
    ["a month and day out of range", "2026-13-40"],
    ["a date with a time", "2026-11-14T00:00:00Z"],
    ["a day that the month lacks", "2026-02-30"],
    ["a number", 20261114],
    ["null", null],
    ["undefined", undefined],
  ])("should reject %s", (_name, value) => {
    expect(isDumpDate(value)).toBe(false);
  });
});

describe("readCommittedDumpDate", () => {
  it("should return the dump date of the committed city data", () => {
    expect(readCommittedDumpDate(committedWith("2026-11-14"))).toBe(
      "2026-11-14",
    );
  });

  it.each([
    ["an empty text", ""],
    ["a date in the day.month.year form", "14.11.2026"],
    ["a month and day out of range", "2026-13-40"],
    ["a number", 5],
  ])("should throw naming the dump date for %s", (_name, value) => {
    expect(() => readCommittedDumpDate(committedWith(value))).toThrow(
      /dump date/,
    );
  });

  it("should throw naming the dump date for a text without source", () => {
    expect(() => readCommittedDumpDate("{}")).toThrow(/dump date/);
  });

  it("should throw naming the dump date for a text that is not JSON", () => {
    expect(() => readCommittedDumpDate("not json")).toThrow(/dump date/);
  });

  it("should give the tests a valid fixed dump date", () => {
    expect(isDumpDate(TEST_CITY_DATA_DATE)).toBe(true);
  });
});
