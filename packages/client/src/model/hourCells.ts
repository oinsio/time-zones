import {
  HOUR_CELL_DURATION,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import {
  DAY_PERIOD_SCHEDULE,
  type DayPeriod,
  getDayPeriod,
} from "./dayPeriods";
import { findOffsetTransitions } from "./dayPeriodWindows";
import type { ReferenceDay } from "./dayTrack";

/**
 * Hour cells of a location over the reference day: the absolute hours from the
 * reference zone's midnight, each with the location's local start, day period,
 * offset edge and midnight date. Pure; arithmetic on instants only.
 * Implements FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame (D1).
 */

export type HourCell = {
  /** Start of the absolute hour. */
  start: Temporal.Instant;
  /** The start in the location's zone. */
  localStart: Temporal.ZonedDateTime;
  dayPeriod: DayPeriod;
  /** The location's clocks change inside the day, right before this cell. */
  hasOffsetEdge: boolean;
  /** Set on the midnight cell only: the new local date. */
  midnightDate?: Temporal.PlainDate;
};

let cachedCellsKey: string | undefined;
let cachedCellsByZone = new Map<string, readonly HourCell[]>();

function buildHourCells(
  timeZoneId: string,
  day: ReferenceDay,
  referenceZoneId: string,
): readonly HourCell[] {
  const offsetChanges = findOffsetTransitions(timeZoneId, day, 0).filter(
    (change) => change.epochMilliseconds > day.start.epochMilliseconds,
  );
  const cellCount = getHourCellCount(day);
  return Array.from({ length: cellCount }, (_, column) => {
    const start = day.start.add({
      hours: column * HOUR_CELL_DURATION.hours,
    });
    const localStart = start.toZonedDateTimeISO(timeZoneId);
    const localDate = localStart.toPlainDate();
    const previousStart = start.subtract(HOUR_CELL_DURATION);
    const isMidnight =
      timeZoneId !== referenceZoneId &&
      !previousStart
        .toZonedDateTimeISO(timeZoneId)
        .toPlainDate()
        .equals(localDate);
    return {
      start,
      localStart,
      dayPeriod: getDayPeriod(localStart.toPlainTime(), DAY_PERIOD_SCHEDULE),
      hasOffsetEdge: offsetChanges.some(
        (change) =>
          change.epochMilliseconds <= start.epochMilliseconds &&
          change.epochMilliseconds > previousStart.epochMilliseconds,
      ),
      ...(isMidnight ? { midnightDate: localDate } : {}),
    };
  });
}

/** The number of hour cells of the reference day: 23, 24 or 25, one more when it ends with a shorter cell. */
export function getHourCellCount(day: ReferenceDay): number {
  return Math.ceil(day.lengthMinutes / MINUTES_PER_HOUR);
}

/** The hour cells of a location over the reference day; the same array on a repeated call. */
export function getHourCells(
  timeZoneId: string,
  day: ReferenceDay,
  referenceZoneId: string,
): readonly HourCell[] {
  const cellsKey = `${day.start.epochMilliseconds}|${day.end.epochMilliseconds}|${referenceZoneId}`;
  if (cellsKey !== cachedCellsKey) {
    cachedCellsKey = cellsKey;
    cachedCellsByZone = new Map();
  }
  const cachedCells = cachedCellsByZone.get(timeZoneId);
  if (cachedCells !== undefined) return cachedCells;
  const cells = buildHourCells(timeZoneId, day, referenceZoneId);
  cachedCellsByZone.set(timeZoneId, cells);
  return cells;
}

/** The column of the hour frame: the cell that contains the instant, clamped to the day. */
export function getHourFrameIndex(
  day: ReferenceDay,
  instant: Temporal.Instant,
): number {
  const minutesFromStart =
    (instant.epochMilliseconds - day.start.epochMilliseconds) /
    MILLISECONDS_PER_MINUTE;
  const lastColumn = getHourCellCount(day) - 1;
  return Math.min(
    Math.max(Math.floor(minutesFromStart / MINUTES_PER_HOUR), 0),
    lastColumn,
  );
}
