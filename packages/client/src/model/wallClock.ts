import {
  MAX_WALL_TIME_HOUR,
  MAX_WALL_TIME_MINUTE,
  WALL_TIME_COMMAND_PATTERN,
} from "@/constants";
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

/**
 * Whether the text is a canonical 24-hour `HH:MM` wall-clock time.
 * Implements FR5 of fix-grid-meeting-range-lock-and-layering (D2).
 */
export function isCanonicalWallTime(time: string): boolean {
  const groups = WALL_TIME_COMMAND_PATTERN.exec(time)?.groups;
  return (
    groups !== undefined &&
    Number(groups.hour) <= MAX_WALL_TIME_HOUR &&
    Number(groups.minute) <= MAX_WALL_TIME_MINUTE
  );
}
