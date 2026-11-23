import {
  MAX_UNIX_SECONDS,
  MILLISECONDS_PER_SECOND,
  NANOSECONDS_PER_MILLISECOND,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { UnixTimeUnit } from "./unixTimeUnit";

/**
 * An instant to the nanosecond as two safe integers, so no digit is lost on
 * an engine without BigInt (ADR-0009). `unixSeconds` is the floor of the Unix
 * time in seconds; `nanoseconds` is 0 to 999 999 999.
 * Implements FR8, NFR-P3, G4 of add-unix-time-converter-tool (D4).
 */
export type ExactInstant = { unixSeconds: number; nanoseconds: number };

/** Fraction digits that decide the precision: 0 seconds, 1-3 ms, 4-6 µs, 7-9 ns. */
const MILLISECOND_FRACTION_DIGITS = 3;
const MICROSECOND_FRACTION_DIGITS = 6;

/** The precision a fraction of this many digits has. Implements FR8 of add-unix-time-converter-tool (D4). */
export function getPrecisionOfFractionDigits(digitCount: number): UnixTimeUnit {
  if (digitCount <= 0) return UnixTimeUnit.SECONDS;
  if (digitCount <= MILLISECOND_FRACTION_DIGITS) {
    return UnixTimeUnit.MILLISECONDS;
  }
  if (digitCount <= MICROSECOND_FRACTION_DIGITS) {
    return UnixTimeUnit.MICROSECONDS;
  }
  return UnixTimeUnit.NANOSECONDS;
}

/**
 * Whether the instant is one `Temporal.Instant` can hold: the upper bound only
 * with no fraction past its last whole second.
 * Implements FR15 of add-unix-time-converter-tool (D4).
 */
export function isExactInstantInRange({
  unixSeconds,
  nanoseconds,
}: ExactInstant): boolean {
  if (unixSeconds < -MAX_UNIX_SECONDS) return false;
  if (unixSeconds < MAX_UNIX_SECONDS) return true;
  return unixSeconds === MAX_UNIX_SECONDS && nanoseconds === 0;
}

/**
 * The `Temporal.Instant` for zone math: the digits below the millisecond never
 * change a local time, so they are left out.
 * Implements FR9, FR10 of add-unix-time-converter-tool (D4).
 */
export function toInstant({
  unixSeconds,
  nanoseconds,
}: ExactInstant): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(
    unixSeconds * MILLISECONDS_PER_SECOND +
      Math.floor(nanoseconds / NANOSECONDS_PER_MILLISECOND),
  );
}

/**
 * An instant cut to the whole second towards the past: the live converter
 * moment and Now.
 * Implements FR14 of add-unix-time-converter-tool (D5).
 */
export function toWholeSecondExactInstant(
  instant: Temporal.Instant,
): ExactInstant {
  return {
    unixSeconds: Math.floor(
      instant.epochMilliseconds / MILLISECONDS_PER_SECOND,
    ),
    nanoseconds: 0,
  };
}
