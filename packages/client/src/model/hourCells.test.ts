// Verifies FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame.
// Verifies FR6, FR7, FR8 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod } from "./dayPeriods";
import { getReferenceDay } from "./dayTrack";
import { getHourCells } from "./hourCells";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";

const ALMATY = "Asia/Almaty";
const ALMATY_COORDINATES = { latitude: 43.3, longitude: 76.9 };
const NEW_YORK = "America/New_York";
const SAMPLE_INSTANT = Temporal.Instant.from("2026-03-08T07:30:00Z");

function getDayIn(referenceZoneId: string, instant: string) {
  return getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: referenceZoneId },
    Temporal.Instant.from(instant),
  );
}

const ALMATY_DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: ALMATY },
  SAMPLE_INSTANT,
);

function cellsOf(timeZoneId: string) {
  return getHourCells(timeZoneId, ALMATY_DAY, ALMATY, ALMATY_COORDINATES);
}

describe("getHourCells", () => {
  it.each([
    [ALMATY, "2026-03-08T07:30:00Z", 24],
    [NEW_YORK, "2026-03-08T12:00:00Z", 23],
    [NEW_YORK, "2026-11-01T12:00:00Z", 25],
    [NEW_YORK, "2026-06-01T12:00:00Z", 24],
    ["Australia/Lord_Howe", "2026-04-04T20:00:00Z", 25],
  ])("should give %s a day of %s %i cells", (zone, instant, count) => {
    const day = getDayIn(zone, instant);

    expect(getHourCells(zone, day, zone, ALMATY_COORDINATES)).toHaveLength(
      count,
    );
  });

  it("should end a day of a fractional length with a shorter cell", () => {
    const zone = "Australia/Lord_Howe";
    const day = getDayIn(zone, "2026-04-04T20:00:00Z");

    const cells = getHourCells(zone, day, zone, ALMATY_COORDINATES);

    const lastCell = cells[cells.length - 1];
    expect(day.end.since(lastCell.start).total({ unit: "minute" })).toBe(30);
  });

  it("should start column 12 at 07:00Z in every zone", () => {
    expect(cellsOf("Asia/Kolkata")[12].start.toString()).toBe(
      "2026-03-08T07:00:00Z",
    );
  });

  it("should start column 0 at the start of the reference day", () => {
    expect(cellsOf(NEW_YORK)[0].start.equals(ALMATY_DAY.start)).toBe(true);
  });

  it.each([
    [ALMATY, 0, "00:00"],
    ["Europe/Moscow", 0, "22:00"],
    ["Asia/Kolkata", 23, "23:30"],
    [NEW_YORK, 11, "01:00"],
    [NEW_YORK, 12, "03:00"],
  ])("should give %s column %i the local start %s", (zone, column, text) => {
    expect(
      cellsOf(zone)[column].localStart.toPlainTime().toString().slice(0, 5),
    ).toBe(text);
  });

  it.each([
    [0, DayPeriod.NIGHT],
    [5, DayPeriod.NIGHT],
    [6, DayPeriod.MORNING],
    [7, DayPeriod.DAY],
    [16, DayPeriod.DAY],
    [17, DayPeriod.EVENING],
    [18, DayPeriod.NIGHT],
    [23, DayPeriod.NIGHT],
  ])("should colour Almaty column %i as %s", (column, period) => {
    expect(cellsOf(ALMATY)[column].dayPeriod).toBe(period);
  });

  it("should give a cell no day period without coordinates", () => {
    const cells = getHourCells(ALMATY, ALMATY_DAY, ALMATY, undefined);
    expect(cells.every((cell) => cell.dayPeriod === undefined)).toBe(true);
  });

  it("should give a city of the same zone cells of its own coordinates", () => {
    const kazan = { latitude: 55.8, longitude: 49.1 };
    const moscow = { latitude: 55.8, longitude: 37.6 };
    const day = getDayIn("Europe/Moscow", "2026-06-21T09:00:00Z");
    const kazanCells = getHourCells(
      "Europe/Moscow",
      day,
      "Europe/Moscow",
      kazan,
    );
    const moscowCells = getHourCells(
      "Europe/Moscow",
      day,
      "Europe/Moscow",
      moscow,
    );
    expect(kazanCells).not.toBe(moscowCells);
    expect(kazanCells[4].dayPeriod).toBe(DayPeriod.DAY);
    expect(moscowCells[4].dayPeriod).toBe(DayPeriod.MORNING);
  });

  it("should hold the whole day for a polar night", () => {
    const longyearbyen = { latitude: 78.2, longitude: 15.6 };
    const day = getDayIn("UTC", "2026-12-21T12:00:00Z");
    const periods = getHourCells("UTC", day, "UTC", longyearbyen).map(
      (cell) => cell.dayPeriod,
    );
    expect(new Set(periods)).toEqual(new Set([DayPeriod.NIGHT]));
  });

  it.each([
    ["Europe/Moscow", 2],
    ["Asia/Kolkata", 0],
    [NEW_YORK, 10],
    ["Asia/Kathmandu", 0],
  ])("should put the midnight cell of %s at column %i", (zone, column) => {
    const midnightColumns = cellsOf(zone)
      .map((cell, index) => (cell.midnightDate ? index : -1))
      .filter((index) => index >= 0);

    expect(midnightColumns).toEqual([column]);
    expect(cellsOf(zone)[column].midnightDate?.toString()).toBe("2026-03-08");
  });

  it("should mark no midnight cell in the reference zone", () => {
    expect(cellsOf(ALMATY).some((cell) => cell.midnightDate)).toBe(false);
  });

  it("should mark the offset edge only on New York column 12", () => {
    const edgeColumns = cellsOf(NEW_YORK)
      .map((cell, index) => (cell.hasOffsetEdge ? index : -1))
      .filter((index) => index >= 0);

    expect(edgeColumns).toEqual([12]);
  });

  it.each([ALMATY, "Europe/Moscow", "Asia/Kolkata"])(
    "should mark no offset edge in %s",
    (zone) => {
      expect(cellsOf(zone).some((cell) => cell.hasOffsetEdge)).toBe(false);
    },
  );

  it("should return the same array on a second call", () => {
    expect(cellsOf(NEW_YORK)).toBe(cellsOf(NEW_YORK));
  });

  it("should not reuse the cells of another reference zone", () => {
    const fromMoscow = getHourCells(
      ALMATY,
      ALMATY_DAY,
      "Europe/Moscow",
      ALMATY_COORDINATES,
    );

    expect(fromMoscow).not.toBe(cellsOf(ALMATY));
    expect(fromMoscow.some((cell) => cell.midnightDate)).toBe(true);
  });
});
