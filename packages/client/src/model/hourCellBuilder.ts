import { HOUR_CELL_DURATION } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import { findOffsetTransitions } from "./clockChange";
import type { Coordinates } from "./coordinates";
import { getDayPeriodBoundaries } from "./dayPeriodBoundaries";
import { type DayPeriod, getDayPeriodAt } from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";
import { getLargestSharePeriod } from "./hourCellPeriod";

/**
 * One hour cell of a location: the absolute hour from the reference zone's
 * midnight, with the location's local start, day period, offset edge and
 * midnight date.
 */
export type HourCell = {
  /** Start of the absolute hour. */
  start: Temporal.Instant;
  /** The start in the location's zone. */
  localStart: Temporal.ZonedDateTime;
  /** The period that holds most of the cell; `undefined` for a location without coordinates. */
  dayPeriod: DayPeriod | undefined;
  /** The location's clocks change inside the day, right before this cell. */
  hasOffsetEdge: boolean;
  /** Set on the midnight cell only: the new local date. */
  midnightDate?: Temporal.PlainDate;
};

/** Builds the cells of one reference day by column; the day's boundaries are computed once. */
export type HourCellBuilder = (
  column: number,
  getStart: (column: number) => Temporal.Instant,
) => HourCell;

/**
 * Prepares the cell builder of `day` for one location. The first column of
 * the reference zone's own reference day is no midnight cell; its first
 * column of the strip tail is one (`isTailDay`).
 * Implements FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame (D1),
 * FR6, FR8, NFR-P1 of bind-day-periods-to-sun (D5),
 * FR6, FR7 of move-meeting-range-and-extend-past-midnight (D4).
 */
export function createHourCellBuilder(
  timeZoneId: string,
  day: ReferenceDay,
  referenceZoneId: string,
  coordinates: Coordinates | undefined,
  isTailDay: boolean,
): HourCellBuilder {
  const boundaries =
    coordinates === undefined ? [] : getDayPeriodBoundaries(coordinates, day);
  const periodWithoutBoundaries =
    coordinates !== undefined && boundaries.length === 0
      ? getDayPeriodAt(coordinates, day.start.epochMilliseconds)
      : undefined;
  const offsetChanges = findOffsetTransitions(timeZoneId, day, 0).filter(
    (change) => change.epochMilliseconds > day.start.epochMilliseconds,
  );
  return (column, getStart) => {
    const start = getStart(column);
    const localStart = start.toZonedDateTimeISO(timeZoneId);
    const localDate = localStart.toPlainDate();
    const previousStart = start.subtract(HOUR_CELL_DURATION);
    const isReferenceDayStart =
      column === 0 && !isTailDay && timeZoneId === referenceZoneId;
    const isMidnight =
      !isReferenceDayStart &&
      !previousStart
        .toZonedDateTimeISO(timeZoneId)
        .toPlainDate()
        .equals(localDate);
    return {
      start,
      localStart,
      dayPeriod:
        coordinates === undefined
          ? undefined
          : getLargestSharePeriod(
              boundaries,
              periodWithoutBoundaries as DayPeriod,
              start.epochMilliseconds,
              Math.min(
                start.add(HOUR_CELL_DURATION).epochMilliseconds,
                day.end.epochMilliseconds,
              ),
            ),
      hasOffsetEdge: offsetChanges.some(
        (change) =>
          change.epochMilliseconds <= start.epochMilliseconds &&
          change.epochMilliseconds > previousStart.epochMilliseconds,
      ),
      ...(isMidnight ? { midnightDate: localDate } : {}),
    };
  };
}
