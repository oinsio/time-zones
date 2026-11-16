import type { Coordinates } from "./coordinates";
import { getCoordinatesKey } from "./coordinates";
import type { DayPeriodBoundary } from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";
import { getSolarDay } from "./sun";
import { getSunSupport } from "./sunRegistry";

/**
 * The day-period boundaries of a reference day, widened by half a blend
 * window at each end so that a window centred on the edge is complete. One
 * memoized computation per coordinates and reference day: the track and the
 * hour cells both read it, so the sun is computed for at most 3 solar days.
 * Implements FR1, FR2, NFR-P1 of bind-day-periods-to-sun (D2).
 */

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
  const boundaries = getSunSupport().computeDayPeriodBoundaries(
    getSolarDay,
    coordinates,
    day,
  );
  cachedBoundariesByCoordinates.set(coordinatesKey, boundaries);
  return boundaries;
}
