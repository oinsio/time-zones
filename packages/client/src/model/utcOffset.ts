import { NANOSECONDS_PER_MINUTE } from "@/constants";
import type { Temporal } from "@/lib/temporal";

/**
 * UTC offset of an IANA time zone at an instant, in whole minutes; `undefined`
 * when the identifier is unknown to Temporal.
 * Implements FR2, FR6 of show-utc-offset-on-location-rows (D1).
 */
export function getUtcOffsetMinutes(
  timeZoneId: string,
  instant: Temporal.Instant,
): number | undefined {
  try {
    const { offsetNanoseconds } = instant.toZonedDateTimeISO(timeZoneId);
    return Math.trunc(offsetNanoseconds / NANOSECONDS_PER_MINUTE);
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
}
