// Verifies FR2, FR9, FR10, FR11, FR13, NFR-P1 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  DayPeriod,
  getDayPeriodStops,
  getHourCells,
  getReferenceDay,
  getWorkingTimeStops,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";
import { DayColouring, DEFAULT_WORKING_HOURS } from "@/preferences";
import {
  DayColour,
  getHourFrameColour,
  HourFrameColour,
  presentDayColourStops,
  presentHourCellColour,
} from "./dayColours";

const ALMATY = "Asia/Almaty";
const day = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: ALMATY },
  Temporal.Instant.from("2026-03-09T06:00:00Z"),
);
const present = (dayColouring: DayColouring) =>
  presentDayColourStops(ALMATY, day, dayColouring, DEFAULT_WORKING_HOURS);

describe("presentDayColourStops", () => {
  it("should give Plain one plain stop at 0", () => {
    expect(present(DayColouring.PLAIN)).toEqual([
      { fraction: 0, colour: DayColour.PLAIN },
    ]);
  });

  it("should give Plain the same array every time", () => {
    expect(present(DayColouring.PLAIN)).toBe(present(DayColouring.PLAIN));
  });

  it("should map the day-period stops one to one in Time of day", () => {
    expect(present(DayColouring.TIME_OF_DAY)).toEqual(
      getDayPeriodStops(ALMATY, day).map((stop) => ({
        fraction: stop.fraction,
        colour: stop.period,
      })),
    );
  });

  it("should give the period colours the values of the day periods", () => {
    expect([
      DayColour.NIGHT,
      DayColour.MORNING,
      DayColour.WORK,
      DayColour.EVENING,
    ]).toEqual(Object.values(DayPeriod));
  });

  it("should map the working-time stops in Working hours", () => {
    expect(present(DayColouring.WORKING_HOURS)).toEqual(
      getWorkingTimeStops(ALMATY, day, DEFAULT_WORKING_HOURS).map((stop) => ({
        fraction: stop.fraction,
        colour: stop.isWorkingTime
          ? DayColour.WORKING_TIME
          : DayColour.NON_WORKING_TIME,
      })),
    );
  });

  it.each([DayColouring.TIME_OF_DAY, DayColouring.WORKING_HOURS])(
    "should return the same array on a repeated %s call",
    (dayColouring) => {
      expect(present(dayColouring)).toBe(present(dayColouring));
    },
  );
});

describe("presentHourCellColour", () => {
  const [cell] = getHourCells(ALMATY, day, ALMATY);

  it("should colour every Plain cell plain", () => {
    expect(presentHourCellColour(cell, true, DayColouring.PLAIN)).toBe(
      DayColour.PLAIN,
    );
  });

  it("should give Time of day the period of the cell", () => {
    expect(presentHourCellColour(cell, true, DayColouring.TIME_OF_DAY)).toBe(
      DayColour.NIGHT,
    );
  });

  it.each([
    [true, DayColour.WORKING_TIME],
    [false, DayColour.NON_WORKING_TIME],
  ])("should give Working hours and flag %s the colour %s", (flag, colour) => {
    expect(presentHourCellColour(cell, flag, DayColouring.WORKING_HOURS)).toBe(
      colour,
    );
  });
});

describe("getHourFrameColour", () => {
  it.each([
    [DayColouring.TIME_OF_DAY, HourFrameColour.ACCENT],
    [DayColouring.PLAIN, HourFrameColour.FOREGROUND],
    [DayColouring.WORKING_HOURS, HourFrameColour.FOREGROUND],
  ])("should give %s the frame colour %s", (dayColouring, colour) => {
    expect(getHourFrameColour(dayColouring)).toBe(colour);
  });
});
