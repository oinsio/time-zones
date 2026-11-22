// Verifies FR2, FR9–FR12, NFR-P1 of add-day-colouring-setting.
// Verifies FR3, FR4, FR5, NFR-P1 of add-grid-hour-cells-and-hour-frame.
// Verifies FR6, FR7, FR8, NFR-P1, UX2 of bind-day-periods-to-sun.

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
const ALMATY_COORDINATES = { latitude: 43.3, longitude: 76.9 };
const MOSCOW_COORDINATES = { latitude: 55.8, longitude: 37.6 };
const KAZAN_COORDINATES = { latitude: 55.8, longitude: 49.1 };
const CONTEXT: HourStripContext = {
  day: DAY,
  coordinates: ALMATY_COORDINATES,
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
    const cell = presentCell("America/New_York", 12, {
      coordinates: { latitude: 40.7, longitude: -74.0 },
    });

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

describe("presentHourStrip by the sun", () => {
  const JUNE_DAY = getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Europe/Moscow" },
    Temporal.Instant.from("2026-06-21T09:00:00Z"),
  );
  const JUNE_CONTEXT: HourStripContext = {
    ...CONTEXT,
    day: JUNE_DAY,
    referenceZoneId: "Europe/Moscow",
  };
  const FOUR_O_CLOCK_COLUMN = 4;
  const presentJune = (coordinates: HourStripContext["coordinates"]) =>
    presentHourStrip("Europe/Moscow", { ...JUNE_CONTEXT, coordinates });

  it("should colour the cell of 04:00 morning in Moscow and day in Kazan", () => {
    expect([
      presentJune(MOSCOW_COORDINATES).cells[FOUR_O_CLOCK_COLUMN].dayColour,
      presentJune(KAZAN_COORDINATES).cells[FOUR_O_CLOCK_COLUMN].dayColour,
    ]).toEqual([DayColour.MORNING, DayColour.DAY]);
  });

  it("should present Moscow with and without coordinates as different strips", () => {
    expect(presentJune(MOSCOW_COORDINATES)).not.toBe(presentJune(undefined));
  });

  it("should colour a location without coordinates in the neutral colour", () => {
    expect(
      presentJune(undefined).cells.every(
        (cell) => cell.dayColour === DayColour.NO_DAY_PERIOD,
      ),
    ).toBe(true);
  });

  it.each([
    ["Moscow", MOSCOW_COORDINATES],
    ["Kazan", KAZAN_COORDINATES],
    ["no coordinates", undefined],
  ])(
    "should return the same strip object for %s on a second presentation",
    (_name, coordinates) => {
      expect(presentJune(coordinates)).toBe(presentJune(coordinates));
    },
  );
});

// Verifies FR6, FR7, NFR-P1 of move-meeting-range-and-extend-past-midnight.
describe("presentHourStrip with a strip tail", () => {
  const presentWithTail = (zone: string, tailCellCount: number) =>
    presentHourStrip(zone, {
      ...CONTEXT,
      language: "ru",
      tailCellCount,
    });

  it("should present the cells of the day and of the tail", () => {
    expect(presentWithTail("Asia/Almaty", 3).cells).toHaveLength(27);
  });

  it.each([
    ["Asia/Almaty", 24],
    ["Asia/Kolkata", 24],
    ["Europe/Moscow", 26],
  ])(
    "should show the midnight cell of %s at column %i as МАР over 9",
    (zone, column) => {
      expect(presentWithTail(zone, 3).cells[column].midnightMarker).toEqual({
        monthText: "МАР",
        dayText: "9",
      });
    },
  );

  it("should label the first cell of the reference zone's row 0 and not mark it midnight", () => {
    const [firstCell] = presentWithTail("Asia/Almaty", 3).cells;
    expect([firstCell.hourText, firstCell.midnightMarker]).toEqual([
      "0",
      undefined,
    ]);
  });

  it("should keep the presented cells of the day by identity when only the tail count changes", () => {
    const shorter = presentWithTail("America/New_York", 1);
    const longer = presentWithTail("America/New_York", 3);

    expect(
      shorter.cells.every((cell, column) => cell === longer.cells[column]),
    ).toBe(true);
  });

  it("should return the same strip on a repeated call", () => {
    expect(presentWithTail("Asia/Almaty", 3)).toBe(
      presentWithTail("Asia/Almaty", 3),
    );
  });
});
