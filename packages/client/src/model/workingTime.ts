import {
  MILLISECONDS_PER_MINUTE,
  UTC_ZONE_ID,
  WORKING_CELL_MIN_SHARE,
  WORKING_WEEKDAYS,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { WorkingHours } from "@/preferences";
import { getClockChangesAround } from "./clockChange";
import type { ReferenceDay } from "./dayTrack";
import { getHourCellCount, getHourCellStart } from "./hourCells";
import { getUtcOffsetMinutes } from "./utcOffset";

/**
 * Working time: the user's working hours read in each location's local time,
 * on Monday to Friday by the local date. `isWorkingTime` is the definition;
 * the spans, the colour stops and the hour cell flags all agree with it.
 * Implements FR8, FR10, FR11, NFR-P1 of add-day-colouring-setting (D3).
 */

export type WorkingTimeSpan = {
  start: Temporal.Instant;
  end: Temporal.Instant;
};

/** A colour stop of working time: the position and whether it is working time. */
export type WorkingTimeStop = { fraction: number; isWorkingTime: boolean };

/** Whether a local date is a working day (Monday to Friday). */
export function isWorkingDay(date: Temporal.PlainDate): boolean {
  return WORKING_WEEKDAYS.includes(date.dayOfWeek);
}

/** Whether the instant is working time at the location: a working day, at or after the start, before the end. */
export function isWorkingTime(
  instant: Temporal.Instant,
  timeZoneId: string,
  workingHours: WorkingHours,
): boolean {
  const local = instant.toZonedDateTimeISO(timeZoneId);
  const time = local.toPlainTime();
  return (
    isWorkingDay(local.toPlainDate()) &&
    Temporal.PlainTime.compare(
      time,
      Temporal.PlainTime.from(workingHours.start),
    ) >= 0 &&
    Temporal.PlainTime.compare(
      time,
      Temporal.PlainTime.from(workingHours.end),
    ) < 0
  );
}

const compareInstants = (first: Temporal.Instant, second: Temporal.Instant) =>
  first.epochMilliseconds - second.epochMilliseconds;

function getLocalDates(
  timeZoneId: string,
  day: ReferenceDay,
): Temporal.PlainDate[] {
  const first = day.start.toZonedDateTimeISO(timeZoneId).toPlainDate();
  const last = day.end.toZonedDateTimeISO(timeZoneId).toPlainDate();
  const dates: Temporal.PlainDate[] = [];
  for (
    let date = first;
    Temporal.PlainDate.compare(date, last) <= 0;
    date = date.add({ days: 1 })
  ) {
    dates.push(date);
  }
  return dates;
}

const clip = (
  span: WorkingTimeSpan,
  day: ReferenceDay,
): WorkingTimeSpan | undefined => {
  const start =
    compareInstants(span.start, day.start) < 0 ? day.start : span.start;
  const end = compareInstants(span.end, day.end) > 0 ? day.end : span.end;
  return compareInstants(start, end) < 0 ? { start, end } : undefined;
};

/** Without an offset change near the day the edges are plain arithmetic on the day's offset. */
function getSpansWithOneOffset(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
): WorkingTimeSpan[] {
  const offsetMinutes = getUtcOffsetMinutes(timeZoneId, day.start);
  if (offsetMinutes === undefined) return [];
  const offsetMs = offsetMinutes * MILLISECONDS_PER_MINUTE;
  const toInstant = (date: Temporal.PlainDate, wallTime: string) =>
    Temporal.Instant.fromEpochMilliseconds(
      date.toZonedDateTime({ timeZone: UTC_ZONE_ID, plainTime: wallTime })
        .epochMilliseconds - offsetMs,
    );
  return getLocalDates(timeZoneId, day)
    .filter(isWorkingDay)
    .flatMap((date) => {
      const span = clip(
        {
          start: toInstant(date, workingHours.start),
          end: toInstant(date, workingHours.end),
        },
        day,
      );
      return span === undefined ? [] : [span];
    });
}

/** With an offset change, every candidate edge is tested against `isWorkingTime`. */
function getSpansAcrossOffsetChanges(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
  clockChanges: readonly Temporal.Instant[],
): WorkingTimeSpan[] {
  const resolve = (
    date: Temporal.PlainDate,
    wallTime: string,
    disambiguation: "earlier" | "later",
  ) =>
    date
      .toPlainDateTime(wallTime)
      .toZonedDateTime(timeZoneId, { disambiguation })
      .toInstant();
  const candidates: Temporal.Instant[] = [day.start, day.end, ...clockChanges];
  for (const date of getLocalDates(timeZoneId, day)) {
    candidates.push(date.toZonedDateTime(timeZoneId).toInstant());
    for (const wallTime of [workingHours.start, workingHours.end]) {
      candidates.push(
        resolve(date, wallTime, "earlier"),
        resolve(date, wallTime, "later"),
      );
    }
  }
  const edges = candidates
    .filter(
      (instant) =>
        compareInstants(instant, day.start) >= 0 &&
        compareInstants(instant, day.end) <= 0,
    )
    .sort(compareInstants)
    .filter(
      (instant, index, sorted) =>
        index === 0 || !instant.equals(sorted[index - 1]),
    );
  const spans: WorkingTimeSpan[] = [];
  edges.slice(0, -1).forEach((segmentStart, index) => {
    if (!isWorkingTime(segmentStart, timeZoneId, workingHours)) return;
    const segmentEnd = edges[index + 1];
    const previous = spans[spans.length - 1];
    if (previous !== undefined && previous.end.equals(segmentStart)) {
      previous.end = segmentEnd;
    } else {
      spans.push({ start: segmentStart, end: segmentEnd });
    }
  });
  return spans;
}

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
    spans:
      clockChanges.length === 0
        ? getSpansWithOneOffset(timeZoneId, day, workingHours)
        : getSpansAcrossOffsetChanges(
            timeZoneId,
            day,
            workingHours,
            clockChanges,
          ),
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
