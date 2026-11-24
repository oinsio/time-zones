import {
  MAX_UNIX_TIME_FRACTION_DIGITS,
  MILLISECONDS_PER_SECOND,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getPrecisionOfFractionDigits,
  isExactInstantInRange,
} from "./exactInstant";
import {
  outOfRangeMoment,
  type ParseMomentResult,
  unreadableMoment,
} from "./parseUnixTimeText";

/** A year every month and day of which exists but February 29 of non-leap years; swapped in to tell a bad date from a date out of range. */
const PROBE_YEAR = "2000";

/** Date, time, 1-9 fraction digits and `Z` or an offset: all required but the fraction. */
const ISO_INSTANT_PATTERN =
  /^([+-]?\d{4,6})(-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

/** The base of the unix seconds the fraction digits add to, in seconds. */
function readWholeSeconds(isoText: string): number | undefined {
  try {
    return Math.floor(
      Temporal.Instant.from(isoText).epochMilliseconds /
        MILLISECONDS_PER_SECOND,
    );
  } catch {
    return undefined;
  }
}

/**
 * Reads an ISO 8601 date and time with `Z` or a UTC offset and up to 9
 * fraction digits; the precision is the fraction's.
 * Implements FR6, FR8, FR15 of add-unix-time-converter-tool (D4).
 */
export function parseIsoInstantText(text: string): ParseMomentResult {
  const match = ISO_INSTANT_PATTERN.exec(text.trim());
  if (match === null) return unreadableMoment;
  const [, year, restOfDateTime, fractionDigits = "", offset] = match;
  const unixSeconds = readWholeSeconds(`${year}${restOfDateTime}${offset}`);
  if (unixSeconds === undefined) {
    // A well-formed date that the instant cannot hold is out of range.
    return readWholeSeconds(`${PROBE_YEAR}${restOfDateTime}${offset}`) ===
      undefined
      ? unreadableMoment
      : outOfRangeMoment;
  }
  const instant = {
    unixSeconds,
    nanoseconds: Number(
      fractionDigits.padEnd(MAX_UNIX_TIME_FRACTION_DIGITS, "0"),
    ),
  };
  return isExactInstantInRange(instant)
    ? {
        ok: true,
        instant,
        precision: getPrecisionOfFractionDigits(fractionDigits.length),
      }
    : outOfRangeMoment;
}
