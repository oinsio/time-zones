import { MILLISECONDS_PER_MINUTE } from "@/constants";
import type { Temporal } from "@/lib/temporal";

/**
 * Milliseconds from an instant to the next minute boundary; a full minute when
 * the instant is exactly on a boundary.
 * Implements FR3 of show-local-time-and-date-on-location-cards (D4).
 */
export function getMillisecondsUntilNextMinute(
  instant: Temporal.Instant,
): number {
  return (
    MILLISECONDS_PER_MINUTE -
    (instant.epochMilliseconds % MILLISECONDS_PER_MINUTE)
  );
}
