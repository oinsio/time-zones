import {
  UNIX_TIME_MICROSECONDS_MAX_DIGITS,
  UNIX_TIME_MILLISECONDS_MAX_DIGITS,
  UNIX_TIME_SECONDS_MAX_DIGITS,
} from "@/constants";

/**
 * The unit a Unix time is counted in since 1970.
 * Implements FR7 of add-unix-time-converter-tool (D4).
 */
export enum UnixTimeUnit {
  SECONDS = "SECONDS",
  MILLISECONDS = "MILLISECONDS",
  MICROSECONDS = "MICROSECONDS",
  NANOSECONDS = "NANOSECONDS",
}

/** The unit the user asks for: Auto reads a whole number by its digit count. */
export enum UnixTimeUnitChoice {
  AUTO = "AUTO",
  SECONDS = "SECONDS",
  MILLISECONDS = "MILLISECONDS",
  MICROSECONDS = "MICROSECONDS",
  NANOSECONDS = "NANOSECONDS",
}

/** Fraction digits of a second that a whole number of the unit carries. */
export const UNIX_TIME_UNIT_FRACTION_DIGITS: Record<UnixTimeUnit, number> = {
  [UnixTimeUnit.SECONDS]: 0,
  [UnixTimeUnit.MILLISECONDS]: 3,
  [UnixTimeUnit.MICROSECONDS]: 6,
  [UnixTimeUnit.NANOSECONDS]: 9,
};

/** The units from the coarsest to the finest. */
export const UNIX_TIME_UNITS_BY_PRECISION: readonly UnixTimeUnit[] = [
  UnixTimeUnit.SECONDS,
  UnixTimeUnit.MILLISECONDS,
  UnixTimeUnit.MICROSECONDS,
  UnixTimeUnit.NANOSECONDS,
];

/** The unit of a fixed choice; Auto has none until a digit count decides. */
export function getFixedUnit(
  choice: UnixTimeUnitChoice,
): UnixTimeUnit | undefined {
  return choice === UnixTimeUnitChoice.AUTO
    ? undefined
    : (choice as string as UnixTimeUnit);
}

/**
 * The unit Auto reads a whole number in, by the digit count without the sign.
 * Implements FR7 of add-unix-time-converter-tool (D4).
 */
export function detectUnixTimeUnit(digitCount: number): UnixTimeUnit {
  if (digitCount <= UNIX_TIME_SECONDS_MAX_DIGITS) return UnixTimeUnit.SECONDS;
  if (digitCount <= UNIX_TIME_MILLISECONDS_MAX_DIGITS) {
    return UnixTimeUnit.MILLISECONDS;
  }
  if (digitCount <= UNIX_TIME_MICROSECONDS_MAX_DIGITS) {
    return UnixTimeUnit.MICROSECONDS;
  }
  return UnixTimeUnit.NANOSECONDS;
}
