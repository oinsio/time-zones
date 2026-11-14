// Verifies FR2, FR9–FR12, NFR-P1 of add-day-colouring-setting.
// Verifies FR3, FR4, FR5, NFR-P1 of add-grid-hour-cells-and-hour-frame.

import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { DayColouring, HourFormat } from "@/preferences";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
import { DayColour } from "./dayColours";
import { getDayPeriodMarkers } from "./dayPeriodMarkers";
import { type HourStripContext, presentHourStrip } from "./hourStrip";

const DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Asia/Almaty" },
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);
const CONTEXT: HourStripContext = {
  day: DAY,
  referenceZoneId: "Asia/Almaty",
  language: "en",
  hourFormat: HourFormat.H24,
  ...TIME_OF_DAY_CONTEXT,
};

const presentCell = (
  timeZoneId: string,
  column: number,
  context: Partial<HourStripContext> = {},
) => presentHourStrip(timeZoneId, { ...CONTEXT, ...context }).cells[column];

describe("presentHourStrip", () => {
  it.each([
    ["Asia/Almaty", 0, "0", ""],
    ["Asia/Almaty", 9, "9", ""],
    ["Europe/Moscow", 0, "22", ""],
    ["Asia/Kolkata", 23, "23", ":30"],
    ["Asia/Kathmandu", 1, "1", ":45"],
  ])(
    "should label %s column %i in 24-hour as %s%s",
    (zone, column, hour, minutes) => {
      const cell = presentCell(zone, column);

      expect([cell.hourText, cell.minuteText, cell.dayPeriodMarker]).toEqual([
        hour,
        minutes,
        "",
      ]);
    },
  );

  it.each([
    [9, "9", "AM"],
    [21, "9", "PM"],
    [12, "12", "PM"],
    [0, "12", "AM"],
  ])(
    "should label Almaty column %i in 12-hour English as %s %s",
    (column, hour, marker) => {
      const cell = presentCell("Asia/Almaty", column, {
        hourFormat: HourFormat.H12,
      });

      expect([cell.hourText, cell.dayPeriodMarker]).toEqual([hour, marker]);
    },
  );

  it("should use the Russian markers in 12-hour Russian", () => {
    const cell = presentCell("Asia/Almaty", 21, {
      language: "ru",
      hourFormat: HourFormat.H12,
      ...TIME_OF_DAY_CONTEXT,
    });

    expect(cell.dayPeriodMarker).toBe(getDayPeriodMarkers("ru").pm);
  });

  it.each([
    ["ru", "МАР", "8"],
    ["en", "MAR", "8"],
  ] as const)(
    "should show the %s midnight marker %s over %s",
    (language, month, day) => {
      const cell = presentCell("Europe/Moscow", 2, { language });

      expect(cell.midnightMarker).toEqual({ monthText: month, dayText: day });
    },
  );

  it("should show no midnight marker on an ordinary cell", () => {
    expect(presentCell("Europe/Moscow", 3).midnightMarker).toBeUndefined();
  });

  it("should pass the day colour and the offset edge through", () => {
    const cell = presentCell("America/New_York", 12);

    expect([cell.dayColour, cell.hasOffsetEdge]).toEqual([
      DayColour.NIGHT,
      true,
    ]);
  });

  it("should key a cell by its start instant", () => {
    expect(presentCell("Asia/Almaty", 12).key).toBe("2026-03-08T07:00:00Z");
  });

  it("should return the same strip for the same day, language and format", () => {
    expect(presentHourStrip("Asia/Almaty", CONTEXT)).toBe(
      presentHourStrip("Asia/Almaty", { ...CONTEXT }),
    );
  });

  it("should present a new strip after the hour format changes", () => {
    expect(presentHourStrip("Asia/Almaty", CONTEXT)).not.toBe(
      presentHourStrip("Asia/Almaty", {
        ...CONTEXT,
        hourFormat: HourFormat.H12,
      }),
    );
  });

  it("should present a new strip after the language changes", () => {
    expect(presentHourStrip("Asia/Almaty", CONTEXT)).not.toBe(
      presentHourStrip("Asia/Almaty", { ...CONTEXT, language: "ru" }),
    );
  });
});

describe("presentHourStrip day colouring", () => {
  const ALMATY_MONDAY = getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Asia/Almaty" },
    Temporal.Instant.from("2026-03-09T06:00:00Z"),
  );
  const workingHoursContext = (start: string): Partial<HourStripContext> => ({
    day: ALMATY_MONDAY,
    dayColouring: DayColouring.WORKING_HOURS,
    workingHours: { start, end: "18:00" },
  });

  it("should colour every cell plain in Plain", () => {
    const { cells } = presentHourStrip("Asia/Almaty", {
      ...CONTEXT,
      dayColouring: DayColouring.PLAIN,
    });

    expect(cells.every((cell) => cell.dayColour === DayColour.PLAIN)).toBe(
      true,
    );
  });

  it("should mark the Almaty columns 9 to 17 working from 09:07", () => {
    const { cells } = presentHourStrip("Asia/Almaty", {
      ...CONTEXT,
      ...workingHoursContext("09:07"),
    });
    const workingColumns = cells.flatMap((cell, column) =>
      cell.dayColour === DayColour.WORKING_TIME ? [column] : [],
    );

    expect(workingColumns).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });

  it("should colour the other cells non-working", () => {
    expect(
      presentCell("Asia/Almaty", 3, workingHoursContext("09:07")).dayColour,
    ).toBe(DayColour.NON_WORKING_TIME);
  });

  it("should return the same strip on a repeated Working hours call", () => {
    const context = { ...CONTEXT, ...workingHoursContext("09:07") };

    expect(presentHourStrip("Asia/Almaty", context)).toBe(
      presentHourStrip("Asia/Almaty", context),
    );
  });

  it("should present a new strip after the colouring changes", () => {
    expect(presentHourStrip("Asia/Almaty", CONTEXT)).not.toBe(
      presentHourStrip("Asia/Almaty", {
        ...CONTEXT,
        dayColouring: DayColouring.PLAIN,
      }),
    );
  });

  it("should present a new strip after the working hours change", () => {
    const earlier = { ...CONTEXT, ...workingHoursContext("09:07") };

    expect(presentHourStrip("Asia/Almaty", earlier)).not.toBe(
      presentHourStrip("Asia/Almaty", {
        ...earlier,
        workingHours: { start: "09:40", end: "18:00" },
      }),
    );
  });
});
