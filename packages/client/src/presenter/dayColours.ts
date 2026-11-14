import {
  type DayPeriod,
  getDayPeriodStops,
  getWorkingTimeStops,
  type HourCell,
  type ReferenceDay,
  type WorkingTimeStop,
} from "@/model";
import { DayColouring, type WorkingHours } from "@/preferences";

/**
 * Day colours: what colour a position of a day track or an hour cell has in
 * the chosen day colouring. The one place that turns a day colouring into
 * colours; views only map a colour to design tokens.
 * Implements FR2, FR9–FR13, NFR-P1 of add-day-colouring-setting (D4).
 */

/** The colour of a track position or a cell. The four period members have the string values of `DayPeriod`. */
export enum DayColour {
  NIGHT = "NIGHT",
  MORNING = "MORNING",
  WORK = "WORK",
  EVENING = "EVENING",
  PLAIN = "PLAIN",
  WORKING_TIME = "WORKING_TIME",
  NON_WORKING_TIME = "NON_WORKING_TIME",
}

export type DayColourStop = { fraction: number; colour: DayColour };

/** The colour of the hour frame: the accent, or the foreground where the cells are accent. */
export enum HourFrameColour {
  ACCENT = "ACCENT",
  FOREGROUND = "FOREGROUND",
}

const PLAIN_STOPS: readonly DayColourStop[] = [
  { fraction: 0, colour: DayColour.PLAIN },
];

const periodColour = (period: DayPeriod): DayColour =>
  DayColour[period as keyof typeof DayColour];

const workingTimeColour = (isWorkingTime: boolean): DayColour =>
  isWorkingTime ? DayColour.WORKING_TIME : DayColour.NON_WORKING_TIME;

const periodStopsCache = new WeakMap<object, readonly DayColourStop[]>();
const workingStopsCache = new WeakMap<object, readonly DayColourStop[]>();

const memoizeMapped = <Source extends object>(
  cache: WeakMap<object, readonly DayColourStop[]>,
  source: readonly Source[],
  map: (stop: Source) => DayColourStop,
): readonly DayColourStop[] => {
  const cached = cache.get(source);
  if (cached !== undefined) return cached;
  const mapped = source.map(map);
  cache.set(source, mapped);
  return mapped;
};

/** The colour stops of a track; the same array while the model's stops are the same, so a minute tick presents nothing new. */
export function presentDayColourStops(
  timeZoneId: string,
  day: ReferenceDay,
  dayColouring: DayColouring,
  workingHours: WorkingHours,
): readonly DayColourStop[] {
  switch (dayColouring) {
    case DayColouring.PLAIN:
      return PLAIN_STOPS;
    case DayColouring.TIME_OF_DAY:
      return memoizeMapped(
        periodStopsCache,
        getDayPeriodStops(timeZoneId, day),
        (stop) => ({
          fraction: stop.fraction,
          colour: periodColour(stop.period),
        }),
      );
    case DayColouring.WORKING_HOURS:
      return memoizeMapped(
        workingStopsCache,
        getWorkingTimeStops(timeZoneId, day, workingHours),
        (stop: WorkingTimeStop) => ({
          fraction: stop.fraction,
          colour: workingTimeColour(stop.isWorkingTime),
        }),
      );
  }
}

/** The colour of an hour cell; `isWorkingCell` is the model's flag of the cell's column. */
export function presentHourCellColour(
  cell: HourCell,
  isWorkingCell: boolean,
  dayColouring: DayColouring,
): DayColour {
  switch (dayColouring) {
    case DayColouring.PLAIN:
      return DayColour.PLAIN;
    case DayColouring.TIME_OF_DAY:
      return periodColour(cell.dayPeriod);
    case DayColouring.WORKING_HOURS:
      return workingTimeColour(isWorkingCell);
  }
}

/** The accent frame stays only where the cells are not accent (Time of day). */
export function getHourFrameColour(
  dayColouring: DayColouring,
): HourFrameColour {
  return dayColouring === DayColouring.TIME_OF_DAY
    ? HourFrameColour.ACCENT
    : HourFrameColour.FOREGROUND;
}
