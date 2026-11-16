// Verifies FR2, FR9, FR10, FR11, FR13, NFR-P1 of add-day-colouring-setting.
// Verifies FR5, FR6, FR8, FR9 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  type Coordinates,
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
const ALMATY_COORDINATES = { latitude: 43.3, longitude: 76.9 };
const day = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: ALMATY },
  Temporal.Instant.from("2026-03-09T06:00:00Z"),
);
const presentFor = (
  dayColouring: DayColouring,
  coordinates: Coordinates | undefined,
) =>
  presentDayColourStops(
    ALMATY,
    coordinates,
    day,
    dayColouring,
    DEFAULT_WORKING_HOURS,
  );
const present = (dayColouring: DayColouring) =>
  presentFor(dayColouring, ALMATY_COORDINATES);
const presentWithoutCoordinates = (dayColouring: DayColouring) =>
  presentFor(dayColouring, undefined);

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
      (getDayPeriodStops(ALMATY_COORDINATES, day) ?? []).map((stop) => ({
        fraction: stop.fraction,
        colour: stop.period,
      })),
    );
  });

  it("should give a location without coordinates one neutral stop in Time of day", () => {
    expect(presentWithoutCoordinates(DayColouring.TIME_OF_DAY)).toEqual([
      { fraction: 0, colour: DayColour.NO_DAY_PERIOD },
    ]);
  });

  it("should leave Working hours alone for a location without coordinates", () => {
    expect(presentWithoutCoordinates(DayColouring.WORKING_HOURS)).toEqual(
      present(DayColouring.WORKING_HOURS),
    );
  });

  it("should leave Plain alone for a location without coordinates", () => {
    expect(presentWithoutCoordinates(DayColouring.PLAIN)).toEqual([
      { fraction: 0, colour: DayColour.PLAIN },
    ]);
  });

  it("should give the period colours the values of the day periods", () => {
    expect([
      DayColour.NIGHT,
      DayColour.MORNING,
      DayColour.DAY,
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
  const [cell] = getHourCells(ALMATY, day, ALMATY, ALMATY_COORDINATES);
  const [cellWithoutPeriod] = getHourCells(ALMATY, day, ALMATY, undefined);

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

  it("should give a cell without a day period the neutral colour in Time of day", () => {
    expect(
      presentHourCellColour(cellWithoutPeriod, true, DayColouring.TIME_OF_DAY),
    ).toBe(DayColour.NO_DAY_PERIOD);
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
