import { Temporal } from "@/lib/temporal";

const UTC_DESIGNATOR = "Z";

/**
 * Parses the ISO 8601 instant text of a command; only the `Z` suffix is
 * accepted. Returns `undefined` for any other text.
 * Implements FR2 of add-grid-meeting-range-and-share (D1).
 */
export function parseCommandInstant(
  text: string,
): Temporal.Instant | undefined {
  if (!text.endsWith(UTC_DESIGNATOR)) return undefined;
  try {
    return Temporal.Instant.from(text);
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
}
