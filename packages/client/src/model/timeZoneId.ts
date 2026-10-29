import timeZoneAliases from "virtual:time-zone-aliases";
import { Temporal } from "@/lib/temporal";

const OFFSET_PREFIXES = ["+", "-", "−"];
const EPOCH_MILLISECONDS = 0;

/**
 * Canonical IANA identifier for a user or stored input, or `undefined` when
 * the input is not an IANA zone (an unknown name or a raw UTC offset).
 * Implements FR9 of add-locations-via-search, FR3 of support-legacy-ios-12-safari.
 */
export function canonicalizeTimeZoneId(input: string): string | undefined {
  if (OFFSET_PREFIXES.some((prefix) => input.startsWith(prefix))) {
    return undefined;
  }
  let normalizedId: string;
  try {
    normalizedId =
      Temporal.Instant.fromEpochMilliseconds(
        EPOCH_MILLISECONDS,
      ).toZonedDateTimeISO(input).timeZoneId;
  } catch {
    return undefined;
  }
  const canonicalId: unknown = timeZoneAliases[normalizedId];
  return typeof canonicalId === "string" ? canonicalId : normalizedId;
}
