// Verifies FR7 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import {
  detectUnixTimeUnit,
  getFixedUnit,
  UnixTimeUnit,
  UnixTimeUnitChoice,
} from "./unixTimeUnit";

describe("detectUnixTimeUnit", () => {
  it.each([
    [1, UnixTimeUnit.SECONDS],
    [10, UnixTimeUnit.SECONDS],
    [11, UnixTimeUnit.SECONDS],
    [12, UnixTimeUnit.MILLISECONDS],
    [13, UnixTimeUnit.MILLISECONDS],
    [14, UnixTimeUnit.MILLISECONDS],
    [15, UnixTimeUnit.MICROSECONDS],
    [16, UnixTimeUnit.MICROSECONDS],
    [17, UnixTimeUnit.MICROSECONDS],
    [18, UnixTimeUnit.NANOSECONDS],
    [19, UnixTimeUnit.NANOSECONDS],
    [22, UnixTimeUnit.NANOSECONDS],
  ])("should read %i digits as %s", (digitCount, expectedUnit) => {
    expect(detectUnixTimeUnit(digitCount)).toBe(expectedUnit);
  });
});

describe("getFixedUnit", () => {
  it("should name no unit for Auto", () => {
    expect(getFixedUnit(UnixTimeUnitChoice.AUTO)).toBeUndefined();
  });

  it.each(Object.values(UnixTimeUnit))(
    "should map the choice %s to its unit",
    (unit) => {
      expect(getFixedUnit(unit as string as UnixTimeUnitChoice)).toBe(unit);
    },
  );
});
