import { DAY_PERIOD_BLEND_MINUTES, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { type Coordinates, getCoordinatesKey } from "./coordinates";
import type { DayPeriod, DayPeriodBoundary } from "./dayPeriods";
import { getSolarDayPeriods } from "./dayPeriodTransitions";
import type { ReferenceDay } from "./dayTrack";
import { getSolarDay } from "./sun";

/**
 * The day-period boundaries of a reference day, widened by half a blend
 * window at each end so that a window centred on the edge is complete. One
 * memoized computation per coordinates and reference day: the track and the
 * hour cells both read it, so the sun is computed for at most 3 solar days.
 * Implements FR1, FR2, NFR-P1 of bind-day-periods-to-sun (D2).
 */

const HALF_WINDOW_MILLISECONDS =
  (DAY_PERIOD_BLEND_MINUTES * MILLISECONDS_PER_MINUTE) / 2;

function computeBoundaries(
  coordinates: Coordinates,
  day: ReferenceDay,
): DayPeriodBoundary[] {
  const windowStart = day.start.epochMilliseconds - HALF_WINDOW_MILLISECONDS;
  const windowEnd = day.end.epochMilliseconds + HALF_WINDOW_MILLISECONDS;
  const boundaries: DayPeriodBoundary[] = [];
  let solarDay = getSolarDay(coordinates, windowStart);
  let current: DayPeriod | undefined;
  const change = (instant: number, to: DayPeriod) => {
    if (current !== undefined && current !== to) {
      if (instant >= windowStart && instant <= windowEnd) {
        boundaries.push({
          instant: Temporal.Instant.fromEpochMilliseconds(Math.round(instant)),
          from: current,
          to,
        });
      }
    }
    current = to;
  };
  while (true) {
    const { initial, transitions } = getSolarDayPeriods(solarDay);
    change(solarDay.solarMidnightBefore, initial);
    for (const transition of transitions)
      change(transition.instant, transition.to);
    if (solarDay.solarMidnightAfter > windowEnd) return boundaries;
    solarDay = getSolarDay(coordinates, solarDay.solarMidnightAfter);
  }
}

let cachedDayKey: string | undefined;
let cachedBoundariesByCoordinates = new Map<
  string,
  readonly DayPeriodBoundary[]
>();

/** The boundaries inside the reference day and half a blend window around it, in time order. */
export function getDayPeriodBoundaries(
  coordinates: Coordinates,
  day: ReferenceDay,
): readonly DayPeriodBoundary[] {
  const dayKey = `${day.start.epochMilliseconds}|${day.end.epochMilliseconds}`;
  if (dayKey !== cachedDayKey) {
    cachedDayKey = dayKey;
    cachedBoundariesByCoordinates = new Map();
  }
  const coordinatesKey = getCoordinatesKey(coordinates);
  const cached = cachedBoundariesByCoordinates.get(coordinatesKey);
  if (cached !== undefined) return cached;
  const boundaries = computeBoundaries(coordinates, day);
  cachedBoundariesByCoordinates.set(coordinatesKey, boundaries);
  return boundaries;
}
