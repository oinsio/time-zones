// Verifies FR6 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod, type DayPeriodBoundary } from "./dayPeriods";
import { getLargestSharePeriod } from "./hourCellPeriod";

const MILLISECONDS_PER_MINUTE = 60_000;
const SPAN_START = 0;
const SPAN_END = 60 * MILLISECONDS_PER_MINUTE;

const boundaryAt = (
  minutes: number,
  from: DayPeriod,
  to: DayPeriod,
): DayPeriodBoundary => ({
  instant: Temporal.Instant.fromEpochMilliseconds(
    minutes * MILLISECONDS_PER_MINUTE,
  ),
  from,
  to,
});

describe("getLargestSharePeriod", () => {
  it("should take the period that holds the larger part of the cell", () => {
    const boundaries = [boundaryAt(20, DayPeriod.NIGHT, DayPeriod.MORNING)];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.MORNING);
  });

  it("should take the period before the boundary when it holds the larger part", () => {
    const boundaries = [boundaryAt(40, DayPeriod.NIGHT, DayPeriod.MORNING)];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.NIGHT);
  });

  it("should take the earlier period on a tie", () => {
    const boundaries = [boundaryAt(30, DayPeriod.NIGHT, DayPeriod.MORNING)];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.NIGHT);
  });

  it("should add up a period that returns inside the cell", () => {
    const boundaries = [
      boundaryAt(10, DayPeriod.NIGHT, DayPeriod.MORNING),
      boundaryAt(20, DayPeriod.MORNING, DayPeriod.NIGHT),
    ];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.NIGHT);
  });

  it("should read the period at the start from the last boundary before the cell", () => {
    const boundaries = [
      boundaryAt(-30, DayPeriod.NIGHT, DayPeriod.MORNING),
      boundaryAt(50, DayPeriod.MORNING, DayPeriod.DAY),
    ];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.NIGHT, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.MORNING);
  });

  it("should use the period without boundaries when there is none", () => {
    expect(getLargestSharePeriod([], DayPeriod.DAY, SPAN_START, SPAN_END)).toBe(
      DayPeriod.DAY,
    );
  });

  it("should treat a boundary exactly at the cell start as already passed", () => {
    const boundaries = [boundaryAt(0, DayPeriod.NIGHT, DayPeriod.MORNING)];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.MORNING);
  });

  it("should ignore a boundary exactly at the cell end", () => {
    const boundaries = [boundaryAt(60, DayPeriod.NIGHT, DayPeriod.MORNING)];
    expect(
      getLargestSharePeriod(boundaries, DayPeriod.DAY, SPAN_START, SPAN_END),
    ).toBe(DayPeriod.NIGHT);
  });
});
