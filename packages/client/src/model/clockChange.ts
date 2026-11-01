import { UTC_ZONE_ID } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { findOffsetTransitions } from "./dayPeriodWindows";
import type { ClockChangeWindow } from "./dayTrack";
import { getUtcOffsetMinutes } from "./utcOffset";

/**
 * Clock changes of a zone: every instant its UTC offset changes, with the
 * direction, the amount and the wall-clock time just before the change; and
 * the one nearest to an instant. The clock changes of a zone are searched once
 * per clock change window and shared with the day track colours.
 * Implements FR2, FR3, FR4, FR5, NFR-P1 of show-clock-change-note-on-location-cards (D2, D3).
 */

export enum ClockChangeDirection {
  FORWARD = "FORWARD",
  BACK = "BACK",
}

export enum ClockChangeTense {
  PAST = "PAST",
  FUTURE = "FUTURE",
}

export type ClockChange = {
  instant: Temporal.Instant;
  direction: ClockChangeDirection;
  amountMinutes: number;
  /** The clock of the zone just before the change: "03:00" of a change back. */
  wallClockTime: Temporal.PlainDateTime;
};

export type NearestClockChange = {
  clockChange: ClockChange;
  tense: ClockChangeTense;
};

const NO_CLOCK_CHANGES: readonly ClockChange[] = [];

function readClockChange(
  timeZoneId: string,
  instant: Temporal.Instant,
): ClockChange | undefined {
  const offsetBefore = getUtcOffsetMinutes(
    timeZoneId,
    instant.subtract({ nanoseconds: 1 }),
  );
  const offsetAfter = getUtcOffsetMinutes(timeZoneId, instant);
  if (offsetBefore === undefined || offsetAfter === undefined) return undefined;
  const difference = offsetAfter - offsetBefore;
  return {
    instant,
    direction:
      difference > 0 ? ClockChangeDirection.FORWARD : ClockChangeDirection.BACK,
    amountMinutes: Math.abs(difference),
    wallClockTime: instant
      .toZonedDateTimeISO(UTC_ZONE_ID)
      .toPlainDateTime()
      .add({ minutes: offsetBefore }),
  };
}

function searchClockChanges(
  timeZoneId: string,
  window: ClockChangeWindow,
): readonly ClockChange[] {
  try {
    return findOffsetTransitions(timeZoneId, window, 0).flatMap(
      (instant) => readClockChange(timeZoneId, instant) ?? NO_CLOCK_CHANGES,
    );
  } catch (e) {
    if (e instanceof RangeError) return NO_CLOCK_CHANGES;
    throw e;
  }
}

let cachedWindowKey: string | undefined;
let cachedClockChangesByZone = new Map<string, readonly ClockChange[]>();

/** Memoized for one window: a new window clears the cache. */
export function getClockChanges(
  timeZoneId: string,
  window: ClockChangeWindow,
): readonly ClockChange[] {
  const windowKey = `${window.start.toString()}|${window.end.toString()}`;
  if (windowKey !== cachedWindowKey) {
    cachedWindowKey = windowKey;
    cachedClockChangesByZone = new Map();
  }
  const cached = cachedClockChangesByZone.get(timeZoneId);
  if (cached !== undefined) return cached;
  const clockChanges = searchClockChanges(timeZoneId, window);
  cachedClockChangesByZone.set(timeZoneId, clockChanges);
  return clockChanges;
}

/**
 * The change nearest to the instant, the earlier one at equal distance, and
 * whether it is past (not after the instant) or future. Milliseconds, no BigInt.
 */
export function findNearestClockChange(
  clockChanges: readonly ClockChange[],
  instant: Temporal.Instant,
): NearestClockChange | undefined {
  let nearest: ClockChange | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const clockChange of clockChanges) {
    const distance = Math.abs(
      clockChange.instant.epochMilliseconds - instant.epochMilliseconds,
    );
    const isNearer =
      distance < nearestDistance ||
      (distance === nearestDistance &&
        nearest !== undefined &&
        Temporal.Instant.compare(clockChange.instant, nearest.instant) < 0);
    if (isNearer) {
      nearest = clockChange;
      nearestDistance = distance;
    }
  }
  if (nearest === undefined) return undefined;
  return {
    clockChange: nearest,
    tense:
      Temporal.Instant.compare(nearest.instant, instant) <= 0
        ? ClockChangeTense.PAST
        : ClockChangeTense.FUTURE,
  };
}
