import type { Coordinates } from "./coordinates";
import type { SolarDayReader } from "./dayPeriodBoundaryCalculation";
import type { DayPeriodBoundary } from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";
import type { SolarDay } from "./sun";

/**
 * What the lazily loaded chunk of the sun provides: the calculation and the
 * zone coordinates. They stay out of the initial JavaScript (NFR-P2): the app
 * loads them before its first render, from the precached chunk, so a track is
 * coloured on the first paint with no wait for the search data.
 * Implements FR3, FR7, NFR-P2 of bind-day-periods-to-sun (D4).
 */
export type SunSupport = {
  getSunElevation: (
    coordinates: Coordinates,
    epochMilliseconds: number,
  ) => number;
  getSolarDay: (
    coordinates: Coordinates,
    epochMilliseconds: number,
  ) => SolarDay;
  computeDayPeriodBoundaries: (
    getSolarDay: SolarDayReader,
    coordinates: Coordinates,
    day: ReferenceDay,
  ) => DayPeriodBoundary[];
  /** Zone ID → latitude and longitude in integer tenths of a degree. */
  zoneCoordinates: Readonly<Record<string, readonly [number, number]>>;
};

export const SUN_SUPPORT_MISSING_MESSAGE = "Sun support is not loaded";

let loadedSunSupport: SunSupport | undefined;

export function registerSunSupport(sunSupport: SunSupport): void {
  loadedSunSupport = sunSupport;
}

export function getSunSupport(): SunSupport {
  if (loadedSunSupport === undefined) {
    throw new Error(SUN_SUPPORT_MISSING_MESSAGE);
  }
  return loadedSunSupport;
}

/** Loads the chunk of the sun and registers it; resolves once the day periods can be computed. */
export async function loadSunSupport(): Promise<void> {
  registerSunSupport(await import("./sunSupport"));
}
