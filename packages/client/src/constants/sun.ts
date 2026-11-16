/**
 * Coefficients of the NOAA solar calculator (Meeus) and the day-period
 * thresholds of the sun's elevation.
 * Implements FR1, FR3, FR4 of bind-day-periods-to-sun (D1).
 */
export const NIGHT_SUN_ELEVATION_DEGREES = -6;
export const DAY_SUN_ELEVATION_DEGREES = 6;

export const MILLISECONDS_PER_DAY = 86_400_000;
export const UNIX_EPOCH_JULIAN_DAY = 2_440_587.5;
export const J2000_JULIAN_DAY = 2_451_545;
export const DAYS_PER_JULIAN_CENTURY = 36_525;
export const DEGREES_PER_CIRCLE = 360;
export const DEGREES_PER_HALF_CIRCLE = 180;
export const MINUTES_PER_DAY = 1440;
export const MINUTES_AT_SOLAR_NOON_ON_ZERO_LONGITUDE = 720;
/** The sun moves one degree of hour angle in four minutes. */
export const MINUTES_PER_DEGREE_OF_HOUR_ANGLE = 4;
/** Fixed-point rounds that refine a crossing with the declination at that instant. */
export const SUN_CROSSING_REFINEMENT_ROUNDS = 2;

export const MEAN_LONGITUDE_COEFFICIENTS = [
  280.46646, 36_000.76983, 0.0003032,
] as const;
export const MEAN_ANOMALY_COEFFICIENTS = [
  357.52911, 35_999.05029, -0.0001537,
] as const;
export const ECCENTRICITY_COEFFICIENTS = [
  0.016708634, -0.000042037, -0.0000001267,
] as const;
export const EQUATION_OF_CENTRE_FIRST_COEFFICIENTS = [
  1.914602, -0.004817, -0.000014,
] as const;
export const EQUATION_OF_CENTRE_SECOND_COEFFICIENTS = [
  0.019993, -0.000101,
] as const;
export const EQUATION_OF_CENTRE_THIRD_COEFFICIENT = 0.000289;
export const MEAN_OBLIQUITY_COEFFICIENTS = [
  21.448, -46.815, -0.00059, 0.001813,
] as const;
export const MEAN_OBLIQUITY_BASE_DEGREES = 23;
export const MEAN_OBLIQUITY_BASE_ARC_MINUTES = 26;
export const ARC_MINUTES_PER_DEGREE = 60;
export const OBLIQUITY_CORRECTION_DEGREES = 0.00256;
export const OMEGA_COEFFICIENTS = [125.04, -1934.136] as const;
export const APPARENT_LONGITUDE_CORRECTION_DEGREES = 0.00569;
export const APPARENT_LONGITUDE_OMEGA_DEGREES = 0.00478;
export const EQUATION_OF_TIME_ECCENTRICITY_FACTOR = 4;
export const EQUATION_OF_TIME_HALF_FACTOR = 0.5;
export const EQUATION_OF_TIME_QUARTER_FACTOR = 1.25;
