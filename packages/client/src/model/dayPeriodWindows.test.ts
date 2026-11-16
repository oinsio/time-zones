// Verifies FR5, FR9 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { DAY_PERIOD_BLEND_MINUTES } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { DayPeriod, type DayPeriodBoundary } from "./dayPeriods";
import { collectBlendWindows } from "./dayPeriodWindows";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";

const DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "UTC" },
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);
const MINUTES_BETWEEN_CLOSE_BOUNDARIES = 20;

const boundaryAt = (
  minutesFromStart: number,
  from: DayPeriod,
  to: DayPeriod,
): DayPeriodBoundary => ({
  instant: DAY.start.add({ minutes: minutesFromStart }),
  from,
  to,
});

const minutesFromStart = (instant: Temporal.Instant) =>
  DAY.start.until(instant).total({ unit: "minute" });

describe("collectBlendWindows", () => {
  it("should centre a window of the blend width on a lone boundary", () => {
    const [window] = collectBlendWindows(
      [boundaryAt(360, DayPeriod.NIGHT, DayPeriod.MORNING)],
      DAY,
    );
    expect([
      minutesFromStart(window.start),
      minutesFromStart(window.end),
    ]).toEqual([
      360 - DAY_PERIOD_BLEND_MINUTES / 2,
      360 + DAY_PERIOD_BLEND_MINUTES / 2,
    ]);
  });

  it("should carry the periods of the boundary", () => {
    const [window] = collectBlendWindows(
      [boundaryAt(360, DayPeriod.NIGHT, DayPeriod.MORNING)],
      DAY,
    );
    expect([window.from, window.to]).toEqual([
      DayPeriod.NIGHT,
      DayPeriod.MORNING,
    ]);
  });

  it("should make two boundaries 20 minutes apart meet at their midpoint", () => {
    const windows = collectBlendWindows(
      [
        boundaryAt(360, DayPeriod.NIGHT, DayPeriod.MORNING),
        boundaryAt(
          360 + MINUTES_BETWEEN_CLOSE_BOUNDARIES,
          DayPeriod.MORNING,
          DayPeriod.DAY,
        ),
      ],
      DAY,
    );
    const midpoint = 360 + MINUTES_BETWEEN_CLOSE_BOUNDARIES / 2;
    expect([
      minutesFromStart(windows[0].end),
      minutesFromStart(windows[1].start),
    ]).toEqual([midpoint, midpoint]);
  });

  it("should leave the outer sides of close boundaries at the full half width", () => {
    const windows = collectBlendWindows(
      [
        boundaryAt(360, DayPeriod.NIGHT, DayPeriod.MORNING),
        boundaryAt(380, DayPeriod.MORNING, DayPeriod.DAY),
      ],
      DAY,
    );
    expect([
      minutesFromStart(windows[0].start),
      minutesFromStart(windows[1].end),
    ]).toEqual([345, 395]);
  });

  it("should keep the full width between boundaries far apart", () => {
    const windows = collectBlendWindows(
      [
        boundaryAt(360, DayPeriod.NIGHT, DayPeriod.MORNING),
        boundaryAt(600, DayPeriod.MORNING, DayPeriod.DAY),
      ],
      DAY,
    );
    expect([
      minutesFromStart(windows[0].end),
      minutesFromStart(windows[1].start),
    ]).toEqual([375, 585]);
  });

  it("should leave out a window that does not reach the day", () => {
    const outside = DAY.lengthMinutes + DAY_PERIOD_BLEND_MINUTES;
    expect(
      collectBlendWindows(
        [boundaryAt(outside, DayPeriod.DAY, DayPeriod.EVENING)],
        DAY,
      ),
    ).toEqual([]);
  });

  it("should keep a window centred just outside the day whose half reaches in", () => {
    const justOutside = DAY.lengthMinutes + DAY_PERIOD_BLEND_MINUTES / 2 - 1;
    expect(
      collectBlendWindows(
        [boundaryAt(justOutside, DayPeriod.DAY, DayPeriod.EVENING)],
        DAY,
      ),
    ).toHaveLength(1);
  });

  it("should give no window for no boundary", () => {
    expect(collectBlendWindows([], DAY)).toEqual([]);
  });
});
