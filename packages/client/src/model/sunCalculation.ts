import {
  DAY_SUN_ELEVATION_DEGREES,
  MILLISECONDS_PER_MINUTE,
  MINUTES_AT_SOLAR_NOON_ON_ZERO_LONGITUDE,
  MINUTES_PER_DEGREE_OF_HOUR_ANGLE,
  NIGHT_SUN_ELEVATION_DEGREES,
  SUN_CROSSING_REFINEMENT_ROUNDS,
  TWO_NOONS_MIDPOINT_DIVISOR,
} from "@/constants";
import { MILLISECONDS_PER_DAY } from "@/lib/zoneRules/core";
import type { Coordinates } from "./coordinates";
import { type SolarDay, type SunThreshold, SunThresholdState } from "./sun";
import { getSunPosition, toDegrees, toRadians } from "./sunPosition";

/**
 * The calculation behind `sun.ts`, part two: the solar day around an instant
 * and the crossings of the day-period elevations, on top of `sunPosition.ts`.
 * Loaded apart from the initial JavaScript (`sunSupport.ts`).
 * Implements FR3, FR4, NFR-P2, NFR-R2 of bind-day-periods-to-sun (D1).
 */

const getNoonOfDay = (
  dayNumber: number,
  longitude: number,
  positionAt: number,
) =>
  dayNumber * MILLISECONDS_PER_DAY +
  (MINUTES_AT_SOLAR_NOON_ON_ZERO_LONGITUDE -
    MINUTES_PER_DEGREE_OF_HOUR_ANGLE * longitude -
    getSunPosition(positionAt).equationOfTimeMinutes) *
    MILLISECONDS_PER_MINUTE;

/** The solar noon of the day number, refined once with the equation of time at noon. */
const getSolarNoon = (dayNumber: number, longitude: number) =>
  getNoonOfDay(
    dayNumber,
    longitude,
    getNoonOfDay(dayNumber, longitude, dayNumber * MILLISECONDS_PER_DAY),
  );

const getHourAngleSpan = (hourAngleDegrees: number) =>
  hourAngleDegrees * MINUTES_PER_DEGREE_OF_HOUR_ANGLE * MILLISECONDS_PER_MINUTE;

/** The hour angle in degrees of an elevation, or the state when the sun never reaches it. */
function getHourAngleOf(
  elevationDegrees: number,
  latitudeRadians: number,
  declinationRadians: number,
): number | SunThresholdState {
  const cosine =
    (Math.sin(toRadians(elevationDegrees)) -
      Math.sin(latitudeRadians) * Math.sin(declinationRadians)) /
    (Math.cos(latitudeRadians) * Math.cos(declinationRadians));
  if (cosine > 1) return SunThresholdState.STAYS_BELOW;
  if (cosine < -1) return SunThresholdState.STAYS_ABOVE;
  return toDegrees(Math.acos(cosine));
}

type CrossingContext = {
  elevationDegrees: number;
  latitudeRadians: number;
  longitude: number;
  dayNumber: number;
};

/** A crossing instant refined with the sun's position at the previous estimate. */
function refineCrossing(
  context: CrossingContext,
  side: number,
  firstEstimate: number,
): number {
  let estimate = firstEstimate;
  for (let round = 0; round < SUN_CROSSING_REFINEMENT_ROUNDS; round += 1) {
    const hourAngle = getHourAngleOf(
      context.elevationDegrees,
      context.latitudeRadians,
      getSunPosition(estimate).declinationRadians,
    );
    if (typeof hourAngle !== "number") break;
    estimate =
      getNoonOfDay(context.dayNumber, context.longitude, estimate) +
      side * getHourAngleSpan(hourAngle);
  }
  return estimate;
}

function getThreshold(
  elevationDegrees: number,
  dayNumber: number,
  coordinates: Coordinates,
  solarNoon: number,
): SunThreshold {
  const latitudeRadians = toRadians(coordinates.latitude);
  const hourAngle = getHourAngleOf(
    elevationDegrees,
    latitudeRadians,
    getSunPosition(solarNoon).declinationRadians,
  );
  if (typeof hourAngle !== "number") return { state: hourAngle };
  const context = {
    elevationDegrees,
    latitudeRadians,
    longitude: coordinates.longitude,
    dayNumber,
  };
  const span = getHourAngleSpan(hourAngle);
  return {
    state: SunThresholdState.CROSSES,
    rising: refineCrossing(context, -1, solarNoon - span),
    setting: refineCrossing(context, 1, solarNoon + span),
  };
}

/**
 * The solar day around an instant: solar noon (the sun highest), the two
 * solar midnights (midway between consecutive noons) and the crossings of
 * the −6° and +6° thresholds. Neighbouring solar days share a midnight.
 */
export function getSolarDay(
  coordinates: Coordinates,
  epochMilliseconds: number,
): SolarDay {
  const { longitude } = coordinates;
  const noonOffset =
    (MINUTES_AT_SOLAR_NOON_ON_ZERO_LONGITUDE -
      MINUTES_PER_DEGREE_OF_HOUR_ANGLE * longitude) *
    MILLISECONDS_PER_MINUTE;
  let dayNumber = Math.round(
    (epochMilliseconds - noonOffset) / MILLISECONDS_PER_DAY,
  );
  const getMidnights = (number: number) => [
    (getSolarNoon(number - 1, longitude) + getSolarNoon(number, longitude)) /
      TWO_NOONS_MIDPOINT_DIVISOR,
    (getSolarNoon(number, longitude) + getSolarNoon(number + 1, longitude)) /
      TWO_NOONS_MIDPOINT_DIVISOR,
  ];
  let [solarMidnightBefore, solarMidnightAfter] = getMidnights(dayNumber);
  if (epochMilliseconds < solarMidnightBefore) {
    dayNumber -= 1;
    [solarMidnightBefore, solarMidnightAfter] = getMidnights(dayNumber);
  } else if (epochMilliseconds >= solarMidnightAfter) {
    dayNumber += 1;
    [solarMidnightBefore, solarMidnightAfter] = getMidnights(dayNumber);
  }
  const solarNoon = getSolarNoon(dayNumber, longitude);
  return {
    solarNoon,
    solarMidnightBefore,
    solarMidnightAfter,
    night: getThreshold(
      NIGHT_SUN_ELEVATION_DEGREES,
      dayNumber,
      coordinates,
      solarNoon,
    ),
    day: getThreshold(
      DAY_SUN_ELEVATION_DEGREES,
      dayNumber,
      coordinates,
      solarNoon,
    ),
  };
}
