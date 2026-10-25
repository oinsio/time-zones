import { NANOSECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  DAY_PERIOD_SCHEDULE,
  type DayPeriod,
  type DayPeriodBoundary,
  getDayPeriod,
} from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";

/**
 * Colour stops of a day track: where the day periods of a zone blend (soft
 * boundaries) and where an offset change jumps to another period (hard
 * edges). Collection reads time zone rules; assembly is pure on plain data.
 * Implements FR6, NFR-P2 of add-time-sliders-to-location-cards (D4).
 */

export type DayPeriodStop = { fraction: number; period: DayPeriod };

export type BlendWindow = {
  start: Temporal.Instant;
  end: Temporal.Instant;
  from: DayPeriod;
  to: DayPeriod;
};

export type OffsetEdge = {
  instant: Temporal.Instant;
  before: DayPeriod;
  after: DayPeriod;
};

const HALF = 2;

/**
 * Blend windows around the boundaries inside the day. A boundary whose wall
 * time is skipped by a gap is left out; one repeated by an overlap uses its
 * earlier occurrence.
 */
export function collectBlendWindows(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
): BlendWindow[] {
  const firstDate = day.start
    .toZonedDateTimeISO(timeZoneId)
    .toPlainDate()
    .subtract({ days: 1 });
  const lastDate = day.end.toZonedDateTimeISO(timeZoneId).toPlainDate();
  const windows: BlendWindow[] = [];
  for (
    let date = firstDate;
    Temporal.PlainDate.compare(date, lastDate) <= 0;
    date = date.add({ days: 1 })
  ) {
    for (const boundary of schedule) {
      const wanted = date.toPlainDateTime(
        Temporal.PlainTime.from(boundary.wallTime),
      );
      const zoned = wanted.toZonedDateTime(timeZoneId, {
        disambiguation: "earlier",
      });
      if (!zoned.toPlainDateTime().equals(wanted)) continue;
      const halfBlend = {
        nanoseconds: (boundary.blendMinutes * NANOSECONDS_PER_MINUTE) / HALF,
      };
      const start = zoned.toInstant().subtract(halfBlend);
      const end = zoned.toInstant().add(halfBlend);
      const intersects =
        Temporal.Instant.compare(end, day.start) >= 0 &&
        Temporal.Instant.compare(start, day.end) <= 0;
      if (intersects) {
        windows.push({ start, end, from: boundary.from, to: boundary.to });
      }
    }
  }
  return windows;
}

const getPeriodAt = (
  instant: Temporal.Instant,
  timeZoneId: string,
  schedule: readonly DayPeriodBoundary[],
) =>
  getDayPeriod(instant.toZonedDateTimeISO(timeZoneId).toPlainTime(), schedule);

/** Offset changes inside the day that move the local time to another period. */
export function collectOffsetEdges(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
): OffsetEdge[] {
  const edges: OffsetEdge[] = [];
  let transition = day.start
    .toZonedDateTimeISO(timeZoneId)
    .getTimeZoneTransition("next");
  while (
    transition !== null &&
    Temporal.Instant.compare(transition.toInstant(), day.end) < 0
  ) {
    const instant = transition.toInstant();
    const before = getPeriodAt(
      instant.subtract({ nanoseconds: 1 }),
      timeZoneId,
      schedule,
    );
    const after = getPeriodAt(instant, timeZoneId, schedule);
    if (before !== after) edges.push({ instant, before, after });
    transition = transition.getTimeZoneTransition("next");
  }
  return edges;
}

const getFractionOf = (day: ReferenceDay, instant: Temporal.Instant) =>
  day.start.until(instant).total({ unit: "minute" }) / day.lengthMinutes;

/** Sorted stops: two per blend window, two at the same position per hard edge. */
export function assembleDayPeriodStops(
  windows: readonly BlendWindow[],
  edges: readonly OffsetEdge[],
  day: ReferenceDay,
): DayPeriodStop[] {
  const stops: DayPeriodStop[] = [
    ...windows.flatMap((window) => [
      { fraction: getFractionOf(day, window.start), period: window.from },
      { fraction: getFractionOf(day, window.end), period: window.to },
    ]),
    ...edges.flatMap((edge) => {
      const fraction = getFractionOf(day, edge.instant);
      return [
        { fraction, period: edge.before },
        { fraction, period: edge.after },
      ];
    }),
  ];
  return stops.sort((first, second) => first.fraction - second.fraction);
}

let cachedDayKey: string | undefined;
let cachedStopsByZone = new Map<string, readonly DayPeriodStop[]>();

/** Memoized for one reference day: drags and ticks reuse the same array. */
export function getDayPeriodStops(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
): readonly DayPeriodStop[] {
  const dayKey = `${day.start.toString()}|${day.end.toString()}`;
  if (dayKey !== cachedDayKey) {
    cachedDayKey = dayKey;
    cachedStopsByZone = new Map();
  }
  const cached = cachedStopsByZone.get(timeZoneId);
  if (cached !== undefined) return cached;
  const stops = assembleDayPeriodStops(
    collectBlendWindows(timeZoneId, day, schedule),
    collectOffsetEdges(timeZoneId, day, schedule),
    day,
  );
  cachedStopsByZone.set(timeZoneId, stops);
  return stops;
}
