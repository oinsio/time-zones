import { DAY_PERIOD_BLEND_MINUTES, MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { Coordinates } from "./coordinates";
import type { DayPeriod, DayPeriodBoundary } from "./dayPeriods";
import { getSolarDayPeriods } from "./dayPeriodTransitions";
import type { ReferenceDay } from "./dayTrack";
import type { SolarDay } from "./sun";

/**
 * The calculation behind `getDayPeriodBoundaries`: the boundaries of a
 * reference day widened by half a blend window at each end, stitched from the
 * solar days that overlap it. It loads apart from the initial JavaScript
 * (`sunSupport.ts`); the caller hands in `getSolarDay`, so the sun is asked
 * through the one module that owns it.
 * Implements FR1, FR2, NFR-P1, NFR-P2 of bind-day-periods-to-sun (D2).
 */

export type SolarDayReader = (
  coordinates: Coordinates,
  epochMilliseconds: number,
) => SolarDay;

const HALF_WINDOW_MILLISECONDS =
  (DAY_PERIOD_BLEND_MINUTES * MILLISECONDS_PER_MINUTE) / 2;

export function computeDayPeriodBoundaries(
  getSolarDay: SolarDayReader,
  coordinates: Coordinates,
  day: ReferenceDay,
): DayPeriodBoundary[] {
  const windowStart = day.start.epochMilliseconds - HALF_WINDOW_MILLISECONDS;
  const windowEnd = day.end.epochMilliseconds + HALF_WINDOW_MILLISECONDS;
  const boundaries: DayPeriodBoundary[] = [];
  let solarDay = getSolarDay(coordinates, windowStart);
  let current: DayPeriod | undefined;
  const change = (instant: number, to: DayPeriod) => {
    if (current !== undefined && current !== to) {
      if (instant >= windowStart && instant <= windowEnd) {
        boundaries.push({
          instant: Temporal.Instant.fromEpochMilliseconds(Math.round(instant)),
          from: current,
          to,
        });
      }
    }
    current = to;
  };
  while (true) {
    const { initial, transitions } = getSolarDayPeriods(solarDay);
    change(solarDay.solarMidnightBefore, initial);
    for (const transition of transitions)
      change(transition.instant, transition.to);
    if (solarDay.solarMidnightAfter > windowEnd) return boundaries;
    solarDay = getSolarDay(coordinates, solarDay.solarMidnightAfter);
  }
}
