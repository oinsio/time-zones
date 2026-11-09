// Verifies FR3, FR4, FR5, NFR-P1 of add-grid-hour-cells-and-hour-frame.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod, getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { HourFormat } from "@/preferences";
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

  it("should pass the day period and the offset edge through", () => {
    const cell = presentCell("America/New_York", 12);

    expect([cell.dayPeriod, cell.hasOffsetEdge]).toEqual([
      DayPeriod.NIGHT,
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
