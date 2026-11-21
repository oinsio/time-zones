import {
  HOUR_CELL_DURATION,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import { type Coordinates, getCoordinatesKey } from "./coordinates";
import type { ReferenceDay } from "./dayTrack";
import {
  createHourCellBuilder,
  type HourCell,
  type HourCellBuilder,
} from "./hourCellBuilder";
import type { MeetingRange } from "./meetingRange";
import { getNextReferenceDay } from "./nextReferenceDay";

/**
 * Hour cells of a location over the reference day, and the strip tail: the
 * first cells of the next reference day that a meeting range past midnight
 * needs. Pure; arithmetic on instants only.
 * Implements FR1, FR2, FR5, FR6, FR8, NFR-P1 of add-grid-hour-cells-and-hour-frame (D1),
 * FR6, FR8, NFR-P1 of bind-day-periods-to-sun (D5),
 * FR6, FR7, NFR-P1 of move-meeting-range-and-extend-past-midnight (D4).
 */
export type { HourCell } from "./hourCellBuilder";

type ZoneCells = {
  dayCells: readonly HourCell[];
  tailCells: HourCell[];
  buildTailCell: HourCellBuilder | undefined;
  withTail: Map<number, readonly HourCell[]>;
};

let cachedCellsKey: string | undefined;
let cachedCellsByZone = new Map<string, ZoneCells>();

/** The number of hour cells of the reference day: 23, 24 or 25, one more when it ends with a shorter cell. */
export function getHourCellCount(day: ReferenceDay): number {
  return Math.ceil(day.lengthMinutes / MINUTES_PER_HOUR);
}

/**
 * The number of cells of the strip tail: from the cell after the last one the
 * range overlaps, one spare cell more, as far as the next reference day has
 * cells. Zero without a meeting range.
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4).
 */
export function getStripTailCellCount(
  meeting: MeetingRange | undefined,
  day: ReferenceDay,
  referenceZoneId: string,
): number {
  if (meeting === undefined) return 0;
  const endMinutes =
    (meeting.end.epochMilliseconds - day.start.epochMilliseconds) /
    MILLISECONDS_PER_MINUTE;
  const lastColumn = Math.ceil(endMinutes / MINUTES_PER_HOUR) - 1;
  const tailCount = lastColumn + 2 - getHourCellCount(day);
  return Math.min(
    Math.max(tailCount, 0),
    getHourCellCount(getNextReferenceDay(day, referenceZoneId)),
  );
}

/**
 * The start of the hour cell in a column: the one owner of the column
 * arithmetic. A column past the reference day's cells is a tail column: it
 * starts the next reference day's hours from its start.
 * Implements FR5 of add-grid-meeting-range-and-share (D2).
 * Implements FR6 of move-meeting-range-and-extend-past-midnight (D4, D10).
 */
export function getHourCellStart(
  day: ReferenceDay,
  column: number,
): Temporal.Instant {
  const dayCellCount = getHourCellCount(day);
  return column < dayCellCount
    ? day.start.add({ hours: column * HOUR_CELL_DURATION.hours })
    : day.end.add({
        hours: (column - dayCellCount) * HOUR_CELL_DURATION.hours,
      });
}

function getZoneCells(
  timeZoneId: string,
  day: ReferenceDay,
  referenceZoneId: string,
  coordinates: Coordinates | undefined,
): ZoneCells {
  const cellsKey = `${day.start.epochMilliseconds}|${day.end.epochMilliseconds}|${referenceZoneId}`;
  if (cellsKey !== cachedCellsKey) {
    cachedCellsKey = cellsKey;
    cachedCellsByZone = new Map();
  }
  const zoneKey = `${timeZoneId}|${getCoordinatesKey(coordinates)}`;
  const cached = cachedCellsByZone.get(zoneKey);
  if (cached !== undefined) return cached;
  const buildCell = createHourCellBuilder(
    timeZoneId,
    day,
    referenceZoneId,
    coordinates,
    false,
  );
  const created: ZoneCells = {
    dayCells: Array.from({ length: getHourCellCount(day) }, (_, column) =>
      buildCell(column, (cellColumn) => getHourCellStart(day, cellColumn)),
    ),
    tailCells: [],
    buildTailCell: undefined,
    withTail: new Map(),
  };
  cachedCellsByZone.set(zoneKey, created);
  return created;
}

/**
 * The hour cells of a location over the reference day followed by
 * `tailCellCount` cells of the strip tail; the same array on a repeated call,
 * and the same cell objects when only the tail count changes.
 */
export function getHourCells(
  timeZoneId: string,
  day: ReferenceDay,
  referenceZoneId: string,
  coordinates: Coordinates | undefined,
  tailCellCount = 0,
): readonly HourCell[] {
  const zoneCells = getZoneCells(timeZoneId, day, referenceZoneId, coordinates);
  if (tailCellCount === 0) return zoneCells.dayCells;
  const cachedWithTail = zoneCells.withTail.get(tailCellCount);
  if (cachedWithTail !== undefined) return cachedWithTail;
  const nextDay = getNextReferenceDay(day, referenceZoneId);
  zoneCells.buildTailCell ??= createHourCellBuilder(
    timeZoneId,
    nextDay,
    referenceZoneId,
    coordinates,
    true,
  );
  const buildTailCell = zoneCells.buildTailCell;
  while (zoneCells.tailCells.length < tailCellCount) {
    zoneCells.tailCells.push(
      buildTailCell(zoneCells.tailCells.length, (column) =>
        getHourCellStart(nextDay, column),
      ),
    );
  }
  const cells = [
    ...zoneCells.dayCells,
    ...zoneCells.tailCells.slice(0, tailCellCount),
  ];
  zoneCells.withTail.set(tailCellCount, cells);
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
