// Verifies FR13 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getRelativeTime,
  RelativeTimeDirection,
  RelativeTimeUnit,
} from "./relativeTime";

const NOW = Temporal.Instant.fromEpochMilliseconds(1_795_432_987_000);
const at = (unixSeconds: number) =>
  Temporal.Instant.fromEpochMilliseconds(unixSeconds * 1000);

describe("getRelativeTime", () => {
  it.each([
    [1_795_432_957, RelativeTimeUnit.NOW, 0, undefined],
    [1_795_432_087, RelativeTimeUnit.MINUTES, 15, RelativeTimeDirection.PAST],
    [1_795_440_187, RelativeTimeUnit.HOURS, 2, RelativeTimeDirection.FUTURE],
    [1_795_173_787, RelativeTimeUnit.DAYS, 3, RelativeTimeDirection.PAST],
    [1_700_000_000, RelativeTimeUnit.YEARS, 3, RelativeTimeDirection.PAST],
    [0, RelativeTimeUnit.YEARS, 56, RelativeTimeDirection.PAST],
  ])("should read %i as %s", (unixSeconds, unit, count, direction) => {
    const relativeTime = getRelativeTime(at(unixSeconds), NOW);
    expect(relativeTime).toEqual(
      unit === RelativeTimeUnit.NOW ? { unit } : { unit, count, direction },
    );
  });

  it("should read the same moment as now", () => {
    expect(getRelativeTime(NOW, NOW)).toEqual({ unit: RelativeTimeUnit.NOW });
  });

  it("should read 59 seconds in the future as now", () => {
    expect(getRelativeTime(at(1_795_433_046), NOW)).toEqual({
      unit: RelativeTimeUnit.NOW,
    });
  });

  it("should read exactly one minute in the future as one minute", () => {
    expect(getRelativeTime(at(1_795_433_047), NOW)).toEqual({
      unit: RelativeTimeUnit.MINUTES,
      count: 1,
      direction: RelativeTimeDirection.FUTURE,
    });
  });

  it("should count months on the UTC calendar", () => {
    const relativeTime = getRelativeTime(
      Temporal.Instant.from("2026-07-23T11:23:07Z"),
      NOW,
    );
    expect(relativeTime).toEqual({
      unit: RelativeTimeUnit.MONTHS,
      count: 4,
      direction: RelativeTimeDirection.PAST,
    });
  });

  it("should round towards zero", () => {
    const relativeTime = getRelativeTime(at(1_795_432_987 - 7199), NOW);
    expect(relativeTime).toMatchObject({
      unit: RelativeTimeUnit.HOURS,
      count: 1,
    });
  });

  it("should read a moment far in the future in years", () => {
    expect(getRelativeTime(at(8_640_000_000_000), NOW)).toMatchObject({
      unit: RelativeTimeUnit.YEARS,
      direction: RelativeTimeDirection.FUTURE,
    });
  });
});
