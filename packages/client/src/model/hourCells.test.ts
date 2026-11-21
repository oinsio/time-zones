// Verifies FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame.
// Verifies FR6, FR7, FR8 of bind-day-periods-to-sun.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod } from "./dayPeriods";
import { getReferenceDay } from "./dayTrack";
import { getHourCells, getStripTailCellCount } from "./hourCells";
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

// Verifies FR6, FR7, NFR-P1 of move-meeting-range-and-extend-past-midnight.
describe("getStripTailCellCount", () => {
  const at = (time: string, date = "2026-03-08") =>
    Temporal.Instant.from(`${date}T${time}:00Z`);
  // The sample day starts at 2026-03-07T19:00Z; Almaty 22:00 is 17:00Z.
  it.each([
    ["no range", undefined, 0],
    ["09:00–11:00", [at("04:00"), at("06:00")], 0],
    ["21:00–23:00", [at("16:00"), at("18:00")], 0],
    ["22:00–23:30", [at("17:00"), at("18:30")], 1],
    ["22:00–24:00", [at("17:00"), at("19:00")], 1],
    ["22:00–00:15 of the next day", [at("17:00"), at("19:15")], 2],
    ["23:00–02:00 of the next day", [at("18:00"), at("21:00")], 3],
  ] as const)(
    "should give the range %s a tail of %i cells",
    (_name, range, count) => {
      const meeting =
        range === undefined ? undefined : { start: range[0], end: range[1] };
      expect(getStripTailCellCount(meeting, ALMATY_DAY, ALMATY)).toBe(count);
    },
  );

  it.each([
    ["2026-03-07T12:00:00Z", "2026-03-08", 23],
    ["2026-10-31T12:00:00Z", "2026-11-01", 25],
  ])("should never exceed the %s next day's cells", (instant, _date, cells) => {
    const day = getDayIn(NEW_YORK, instant);
    const start = day.end.subtract({ minutes: 15 });
    const meeting = { start, end: start.add({ hours: 24 }) };

    expect(getStripTailCellCount(meeting, day, NEW_YORK)).toBeLessThanOrEqual(
      cells,
    );
  });
});

describe("getHourCells with a strip tail", () => {
  const withTail = (zone: string, tail: number) =>
    getHourCells(zone, ALMATY_DAY, ALMATY, ALMATY_COORDINATES, tail);

  it("should add the tail cells after the cells of the day", () => {
    expect(withTail(ALMATY, 3)).toHaveLength(27);
  });

  it("should start the first tail cell at the end of the reference day", () => {
    expect(withTail("Asia/Kolkata", 3)[24].start.equals(ALMATY_DAY.end)).toBe(
      true,
    );
  });

  it.each([
    [ALMATY, 24],
    ["Asia/Kolkata", 24],
    ["Europe/Moscow", 26],
  ])(
    "should put the midnight cell of the tail of %s at column %i",
    (zone, column) => {
      const midnightColumns = withTail(zone, 3)
        .map((cell, index) => (cell.midnightDate ? index : -1))
        .filter((index) => index >= 0 && index >= 24);

      expect(midnightColumns).toEqual([column]);
      expect(withTail(zone, 3)[column].midnightDate?.toString()).toBe(
        "2026-03-09",
      );
    },
  );

  it("should keep the cells of the day by identity when the tail grows", () => {
    const shorter = withTail(NEW_YORK, 1);
    const longer = withTail(NEW_YORK, 3);

    expect(longer.slice(0, 25)).toEqual(shorter);
    expect(
      longer.slice(0, 25).every((cell, index) => cell === shorter[index]),
    ).toBe(true);
  });

  it("should give the cells of the day the array of no tail when the tail is zero", () => {
    expect(withTail(NEW_YORK, 0)).toBe(cellsOf(NEW_YORK));
  });

  it("should colour the tail cells by the day periods of the next day", () => {
    expect(withTail(ALMATY, 3)[24].dayPeriod).toBe(DayPeriod.NIGHT);
  });
});
