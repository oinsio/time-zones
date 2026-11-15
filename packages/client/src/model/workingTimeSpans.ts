import { MILLISECONDS_PER_MINUTE, UTC_ZONE_ID } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { WorkingHours } from "@/preferences";
import type { ReferenceDay } from "./dayTrack";
import { getUtcOffsetMinutes } from "./utcOffset";
import { isWorkingDay, isWorkingTime } from "./workingDay";

// Implements FR8, FR10, FR16 of add-day-colouring-setting (D3): the spans of working time.

export type WorkingTimeSpan = {
  start: Temporal.Instant;
  end: Temporal.Instant;
};

export const compareInstants = (
  first: Temporal.Instant,
  second: Temporal.Instant,
) => first.epochMilliseconds - second.epochMilliseconds;

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

/** The working spans of a location clipped to the reference day; edges are tested against `isWorkingTime` when the offset changes. */
export function computeWorkingTimeSpans(
  timeZoneId: string,
  day: ReferenceDay,
  workingHours: WorkingHours,
  clockChanges: readonly Temporal.Instant[],
): WorkingTimeSpan[] {
  return clockChanges.length === 0
    ? getSpansWithOneOffset(timeZoneId, day, workingHours)
    : getSpansAcrossOffsetChanges(timeZoneId, day, workingHours, clockChanges);
}
