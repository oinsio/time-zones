import {
  MILLISECONDS_PER_MINUTE,
  OFFSET_CHANGE_MARGIN_HOURS,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { getClockChanges } from "./clockChange";
import {
  DAY_PERIOD_SCHEDULE,
  type DayPeriod,
  type DayPeriodBoundary,
} from "./dayPeriods";
import {
  type BlendWindow,
  collectBlendWindows,
  collectOffsetEdges,
  type OffsetEdge,
} from "./dayPeriodWindows";
import type { ReferenceDay } from "./dayTrack";

/**
 * Colour stops of a day track: two per blend window (soft boundaries) and
 * two at one position per offset edge (hard edges). Assembly is pure on
 * plain data; the stops of one reference day are memoized.
 * Implements FR6, NFR-P2 of add-time-sliders-to-location-cards (D4),
 * FR3 of support-legacy-ios-12-safari (milliseconds, no BigInt).
 */

export type DayPeriodStop = { fraction: number; period: DayPeriod };

const getFractionOf = (day: ReferenceDay, instant: Temporal.Instant) =>
  (instant.epochMilliseconds - day.start.epochMilliseconds) /
  (day.lengthMinutes * MILLISECONDS_PER_MINUTE);

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

/**
 * The offset changes from just before the day to just after it, taken from the
 * clock changes of the day's window, so one search serves the note and the
 * colours.
 * Implements FR2, NFR-P1 of show-clock-change-note-on-location-cards (D2).
 */
function getClockChangesAround(
  timeZoneId: string,
  day: ReferenceDay,
): Temporal.Instant[] {
  const margin = { hours: OFFSET_CHANGE_MARGIN_HOURS };
  const from = day.start.subtract(margin);
  const until = day.end.add(margin);
  return getClockChanges(timeZoneId, day.clockChangeWindow)
    .map((clockChange) => clockChange.instant)
    .filter(
      (instant) =>
        Temporal.Instant.compare(instant, from) >= 0 &&
        Temporal.Instant.compare(instant, until) < 0,
    );
}

let cachedDayKey: string | undefined;
let cachedStopsByZone = new Map<string, readonly DayPeriodStop[]>();

/** Memoized for one reference day and the default schedule; custom schedules are computed afresh. */
export function getDayPeriodStops(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
): readonly DayPeriodStop[] {
  const isDefaultSchedule = schedule === DAY_PERIOD_SCHEDULE;
  const dayKey = `${day.start.toString()}|${day.end.toString()}`;
  if (dayKey !== cachedDayKey) {
    cachedDayKey = dayKey;
    cachedStopsByZone = new Map();
  }
  const cached = isDefaultSchedule
    ? cachedStopsByZone.get(timeZoneId)
    : undefined;
  if (cached !== undefined) return cached;
  const transitions = getClockChangesAround(timeZoneId, day);
  const stops = assembleDayPeriodStops(
    collectBlendWindows(timeZoneId, day, schedule, transitions),
    collectOffsetEdges(timeZoneId, day, schedule, transitions),
    day,
  );
  if (isDefaultSchedule) cachedStopsByZone.set(timeZoneId, stops);
  return stops;
}
