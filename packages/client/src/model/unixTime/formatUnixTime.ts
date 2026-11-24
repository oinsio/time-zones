import {
  DECIMAL_BASE,
  MAX_UNIX_TIME_FRACTION_DIGITS,
  MILLISECONDS_PER_SECOND,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { ExactInstant } from "./exactInstant";
import {
  UNIX_TIME_UNIT_FRACTION_DIGITS,
  type UnixTimeUnit,
} from "./unixTimeUnit";

/** The digits of `whole` followed by `fraction` written in `digitCount` digits; no leading zeros. */
function joinDigits(whole: number, fraction: number, digitCount: number) {
  return whole === 0
    ? String(fraction)
    : `${whole}${String(fraction).padStart(digitCount, "0")}`;
}

/**
 * The Unix time in a unit as digits. A unit coarser than the instant drops the
 * finer digits towards the past; a finer unit adds zeros. Digits are joined as
 * text, so no value passes the safe integer range.
 * Implements FR8, FR12 of add-unix-time-converter-tool (D4).
 */
export function formatUnixTime(
  { unixSeconds, nanoseconds }: ExactInstant,
  unit: UnixTimeUnit,
): string {
  const digitCount = UNIX_TIME_UNIT_FRACTION_DIGITS[unit];
  if (digitCount === 0) return String(unixSeconds);
  const unitFraction = Math.floor(
    nanoseconds / DECIMAL_BASE ** (MAX_UNIX_TIME_FRACTION_DIGITS - digitCount),
  );
  if (unixSeconds >= 0)
    return joinDigits(unixSeconds, unitFraction, digitCount);
  const magnitude = -unixSeconds;
  return unitFraction === 0
    ? `-${joinDigits(magnitude, 0, digitCount)}`
    : `-${joinDigits(magnitude - 1, DECIMAL_BASE ** digitCount - unitFraction, digitCount)}`;
}

/**
 * ISO 8601 with `Z` and the fraction digits of the precision; a year after
 * 9999 is written with a sign and six digits, as `Temporal.Instant` writes it.
 * Implements FR8, FR12 of add-unix-time-converter-tool (D4).
 */
export function formatExactIsoInstant(
  { unixSeconds, nanoseconds }: ExactInstant,
  precision: UnixTimeUnit,
): string {
  const wholeSecond = Temporal.Instant.fromEpochMilliseconds(
    unixSeconds * MILLISECONDS_PER_SECOND,
  ).toString({ smallestUnit: "second" });
  const digitCount = UNIX_TIME_UNIT_FRACTION_DIGITS[precision];
  if (digitCount === 0) return wholeSecond;
  const fraction = String(nanoseconds)
    .padStart(MAX_UNIX_TIME_FRACTION_DIGITS, "0")
    .slice(0, digitCount);
  return `${wholeSecond.slice(0, -1)}.${fraction}Z`;
}
