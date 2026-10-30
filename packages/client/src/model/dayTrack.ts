import {
  NANOSECONDS_PER_MINUTE,
  TRACK_END_BEFORE_DAY_END_MINUTES,
  TRACK_HOUR_MOVE_MINUTES,
  TRACK_STEP_MINUTES,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { WorldClockState } from "./locations";
import { getEffectiveInstant, getReferenceZone } from "./referenceMoment";

/**
 * Day track arithmetic: the reference day a slider spans, handle positions
 * and keyboard moves. Pure; all lengths come from absolute instants, so days
 * of 23 and 25 hours work.
 * Implements FR1, FR2, FR3, FR4 of add-time-sliders-to-location-cards (D2).
 * Implements FR1, FR2, FR3 of fix-day-track-handle-overlap-and-end-of-day (D1).
 */

export type ReferenceDay = {
  start: Temporal.Instant;
  end: Temporal.Instant;
  lengthMinutes: number;
};

export enum TrackMove {
  NEXT_STEP = "NEXT_STEP",
  PREVIOUS_STEP = "PREVIOUS_STEP",
  HOUR_FORWARD = "HOUR_FORWARD",
  HOUR_BACK = "HOUR_BACK",
  DAY_START = "DAY_START",
  DAY_END = "DAY_END",
}

/** The day of the effective instant in the reference zone. */
export function getReferenceDay(
  state: WorldClockState,
  now: Temporal.Instant,
): ReferenceDay {
  const zoned = getEffectiveInstant(state, now).toZonedDateTimeISO(
    getReferenceZone(state),
  );
  const start = zoned.startOfDay();
  const end = zoned.add({ days: 1 }).startOfDay();
  return {
    start: start.toInstant(),
    end: end.toInstant(),
    lengthMinutes: start.until(end).total({ unit: "minute" }),
  };
}

const getElapsedMinutes = (day: ReferenceDay, instant: Temporal.Instant) =>
  day.start.until(instant).total({ unit: "minute" });

export function getTrackFraction(
  day: ReferenceDay,
  instant: Temporal.Instant,
): number {
  return getElapsedMinutes(day, instant) / day.lengthMinutes;
}

export function getTrackValueMinutes(
  day: ReferenceDay,
  instant: Temporal.Instant,
): number {
  return Math.floor(getElapsedMinutes(day, instant));
}

/** The last minute of the reference day: the right end of a day track. */
export function getTrackEndMinutes(day: ReferenceDay): number {
  return day.lengthMinutes - TRACK_END_BEFORE_DAY_END_MINUTES;
}

function getInstantAtMinutes(
  day: ReferenceDay,
  minutes: number,
): Temporal.Instant {
  const clamped = Math.min(Math.max(minutes, 0), getTrackEndMinutes(day));
  return day.start.add({ nanoseconds: clamped * NANOSECONDS_PER_MINUTE });
}

/** The instant at a 0–1 position, rounded to the nearest step and clamped. */
export function getInstantAtTrackFraction(
  day: ReferenceDay,
  fraction: number,
): Temporal.Instant {
  const steps = Math.round((fraction * day.lengthMinutes) / TRACK_STEP_MINUTES);
  return getInstantAtMinutes(day, steps * TRACK_STEP_MINUTES);
}

/** The instant after a keyboard move, clamped to the day start and the track end. */
export function getInstantAfterTrackMove(
  day: ReferenceDay,
  instant: Temporal.Instant,
  move: TrackMove,
): Temporal.Instant {
  const elapsed = getElapsedMinutes(day, instant);
  const floorStep =
    Math.floor(elapsed / TRACK_STEP_MINUTES) * TRACK_STEP_MINUTES;
  const ceilStep = Math.ceil(elapsed / TRACK_STEP_MINUTES) * TRACK_STEP_MINUTES;
  const targetMinutes: Record<TrackMove, number> = {
    [TrackMove.NEXT_STEP]: floorStep + TRACK_STEP_MINUTES,
    [TrackMove.PREVIOUS_STEP]: ceilStep - TRACK_STEP_MINUTES,
    [TrackMove.HOUR_FORWARD]: floorStep + TRACK_HOUR_MOVE_MINUTES,
    [TrackMove.HOUR_BACK]: ceilStep - TRACK_HOUR_MOVE_MINUTES,
    [TrackMove.DAY_START]: 0,
    [TrackMove.DAY_END]: getTrackEndMinutes(day),
  };
  return getInstantAtMinutes(day, targetMinutes[move]);
}
