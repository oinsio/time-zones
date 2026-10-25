import { DAYS_PER_WEEK } from "@/constants";
import type { Temporal } from "@/lib/temporal";

/** Moves of the keyboard focus in the calendar grid. Implements FR3 (D3). */
export enum CalendarMove {
  PREVIOUS_DAY = "PREVIOUS_DAY",
  NEXT_DAY = "NEXT_DAY",
  PREVIOUS_WEEK = "PREVIOUS_WEEK",
  NEXT_WEEK = "NEXT_WEEK",
  WEEK_START = "WEEK_START",
  WEEK_END = "WEEK_END",
  PREVIOUS_MONTH = "PREVIOUS_MONTH",
  NEXT_MONTH = "NEXT_MONTH",
}

/** Days from the start of the week to `date`; `firstDayOfWeek` is an ISO weekday. */
function getDaysSinceWeekStart(
  date: Temporal.PlainDate,
  firstDayOfWeek: number,
): number {
  return (date.dayOfWeek - firstDayOfWeek + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

/**
 * Week rows of the month containing `month`; cells outside the month are
 * `null`. `firstDayOfWeek` is an ISO weekday (1 = Monday … 7 = Sunday).
 * Implements FR3 of select-date-with-calendar-and-now (D3).
 */
export function getCalendarWeeks(
  month: Temporal.PlainDate,
  firstDayOfWeek: number,
): (Temporal.PlainDate | null)[][] {
  const firstDay = month.with({ day: 1 });
  const leadingEmptyCells = getDaysSinceWeekStart(firstDay, firstDayOfWeek);
  const cells: (Temporal.PlainDate | null)[] = Array.from(
    { length: leadingEmptyCells },
    () => null,
  );
  for (let day = 1; day <= month.daysInMonth; day++) {
    cells.push(month.with({ day }));
  }
  const weeks: (Temporal.PlainDate | null)[][] = [];
  for (let start = 0; start < cells.length; start += DAYS_PER_WEEK) {
    const week = cells.slice(start, start + DAYS_PER_WEEK);
    while (week.length < DAYS_PER_WEEK) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function applyMove(
  date: Temporal.PlainDate,
  move: CalendarMove,
  firstDayOfWeek: number,
): Temporal.PlainDate {
  switch (move) {
    case CalendarMove.PREVIOUS_DAY:
      return date.subtract({ days: 1 });
    case CalendarMove.NEXT_DAY:
      return date.add({ days: 1 });
    case CalendarMove.PREVIOUS_WEEK:
      return date.subtract({ weeks: 1 });
    case CalendarMove.NEXT_WEEK:
      return date.add({ weeks: 1 });
    case CalendarMove.WEEK_START:
      return date.subtract({
        days: getDaysSinceWeekStart(date, firstDayOfWeek),
      });
    case CalendarMove.WEEK_END:
      return date.add({
        days: DAYS_PER_WEEK - 1 - getDaysSinceWeekStart(date, firstDayOfWeek),
      });
    case CalendarMove.PREVIOUS_MONTH:
      return date.subtract({ months: 1 });
    case CalendarMove.NEXT_MONTH:
      return date.add({ months: 1 });
  }
}

/**
 * Where the focus goes from `date` on `move`; the date itself when the move
 * leaves the range Temporal supports.
 * Implements FR3 of select-date-with-calendar-and-now (D3).
 */
export function getCalendarFocusTarget(
  date: Temporal.PlainDate,
  move: CalendarMove,
  firstDayOfWeek: number,
): Temporal.PlainDate {
  try {
    return applyMove(date, move, firstDayOfWeek);
  } catch (e) {
    if (e instanceof RangeError) return date;
    throw e;
  }
}
