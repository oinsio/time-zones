// Verifies FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod } from "./dayPeriods";
import { getReferenceDay } from "./dayTrack";
import { getHourCells, getHourFrameIndex } from "./hourCells";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";

const ALMATY = "Asia/Almaty";
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
  return getHourCells(timeZoneId, ALMATY_DAY, ALMATY);
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

    expect(getHourCells(zone, day, zone)).toHaveLength(count);
  });

  it("should end a day of a fractional length with a shorter cell", () => {
    const zone = "Australia/Lord_Howe";
    const day = getDayIn(zone, "2026-04-04T20:00:00Z");

    const cells = getHourCells(zone, day, zone);

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
    [6, DayPeriod.NIGHT],
    [7, DayPeriod.MORNING],
    [8, DayPeriod.MORNING],
    [9, DayPeriod.WORK],
    [17, DayPeriod.WORK],
    [18, DayPeriod.EVENING],
    [21, DayPeriod.EVENING],
    [22, DayPeriod.NIGHT],
    [23, DayPeriod.NIGHT],
  ])("should colour Almaty column %i as %s", (column, period) => {
    expect(cellsOf(ALMATY)[column].dayPeriod).toBe(period);
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
    const fromMoscow = getHourCells(ALMATY, ALMATY_DAY, "Europe/Moscow");

    expect(fromMoscow).not.toBe(cellsOf(ALMATY));
    expect(fromMoscow.some((cell) => cell.midnightDate)).toBe(true);
  });
});

describe("getHourFrameIndex", () => {
  it.each([
    ["2026-03-08T07:30:00Z", 12],
    ["2026-03-08T08:00:00Z", 13],
    ["2026-03-07T19:00:00Z", 0],
    ["2026-03-08T18:59:00Z", 23],
  ])("should put %s in column %i", (instant, column) => {
    expect(getHourFrameIndex(ALMATY_DAY, Temporal.Instant.from(instant))).toBe(
      column,
    );
  });

  it("should clamp an instant before the day to column 0", () => {
    expect(
      getHourFrameIndex(
        ALMATY_DAY,
        Temporal.Instant.from("2026-03-07T10:00:00Z"),
      ),
    ).toBe(0);
  });

  it("should clamp an instant after the day to the last column", () => {
    expect(
      getHourFrameIndex(
        ALMATY_DAY,
        Temporal.Instant.from("2026-03-10T10:00:00Z"),
      ),
    ).toBe(23);
  });
});
