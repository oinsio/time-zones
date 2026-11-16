import type { Coordinates } from "./coordinates";
import { getSunSupport } from "./sunRegistry";

/**
 * The sun at a place: the elevation of its centre and the solar day around an
 * instant. The calculation (NOAA equations, plain numbers in epoch
 * milliseconds; no `Date`, no BigInt, the time zone never enters) lives in
 * `sunCalculation.ts` and loads apart from the initial JavaScript, so this
 * module only names the types and forwards the calls.
 * Implements FR1, FR3, FR4, NFR-P2, NFR-R2 of bind-day-periods-to-sun (D1, D4).
 */

export enum SunThresholdState {
  /** The sun rises through the threshold and sets through it. */
  CROSSES = "CROSSES",
  STAYS_ABOVE = "STAYS_ABOVE",
  STAYS_BELOW = "STAYS_BELOW",
}

export type SunThreshold = {
  state: SunThresholdState;
  /** Instant the sun rises through the threshold; set only when it crosses. */
  rising?: number;
  /** Instant the sun sets through the threshold; set only when it crosses. */
  setting?: number;
};

export type SolarDay = {
  solarNoon: number;
  solarMidnightBefore: number;
  solarMidnightAfter: number;
  /** The −6° threshold. */
  night: SunThreshold;
  /** The +6° threshold. */
  day: SunThreshold;
};

/** The sun's elevation above the horizon in degrees, without refraction. */
export const getSunElevation = (
  coordinates: Coordinates,
  epochMilliseconds: number,
): number => getSunSupport().getSunElevation(coordinates, epochMilliseconds);

/**
 * The solar day around an instant: solar noon (the sun highest), the two
 * solar midnights (midway between consecutive noons) and the crossings of
 * the −6° and +6° thresholds. Neighbouring solar days share a midnight.
 */
export const getSolarDay = (
  coordinates: Coordinates,
  epochMilliseconds: number,
): SolarDay => getSunSupport().getSolarDay(coordinates, epochMilliseconds);
