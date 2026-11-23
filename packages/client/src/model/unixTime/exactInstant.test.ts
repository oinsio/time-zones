// Verifies FR8, FR15, NFR-P3 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import {
  getPrecisionOfFractionDigits,
  isExactInstantInRange,
  toInstant,
  toWholeSecondExactInstant,
} from "./exactInstant";
import { UnixTimeUnit } from "./unixTimeUnit";

describe("isExactInstantInRange", () => {
  it.each([
    ["the upper bound with no fraction", 8_640_000_000_000, 0, true],
    ["the upper bound with a fraction", 8_640_000_000_000, 500_000_000, false],
    ["one second past the upper bound", 8_640_000_000_001, 0, false],
    [
      "just below the upper bound with a fraction",
      8_639_999_999_999,
      999_999_999,
      true,
    ],
    ["the lower bound", -8_640_000_000_000, 0, true],
    ["one second before the lower bound", -8_640_000_000_001, 0, false],
    ["the epoch", 0, 0, true],
  ])("should answer for %s", (_name, unixSeconds, nanoseconds, expected) => {
    expect(isExactInstantInRange({ unixSeconds, nanoseconds })).toBe(expected);
  });
});

describe("getPrecisionOfFractionDigits", () => {
  it.each([
    [0, UnixTimeUnit.SECONDS],
    [1, UnixTimeUnit.MILLISECONDS],
    [3, UnixTimeUnit.MILLISECONDS],
    [4, UnixTimeUnit.MICROSECONDS],
    [6, UnixTimeUnit.MICROSECONDS],
    [7, UnixTimeUnit.NANOSECONDS],
    [9, UnixTimeUnit.NANOSECONDS],
  ])("should give %i fraction digits the precision %s", (count, expected) => {
    expect(getPrecisionOfFractionDigits(count)).toBe(expected);
  });
});

describe("toInstant", () => {
  it("should keep the milliseconds and drop the finer digits", () => {
    const instant = toInstant({
      unixSeconds: 1_795_432_987,
      nanoseconds: 123_456_789,
    });
    expect(instant.toString()).toBe("2026-11-23T11:23:07.123Z");
  });

  it("should convert before 1970", () => {
    expect(
      toInstant({ unixSeconds: -1, nanoseconds: 500_000_000 }).toString(),
    ).toBe("1969-12-31T23:59:59.5Z");
  });
});

describe("toWholeSecondExactInstant", () => {
  it("should cut the clock's instant to the whole second", () => {
    const clock = fakeClock("2026-11-23T11:23:07.987Z");
    expect(toWholeSecondExactInstant(clock.instant())).toEqual({
      unixSeconds: 1_795_432_987,
      nanoseconds: 0,
    });
  });

  it("should cut towards the past before 1970", () => {
    const clock = fakeClock("1969-12-31T23:59:58.500Z");
    expect(toWholeSecondExactInstant(clock.instant())).toEqual({
      unixSeconds: -2,
      nanoseconds: 0,
    });
  });
});
