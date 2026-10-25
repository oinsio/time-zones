import type { Temporal } from "@/lib/temporal";

/** How a wall-clock time maps to instants in a zone (ADR-0003). */
export enum WallClockStatus {
  UNIQUE = "UNIQUE",
  GAP = "GAP",
  AMBIGUOUS = "AMBIGUOUS",
}

export type ResolvedWallClock = {
  instant: Temporal.Instant;
  status: WallClockStatus;
};

const COMPATIBLE = { disambiguation: "compatible" } as const;
const EARLIER = { disambiguation: "earlier" } as const;
const LATER = { disambiguation: "later" } as const;

/**
 * Converts a wall-clock time of an IANA zone to an instant with the
 * `compatible` disambiguation and classifies the input.
 * Implements FR4 of select-date-with-calendar-and-now (D2).
 * @throws RangeError beyond the range Temporal supports.
 */
export function resolveWallClock(
  timeZoneId: string,
  plainDateTime: Temporal.PlainDateTime,
): ResolvedWallClock {
  const instant = plainDateTime
    .toZonedDateTime(timeZoneId, COMPATIBLE)
    .toInstant();
  const earlier = plainDateTime.toZonedDateTime(timeZoneId, EARLIER);
  const later = plainDateTime.toZonedDateTime(timeZoneId, LATER);
  if (earlier.toInstant().equals(later.toInstant())) {
    return { instant, status: WallClockStatus.UNIQUE };
  }
  const isOverlap = earlier.toPlainDateTime().equals(plainDateTime);
  return {
    instant,
    status: isOverlap ? WallClockStatus.AMBIGUOUS : WallClockStatus.GAP,
  };
}
