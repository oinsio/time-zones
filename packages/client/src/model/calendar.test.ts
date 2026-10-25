// Verifies FR3 of select-date-with-calendar-and-now (D3: the focus-target arithmetic; the keys themselves are proven in the browser by 7.1).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  CalendarMove,
  getCalendarFocusTarget,
  getCalendarWeeks,
} from "./calendar";

const SUNDAY = 7;
const MONDAY = 1;

const isoWeeks = (month: string, firstDayOfWeek: number) =>
  getCalendarWeeks(Temporal.PlainDate.from(month), firstDayOfWeek).map((week) =>
    week.map((day) => day?.toString() ?? null),
  );

describe("getCalendarWeeks", () => {
  it("should lay out March 2026 in 5 rows from Sunday", () => {
    const weeks = isoWeeks("2026-03-15", SUNDAY);

    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
    ]);
  });

  it("should lay out March 2026 in 6 rows from Monday", () => {
    const weeks = isoWeeks("2026-03-15", MONDAY);

    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-03-01",
    ]);
    expect(weeks[1]?.[0]).toBe("2026-03-02");
  });

  it("should lay out February 2026 in 4 rows without empty cells from Sunday", () => {
    const weeks = isoWeeks("2026-02-10", SUNDAY);

    expect(weeks).toHaveLength(4);
    expect(weeks.flat()).not.toContain(null);
  });

  it("should leave the cells after the last day empty", () => {
    const weeks = isoWeeks("2026-03-15", SUNDAY);

    expect(weeks[4]).toEqual([
      "2026-03-29",
      "2026-03-30",
      "2026-03-31",
      null,
      null,
      null,
      null,
    ]);
  });
});

describe("getCalendarFocusTarget", () => {
  it.each([
    ["2026-03-08", CalendarMove.NEXT_DAY, SUNDAY, "2026-03-09"],
    ["2026-03-08", CalendarMove.PREVIOUS_DAY, SUNDAY, "2026-03-07"],
    ["2026-03-08", CalendarMove.PREVIOUS_WEEK, SUNDAY, "2026-03-01"],
    ["2026-03-08", CalendarMove.NEXT_WEEK, SUNDAY, "2026-03-15"],
    ["2026-03-08", CalendarMove.WEEK_START, SUNDAY, "2026-03-08"],
    ["2026-03-08", CalendarMove.WEEK_END, SUNDAY, "2026-03-14"],
    ["2026-03-08", CalendarMove.NEXT_MONTH, SUNDAY, "2026-04-08"],
    ["2026-03-08", CalendarMove.PREVIOUS_MONTH, SUNDAY, "2026-02-08"],
    ["2026-03-31", CalendarMove.NEXT_DAY, SUNDAY, "2026-04-01"],
    ["2026-01-31", CalendarMove.NEXT_MONTH, SUNDAY, "2026-02-28"],
    ["2026-04-08", CalendarMove.WEEK_END, SUNDAY, "2026-04-11"],
    ["2026-03-08", CalendarMove.WEEK_START, MONDAY, "2026-03-02"],
    ["2026-03-08", CalendarMove.WEEK_END, MONDAY, "2026-03-08"],
  ])(
    "should move %s by %s (first day %i) to %s",
    (from, move, firstDay, expected) => {
      expect(
        getCalendarFocusTarget(
          Temporal.PlainDate.from(from),
          move,
          firstDay,
        ).toString(),
      ).toBe(expected);
    },
  );

  it("should keep the date when the move leaves the supported range", () => {
    const lastDate = Temporal.PlainDate.from("+275760-09-13");

    expect(
      getCalendarFocusTarget(lastDate, CalendarMove.NEXT_DAY, SUNDAY),
    ).toBe(lastDate);
  });
});
