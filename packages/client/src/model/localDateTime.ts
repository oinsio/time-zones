import type { Temporal } from "@/lib/temporal";

/**
 * Wall-clock date and time of an IANA time zone at an instant; `undefined`
 * when the identifier is unknown to Temporal.
 * Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D1).
 */
export function getLocalDateTime(
  timeZoneId: string,
  instant: Temporal.Instant,
): Temporal.ZonedDateTime | undefined {
  try {
    return instant.toZonedDateTimeISO(timeZoneId);
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
}
