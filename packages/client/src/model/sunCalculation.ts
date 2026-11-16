import {
  APPARENT_LONGITUDE_CORRECTION_DEGREES,
  APPARENT_LONGITUDE_OMEGA_DEGREES,
  ARC_MINUTES_PER_DEGREE,
  DAY_SUN_ELEVATION_DEGREES,
  DAYS_PER_JULIAN_CENTURY,
  DEGREES_PER_CIRCLE,
  DEGREES_PER_HALF_CIRCLE,
  ECCENTRICITY_COEFFICIENTS,
  EQUATION_OF_CENTRE_FIRST_COEFFICIENTS,
  EQUATION_OF_CENTRE_SECOND_COEFFICIENTS,
  EQUATION_OF_CENTRE_THIRD_COEFFICIENT,
  EQUATION_OF_TIME_ECCENTRICITY_FACTOR,
  EQUATION_OF_TIME_HALF_FACTOR,
  EQUATION_OF_TIME_QUARTER_FACTOR,
  J2000_JULIAN_DAY,
  MEAN_ANOMALY_COEFFICIENTS,
  MEAN_LONGITUDE_COEFFICIENTS,
  MEAN_OBLIQUITY_BASE_ARC_MINUTES,
  MEAN_OBLIQUITY_BASE_DEGREES,
  MEAN_OBLIQUITY_COEFFICIENTS,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
  MINUTES_AT_SOLAR_NOON_ON_ZERO_LONGITUDE,
  MINUTES_PER_DAY,
  MINUTES_PER_DEGREE_OF_HOUR_ANGLE,
  NIGHT_SUN_ELEVATION_DEGREES,
  OBLIQUITY_CORRECTION_DEGREES,
  OMEGA_COEFFICIENTS,
  SUN_CROSSING_REFINEMENT_ROUNDS,
  UNIX_EPOCH_JULIAN_DAY,
} from "@/constants";
import type { Coordinates } from "./coordinates";
import { type SolarDay, type SunThreshold, SunThresholdState } from "./sun";

/**
 * The calculation behind `sun.ts`: elevation of the sun's centre and the solar
 * day around an instant, by the NOAA solar calculator equations. It is loaded
 * apart from the initial JavaScript (`sunSupport.ts`). Plain numbers in epoch
 * milliseconds; no `Date`, no BigInt, the time zone never enters.
 * Implements FR1, FR3, FR4, NFR-P2, NFR-R2 of bind-day-periods-to-sun (D1).
 */

const toRadians = (degrees: number) =>
  (degrees * Math.PI) / DEGREES_PER_HALF_CIRCLE;
const toDegrees = (radians: number) =>
  (radians * DEGREES_PER_HALF_CIRCLE) / Math.PI;

/** Horner evaluation of `c0 + c1·x + c2·x² + …`. */
const evaluatePolynomial = (coefficients: readonly number[], x: number) =>
  coefficients.reduceRight((sum, coefficient) => coefficient + x * sum, 0);

type SunPosition = {
  declinationRadians: number;
  equationOfTimeMinutes: number;
};

function getSunPosition(epochMilliseconds: number): SunPosition {
  const julianDay =
    epochMilliseconds / MILLISECONDS_PER_DAY + UNIX_EPOCH_JULIAN_DAY;
  const centuries = (julianDay - J2000_JULIAN_DAY) / DAYS_PER_JULIAN_CENTURY;
  const meanLongitude = toRadians(
    evaluatePolynomial(MEAN_LONGITUDE_COEFFICIENTS, centuries) %
      DEGREES_PER_CIRCLE,
  );
  const meanAnomaly = toRadians(
    evaluatePolynomial(MEAN_ANOMALY_COEFFICIENTS, centuries),
  );
  const eccentricity = evaluatePolynomial(ECCENTRICITY_COEFFICIENTS, centuries);
  const centre =
    Math.sin(meanAnomaly) *
      evaluatePolynomial(EQUATION_OF_CENTRE_FIRST_COEFFICIENTS, centuries) +
    Math.sin(2 * meanAnomaly) *
      evaluatePolynomial(EQUATION_OF_CENTRE_SECOND_COEFFICIENTS, centuries) +
    Math.sin(3 * meanAnomaly) * EQUATION_OF_CENTRE_THIRD_COEFFICIENT;
  const omega = toRadians(evaluatePolynomial(OMEGA_COEFFICIENTS, centuries));
  const apparentLongitude =
    toDegrees(meanLongitude) +
    centre -
    APPARENT_LONGITUDE_CORRECTION_DEGREES -
    APPARENT_LONGITUDE_OMEGA_DEGREES * Math.sin(omega);
  const obliquity =
    MEAN_OBLIQUITY_BASE_DEGREES +
    (MEAN_OBLIQUITY_BASE_ARC_MINUTES +
      evaluatePolynomial(MEAN_OBLIQUITY_COEFFICIENTS, centuries) /
        ARC_MINUTES_PER_DEGREE) /
      ARC_MINUTES_PER_DEGREE +
    OBLIQUITY_CORRECTION_DEGREES * Math.cos(omega);
  const obliquityRadians = toRadians(obliquity);
  const declinationRadians = Math.asin(
    Math.sin(obliquityRadians) * Math.sin(toRadians(apparentLongitude)),
  );
  const halfObliquityTangent = Math.tan(obliquityRadians / 2) ** 2;
  const equationOfTimeRadians =
    halfObliquityTangent * Math.sin(2 * meanLongitude) -
    2 * eccentricity * Math.sin(meanAnomaly) +
    EQUATION_OF_TIME_ECCENTRICITY_FACTOR *
      eccentricity *
      halfObliquityTangent *
      Math.sin(meanAnomaly) *
      Math.cos(2 * meanLongitude) -
    EQUATION_OF_TIME_HALF_FACTOR *
      halfObliquityTangent ** 2 *
      Math.sin(4 * meanLongitude) -
    EQUATION_OF_TIME_QUARTER_FACTOR *
      eccentricity ** 2 *
      Math.sin(2 * meanAnomaly);
  return {
    declinationRadians,
    equationOfTimeMinutes:
      toDegrees(equationOfTimeRadians) * MINUTES_PER_DEGREE_OF_HOUR_ANGLE,
  };
}

/** The sun's elevation above the horizon in degrees, without refraction. */
export function getSunElevation(
  coordinates: Coordinates,
  epochMilliseconds: number,
): number {
  const { declinationRadians, equationOfTimeMinutes } =
    getSunPosition(epochMilliseconds);
  const utcMinutes =
    (((epochMilliseconds % MILLISECONDS_PER_DAY) + MILLISECONDS_PER_DAY) %
      MILLISECONDS_PER_DAY) /
    MILLISECONDS_PER_MINUTE;
  const solarMinutes =
    ((utcMinutes + equationOfTimeMinutes) % MINUTES_PER_DAY) +
    MINUTES_PER_DEGREE_OF_HOUR_ANGLE * coordinates.longitude;
  const hourAngle = toRadians(
    solarMinutes / MINUTES_PER_DEGREE_OF_HOUR_ANGLE - DEGREES_PER_HALF_CIRCLE,
  );
  const latitude = toRadians(coordinates.latitude);
  return toDegrees(
    Math.asin(
      Math.sin(latitude) * Math.sin(declinationRadians) +
        Math.cos(latitude) * Math.cos(declinationRadians) * Math.cos(hourAngle),
    ),
  );
}

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
    (getSolarNoon(number - 1, longitude) + getSolarNoon(number, longitude)) / 2,
    (getSolarNoon(number, longitude) + getSolarNoon(number + 1, longitude)) / 2,
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
