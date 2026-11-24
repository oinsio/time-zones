import { MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";

/**
 * The start of the minute an instant falls in: the seconds and the fraction
 * are dropped, also before 1970.
 * Implements FR16 of add-unix-time-converter-tool (D11).
 */
export function getMinuteStart(instant: Temporal.Instant): Temporal.Instant {
  const { epochMilliseconds } = instant;
  const millisecondsIntoMinute =
    ((epochMilliseconds % MILLISECONDS_PER_MINUTE) + MILLISECONDS_PER_MINUTE) %
    MILLISECONDS_PER_MINUTE;
  return Temporal.Instant.fromEpochMilliseconds(
    epochMilliseconds - millisecondsIntoMinute,
  );
}
