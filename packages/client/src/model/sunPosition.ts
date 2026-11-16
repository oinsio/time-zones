import {
  APPARENT_LONGITUDE_CORRECTION_DEGREES,
  APPARENT_LONGITUDE_OMEGA_DEGREES,
  ARC_MINUTES_PER_DEGREE,
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
  FOURTH_HARMONIC,
  HALF_ANGLE_DIVISOR,
  J2000_JULIAN_DAY,
  MEAN_ANOMALY_COEFFICIENTS,
  MEAN_LONGITUDE_COEFFICIENTS,
  MEAN_OBLIQUITY_BASE_ARC_MINUTES,
  MEAN_OBLIQUITY_BASE_DEGREES,
  MEAN_OBLIQUITY_COEFFICIENTS,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_DAY,
  MINUTES_PER_DEGREE_OF_HOUR_ANGLE,
  OBLIQUITY_CORRECTION_DEGREES,
  OMEGA_COEFFICIENTS,
  SECOND_HARMONIC,
  THIRD_HARMONIC,
  UNIX_EPOCH_JULIAN_DAY,
} from "@/constants";
import { MILLISECONDS_PER_DAY } from "@/lib/zoneRules/core";
import type { Coordinates } from "./coordinates";

/**
 * The calculation behind `sun.ts`, part one: the sun's position and the
 * elevation of its centre, by the NOAA solar calculator equations. Part two, the
 * solar day, is `sunCalculation.ts`. Both load apart from the initial
 * JavaScript (`sunSupport.ts`). Plain numbers in epoch milliseconds; no `Date`,
 * no BigInt, the time zone never enters.
 * Implements FR1, NFR-P2, NFR-R2 of bind-day-periods-to-sun (D1).
 */

export const toRadians = (degrees: number) =>
  (degrees * Math.PI) / DEGREES_PER_HALF_CIRCLE;
export const toDegrees = (radians: number) =>
  (radians * DEGREES_PER_HALF_CIRCLE) / Math.PI;

/** Horner evaluation of `c0 + c1·x + c2·x² + …`. */
const evaluatePolynomial = (coefficients: readonly number[], x: number) =>
  coefficients.reduceRight((sum, coefficient) => coefficient + x * sum, 0);

export type SunPosition = {
  declinationRadians: number;
  equationOfTimeMinutes: number;
};

export function getSunPosition(epochMilliseconds: number): SunPosition {
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
    Math.sin(SECOND_HARMONIC * meanAnomaly) *
      evaluatePolynomial(EQUATION_OF_CENTRE_SECOND_COEFFICIENTS, centuries) +
    Math.sin(THIRD_HARMONIC * meanAnomaly) *
      EQUATION_OF_CENTRE_THIRD_COEFFICIENT;
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
  const halfObliquityTangent =
    Math.tan(obliquityRadians / HALF_ANGLE_DIVISOR) ** 2;
  const equationOfTimeRadians =
    halfObliquityTangent * Math.sin(SECOND_HARMONIC * meanLongitude) -
    SECOND_HARMONIC * eccentricity * Math.sin(meanAnomaly) +
    EQUATION_OF_TIME_ECCENTRICITY_FACTOR *
      eccentricity *
      halfObliquityTangent *
      Math.sin(meanAnomaly) *
      Math.cos(SECOND_HARMONIC * meanLongitude) -
    EQUATION_OF_TIME_HALF_FACTOR *
      halfObliquityTangent ** 2 *
      Math.sin(FOURTH_HARMONIC * meanLongitude) -
    EQUATION_OF_TIME_QUARTER_FACTOR *
      eccentricity ** 2 *
      Math.sin(SECOND_HARMONIC * meanAnomaly);
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
