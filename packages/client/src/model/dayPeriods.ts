import {
  EVENING_START_WALL_TIME,
  MORNING_START_WALL_TIME,
  NIGHT_BOUNDARY_BLEND_MINUTES,
  NIGHT_START_WALL_TIME,
  WORK_BOUNDARY_BLEND_MINUTES,
  WORK_START_WALL_TIME,
} from "@/constants";
import { Temporal } from "@/lib/temporal";

/**
 * Day periods of a location's local time and the schedule that bounds them.
 * Implements FR6 of add-time-sliders-to-location-cards (D3).
 */

export enum DayPeriod {
  NIGHT = "NIGHT",
  MORNING = "MORNING",
  WORK = "WORK",
  EVENING = "EVENING",
}

export type DayPeriodBoundary = {
  /** Local wall time the `to` period starts, `HH:mm`. */
  wallTime: string;
  from: DayPeriod;
  to: DayPeriod;
  /** Width of the colour blend centred on the boundary. */
  blendMinutes: number;
};

export const DAY_PERIOD_SCHEDULE: readonly DayPeriodBoundary[] = [
  {
    wallTime: MORNING_START_WALL_TIME,
    from: DayPeriod.NIGHT,
    to: DayPeriod.MORNING,
    blendMinutes: NIGHT_BOUNDARY_BLEND_MINUTES,
  },
  {
    wallTime: WORK_START_WALL_TIME,
    from: DayPeriod.MORNING,
    to: DayPeriod.WORK,
    blendMinutes: WORK_BOUNDARY_BLEND_MINUTES,
  },
  {
    wallTime: EVENING_START_WALL_TIME,
    from: DayPeriod.WORK,
    to: DayPeriod.EVENING,
    blendMinutes: WORK_BOUNDARY_BLEND_MINUTES,
  },
  {
    wallTime: NIGHT_START_WALL_TIME,
    from: DayPeriod.EVENING,
    to: DayPeriod.NIGHT,
    blendMinutes: NIGHT_BOUNDARY_BLEND_MINUTES,
  },
];

/**
 * The period of a wall time: the `to` of the last boundary at or before it,
 * or the `from` of the first boundary before the first one of the day.
 */
export function getDayPeriod(
  wallTime: Temporal.PlainTime,
  schedule: readonly DayPeriodBoundary[],
): DayPeriod {
  const passedBoundaries = schedule.filter(
    (boundary) =>
      Temporal.PlainTime.compare(
        wallTime,
        Temporal.PlainTime.from(boundary.wallTime),
      ) >= 0,
  );
  const lastPassed = passedBoundaries[passedBoundaries.length - 1];
  return lastPassed === undefined ? schedule[0].from : lastPassed.to;
}
