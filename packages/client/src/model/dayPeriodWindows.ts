import { DAY_PERIOD_BLEND_MINUTES, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { DayPeriod, DayPeriodBoundary } from "./dayPeriods";
import type { ReferenceDay } from "./dayTrack";

/**
 * Where the colours of a day track blend: a window centred on each
 * day-period boundary, shortened so that it never passes the midpoint to the
 * neighbouring boundary. Pure on plain data; the stops are assembled from
 * these in `dayPeriodStops.ts`.
 * Implements FR5, FR9 of bind-day-periods-to-sun (D3).
 */

export type BlendWindow = {
  start: Temporal.Instant;
  end: Temporal.Instant;
  from: DayPeriod;
  to: DayPeriod;
};

const HALF_WINDOW_MILLISECONDS =
  (DAY_PERIOD_BLEND_MINUTES * MILLISECONDS_PER_MINUTE) / 2;
const HALF = 2;

const getMidpoint = (first: number, second: number) =>
  Math.round((first + second) / HALF);

/** The blend windows of the boundaries that reach into the day. */
export function collectBlendWindows(
  boundaries: readonly DayPeriodBoundary[],
  day: ReferenceDay,
): BlendWindow[] {
  const instants = boundaries.map(
    (boundary) => boundary.instant.epochMilliseconds,
  );
  return boundaries.flatMap((boundary, index) => {
    const centre = instants[index];
    const start =
      index === 0
        ? centre - HALF_WINDOW_MILLISECONDS
        : Math.max(
            centre - HALF_WINDOW_MILLISECONDS,
            getMidpoint(instants[index - 1], centre),
          );
    const end =
      index === boundaries.length - 1
        ? centre + HALF_WINDOW_MILLISECONDS
        : Math.min(
            centre + HALF_WINDOW_MILLISECONDS,
            getMidpoint(centre, instants[index + 1]),
          );
    const intersects =
      end >= day.start.epochMilliseconds && start <= day.end.epochMilliseconds;
    return intersects
      ? [
          {
            start: Temporal.Instant.fromEpochMilliseconds(start),
            end: Temporal.Instant.fromEpochMilliseconds(end),
            from: boundary.from,
            to: boundary.to,
          },
        ]
      : [];
  });
}
