import {
  DAY_SUN_ELEVATION_DEGREES,
  NIGHT_SUN_ELEVATION_DEGREES,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { Coordinates } from "./coordinates";
import { getSolarDay, getSunElevation } from "./sun";

/**
 * Day periods of a location, decided by the sun's elevation at its
 * coordinates: night below −6°, day from +6°, between them morning until
 * solar noon and evening after it. The boundaries are in
 * `dayPeriodBoundaries.ts`.
 * Implements FR1, FR2, FR9 of bind-day-periods-to-sun (D2, D7).
 */

export enum DayPeriod {
  NIGHT = "NIGHT",
  MORNING = "MORNING",
  DAY = "DAY",
  EVENING = "EVENING",
}

/** An instant at which a location's day period changes. */
export type DayPeriodBoundary = {
  instant: Temporal.Instant;
  from: DayPeriod;
  to: DayPeriod;
};

/** The day period at an instant; the polar cases need no branch. */
export function getDayPeriodAt(
  coordinates: Coordinates,
  epochMilliseconds: number,
): DayPeriod {
  const elevation = getSunElevation(coordinates, epochMilliseconds);
  if (elevation < NIGHT_SUN_ELEVATION_DEGREES) return DayPeriod.NIGHT;
  if (elevation >= DAY_SUN_ELEVATION_DEGREES) return DayPeriod.DAY;
  return epochMilliseconds <
    getSolarDay(coordinates, epochMilliseconds).solarNoon
    ? DayPeriod.MORNING
    : DayPeriod.EVENING;
}
