import { type Coordinates, getCoordinatesKey } from "./coordinates";
import type { ReferenceDay } from "./dayTrack";
import {
  createHourCellBuilder,
  type HourCell,
  type HourCellBuilder,
} from "./hourCellBuilder";
import { getHourCellCount, getHourCellStart } from "./hourCellColumns";
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
