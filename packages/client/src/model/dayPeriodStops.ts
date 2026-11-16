import { MILLISECONDS_PER_MINUTE } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import { type Coordinates, getCoordinatesKey } from "./coordinates";
import { getDayPeriodBoundaries } from "./dayPeriodBoundaries";
import { type DayPeriod, getDayPeriodAt } from "./dayPeriods";
import { type BlendWindow, collectBlendWindows } from "./dayPeriodWindows";
import type { ReferenceDay } from "./dayTrack";

/**
 * Colour stops of a day track: two per blend window. A day without a
 * boundary has one stop; a location without coordinates has none. Assembly
 * is pure on plain data; the stops of one reference day are memoized.
 * Implements FR5, FR8, NFR-P1 of bind-day-periods-to-sun (D3, D5),
 * FR3 of support-legacy-ios-12-safari (milliseconds, no BigInt).
 */

export type DayPeriodStop = { fraction: number; period: DayPeriod };

const getFractionOf = (day: ReferenceDay, instant: Temporal.Instant) =>
  (instant.epochMilliseconds - day.start.epochMilliseconds) /
  (day.lengthMinutes * MILLISECONDS_PER_MINUTE);

/** Sorted stops: two per blend window. */
export function assembleDayPeriodStops(
  windows: readonly BlendWindow[],
  day: ReferenceDay,
): DayPeriodStop[] {
  return windows
    .flatMap((window) => [
      { fraction: getFractionOf(day, window.start), period: window.from },
      { fraction: getFractionOf(day, window.end), period: window.to },
    ])
    .sort((first, second) => first.fraction - second.fraction);
}

let cachedDayKey: string | undefined;
let cachedStopsByCoordinates = new Map<string, readonly DayPeriodStop[]>();

/** Memoized per reference day and coordinates; `undefined` without coordinates. */
export function getDayPeriodStops(
  coordinates: Coordinates | undefined,
  day: ReferenceDay,
): readonly DayPeriodStop[] | undefined {
  if (coordinates === undefined) return undefined;
  const dayKey = `${day.start.epochMilliseconds}|${day.end.epochMilliseconds}`;
  if (dayKey !== cachedDayKey) {
    cachedDayKey = dayKey;
    cachedStopsByCoordinates = new Map();
  }
  const coordinatesKey = getCoordinatesKey(coordinates);
  const cached = cachedStopsByCoordinates.get(coordinatesKey);
  if (cached !== undefined) return cached;
  const boundaries = getDayPeriodBoundaries(coordinates, day);
  const stops =
    boundaries.length === 0
      ? [
          {
            fraction: 0,
            period: getDayPeriodAt(coordinates, day.start.epochMilliseconds),
          },
        ]
      : assembleDayPeriodStops(collectBlendWindows(boundaries, day), day);
  cachedStopsByCoordinates.set(coordinatesKey, stops);
  return stops;
}
