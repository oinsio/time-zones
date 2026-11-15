import { MILLISECONDS_PER_MINUTE, WORKING_CELL_MIN_SHARE } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { WorkingHours } from "@/preferences";
import { getClockChangesAround } from "./clockChange";
import type { ReferenceDay } from "./dayTrack";
import { getHourCellCount, getHourCellStart } from "./hourCells";
import { isWorkingDay, isWorkingTime } from "./workingDay";
import {
  compareInstants,
  computeWorkingTimeSpans,
  type WorkingTimeSpan,
} from "./workingTimeSpans";

export type { WorkingTimeSpan };
export { isWorkingDay, isWorkingTime };

/**
 * Working time: the user's working hours read in each location's local time,
 * on Monday to Friday by the local date. `isWorkingTime` is the definition;
 * the spans, the colour stops and the hour cell flags all agree with it.
 * Implements FR8, FR10, FR11, NFR-P1 of add-day-colouring-setting (D3).
 */

/** A colour stop of working time: the position and whether it is working time. */
export type WorkingTimeStop = { fraction: number; isWorkingTime: boolean };

type WorkingTimeEntry = {
  spans: readonly WorkingTimeSpan[];
  stops?: readonly WorkingTimeStop[];
  flags?: readonly boolean[];
};

let cachedKey: string | undefined;
let cachedEntriesByZone = new Map<string, WorkingTimeEntry>();

function getEntry(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
): WorkingTimeEntry {
  const key = `${day.start.epochMilliseconds}|${day.end.epochMilliseconds}|${workingHours.start}|${workingHours.end}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedEntriesByZone = new Map();
  }
  const cached = cachedEntriesByZone.get(timeZoneId);
  if (cached !== undefined) return cached;
  const clockChanges = getClockChangesAround(timeZoneId, day);
  const entry: WorkingTimeEntry = {
    spans: computeWorkingTimeSpans(timeZoneId, day, workingHours, clockChanges),
  };
  cachedEntriesByZone.set(timeZoneId, entry);
  return entry;
}

/** The working time of a location clipped to the reference day, as instants; memoized per zone. */
export function getWorkingTimeSpans(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
): readonly WorkingTimeSpan[] {
  return getEntry(timeZoneId, day, workingHours).spans;
}

function buildStops(
  spans: readonly WorkingTimeSpan[],
  day: ReferenceDay,
): WorkingTimeStop[] {
  const lengthMs = day.lengthMinutes * MILLISECONDS_PER_MINUTE;
  const fractionOf = (instant: Temporal.Instant) =>
    (instant.epochMilliseconds - day.start.epochMilliseconds) / lengthMs;
  const edges = spans.flatMap((span) => [
    ...(compareInstants(span.start, day.start) > 0
      ? [{ fraction: fractionOf(span.start), isStart: true }]
      : []),
    ...(compareInstants(span.end, day.end) < 0
      ? [{ fraction: fractionOf(span.end), isStart: false }]
      : []),
  ]);
  if (edges.length === 0) {
    return [{ fraction: 0, isWorkingTime: spans.length > 0 }];
  }
  return edges.flatMap((edge) => [
    { fraction: edge.fraction, isWorkingTime: !edge.isStart },
    { fraction: edge.fraction, isWorkingTime: edge.isStart },
  ]);
}

/** Colour stops of a location's track: two at one position per edge inside the day, or one at 0 without an edge. */
export function getWorkingTimeStops(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
): readonly WorkingTimeStop[] {
  const entry = getEntry(timeZoneId, day, workingHours);
  entry.stops ??= buildStops(entry.spans, day);
  return entry.stops;
}

function buildFlags(
  spans: readonly WorkingTimeSpan[],
  day: ReferenceDay,
): boolean[] {
  return Array.from({ length: getHourCellCount(day) }, (_, column) => {
    const cellStart = getHourCellStart(day, column).epochMilliseconds;
    const nextStart = getHourCellStart(day, column + 1).epochMilliseconds;
    const cellEnd = Math.min(nextStart, day.end.epochMilliseconds);
    const workingMs = spans.reduce(
      (total, span) =>
        total +
        Math.max(
          0,
          Math.min(span.end.epochMilliseconds, cellEnd) -
            Math.max(span.start.epochMilliseconds, cellStart),
        ),
      0,
    );
    return workingMs >= (cellEnd - cellStart) * WORKING_CELL_MIN_SHARE;
  });
}

/** One flag per hour cell column: working when working time covers at least half of the cell; memoized per zone. */
export function getHourCellWorkingFlags(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
): readonly boolean[] {
  const entry = getEntry(timeZoneId, day, workingHours);
  entry.flags ??= buildFlags(entry.spans, day);
  return entry.flags;
}
