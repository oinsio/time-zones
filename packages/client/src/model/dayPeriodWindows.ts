import {
  NANOSECONDS_PER_MILLISECOND,
  NANOSECONDS_PER_MINUTE,
  OFFSET_CHANGE_MARGIN_HOURS,
  UTC_ZONE_ID,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  DAY_PERIOD_SCHEDULE,
  type DayPeriod,
  type DayPeriodBoundary,
  getDayPeriod,
} from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";

/**
 * Where the day periods of a zone change inside a reference day: blend
 * windows around the schedule boundaries and hard edges at offset changes.
 * Reads time zone rules; the stops are assembled from these in
 * `dayPeriodStops.ts`.
 * Implements FR6, NFR-P2 of add-time-sliders-to-location-cards (D4).
 */

export type BlendWindow = {
  start: Temporal.Instant;
  end: Temporal.Instant;
  from: DayPeriod;
  to: DayPeriod;
};

export type OffsetEdge = {
  instant: Temporal.Instant;
  before: DayPeriod;
  after: DayPeriod;
};

const HALF = 2;

/** Offset changes from just before the day to just after it, in order. */
export function findOffsetTransitions(
  timeZoneId: string,
  day: ReferenceDay,
): Temporal.Instant[] {
  const margin = { hours: OFFSET_CHANGE_MARGIN_HOURS };
  const limit = day.end.add(margin);
  const transitions: Temporal.Instant[] = [];
  let transition = day.start
    .subtract(margin)
    .toZonedDateTimeISO(timeZoneId)
    .getTimeZoneTransition("next");
  while (
    transition !== null &&
    Temporal.Instant.compare(transition.toInstant(), limit) <= 0
  ) {
    transitions.push(transition.toInstant());
    transition = transition.getTimeZoneTransition("next");
  }
  return transitions;
}

/**
 * Blend windows around the boundaries inside the day. A boundary whose wall
 * time is skipped by a gap is left out; one repeated by an overlap uses its
 * earlier occurrence. Without an offset change near the day, the boundary
 * instants are plain arithmetic on the day's offset.
 * Implements FR3 of support-legacy-ios-12-safari (milliseconds, no BigInt).
 */
export function collectBlendWindows(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
  transitions: readonly Temporal.Instant[] = findOffsetTransitions(
    timeZoneId,
    day,
  ),
): BlendWindow[] {
  const localStart = day.start.toZonedDateTimeISO(timeZoneId);
  const localEnd = day.end.toZonedDateTimeISO(timeZoneId);
  const hasFixedOffset = transitions.length === 0;
  const margin = { hours: OFFSET_CHANGE_MARGIN_HOURS };
  const earliestWanted = localStart.toPlainDateTime().subtract(margin);
  const latestWanted = localEnd.toPlainDateTime().add(margin);
  const firstDate = localStart.toPlainDate().subtract({ days: 1 });
  const lastDate = localEnd.toPlainDate();
  const boundaryTimes = schedule.map((boundary) =>
    Temporal.PlainTime.from(boundary.wallTime),
  );
  const windows: BlendWindow[] = [];
  for (
    let date = firstDate;
    Temporal.PlainDate.compare(date, lastDate) <= 0;
    date = date.add({ days: 1 })
  ) {
    for (const [boundaryIndex, boundary] of schedule.entries()) {
      const wanted = date.toPlainDateTime(boundaryTimes[boundaryIndex]);
      if (
        Temporal.PlainDateTime.compare(wanted, earliestWanted) < 0 ||
        Temporal.PlainDateTime.compare(wanted, latestWanted) > 0
      ) {
        continue;
      }
      let boundaryInstant: Temporal.Instant;
      if (hasFixedOffset) {
        boundaryInstant = Temporal.Instant.fromEpochMilliseconds(
          wanted.toZonedDateTime(UTC_ZONE_ID).epochMilliseconds -
            localStart.offsetNanoseconds / NANOSECONDS_PER_MILLISECOND,
        );
      } else {
        const zoned = wanted.toZonedDateTime(timeZoneId, {
          disambiguation: "earlier",
        });
        if (!zoned.toPlainDateTime().equals(wanted)) continue;
        boundaryInstant = zoned.toInstant();
      }
      const halfBlend = {
        nanoseconds: (boundary.blendMinutes * NANOSECONDS_PER_MINUTE) / HALF,
      };
      const start = boundaryInstant.subtract(halfBlend);
      const end = boundaryInstant.add(halfBlend);
      const intersects =
        Temporal.Instant.compare(end, day.start) >= 0 &&
        Temporal.Instant.compare(start, day.end) <= 0;
      if (intersects) {
        windows.push({ start, end, from: boundary.from, to: boundary.to });
      }
    }
  }
  return windows;
}

const getPeriodAt = (
  instant: Temporal.Instant,
  timeZoneId: string,
  schedule: readonly DayPeriodBoundary[],
) =>
  getDayPeriod(instant.toZonedDateTimeISO(timeZoneId).toPlainTime(), schedule);

/** Offset changes inside the day that move the local time to another period. */
export function collectOffsetEdges(
  timeZoneId: string,
  day: ReferenceDay,
  schedule: readonly DayPeriodBoundary[] = DAY_PERIOD_SCHEDULE,
  transitions: readonly Temporal.Instant[] = findOffsetTransitions(
    timeZoneId,
    day,
  ),
): OffsetEdge[] {
  const edges: OffsetEdge[] = [];
  for (const instant of transitions) {
    const isInsideDay =
      Temporal.Instant.compare(instant, day.start) > 0 &&
      Temporal.Instant.compare(instant, day.end) < 0;
    if (!isInsideDay) continue;
    const before = getPeriodAt(
      instant.subtract({ nanoseconds: 1 }),
      timeZoneId,
      schedule,
    );
    const after = getPeriodAt(instant, timeZoneId, schedule);
    if (before !== after) edges.push({ instant, before, after });
  }
  return edges;
}
