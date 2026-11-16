import { DayPeriod } from "./dayPeriods";
import { type SolarDay, SunThresholdState } from "./sun";

/**
 * The day periods of one solar day, read from its threshold crossings: the
 * period at solar midnight and each change after it, in time order. Pure on
 * the solar day; `dayPeriodBoundaries.ts` stitches consecutive solar days.
 * Implements FR1, FR2 of bind-day-periods-to-sun (D2).
 */

export type DayPeriodTransition = { instant: number; to: DayPeriod };

export type SolarDayPeriods = {
  initial: DayPeriod;
  transitions: DayPeriodTransition[];
};

/** The period at solar noon when the sun is beyond a threshold there, else undefined. */
function getExtremePeriodAtNoon(solarDay: SolarDay): DayPeriod | undefined {
  if (solarDay.day.state !== SunThresholdState.STAYS_BELOW)
    return DayPeriod.DAY;
  return solarDay.night.state === SunThresholdState.STAYS_BELOW
    ? DayPeriod.NIGHT
    : undefined;
}

export function getSolarDayPeriods(solarDay: SolarDay): SolarDayPeriods {
  const { night, day } = solarDay;
  const isNightCrossed = night.state === SunThresholdState.CROSSES;
  const isDayCrossed = day.state === SunThresholdState.CROSSES;
  let initial = DayPeriod.NIGHT;
  if (night.state === SunThresholdState.STAYS_ABOVE) {
    initial =
      day.state === SunThresholdState.STAYS_ABOVE
        ? DayPeriod.DAY
        : DayPeriod.MORNING;
  }
  const transitions: DayPeriodTransition[] = [];
  const add = (instant: number | undefined, to: DayPeriod) => {
    if (instant !== undefined) transitions.push({ instant, to });
  };
  if (isNightCrossed) add(night.rising, DayPeriod.MORNING);
  if (isDayCrossed) add(day.rising, DayPeriod.DAY);
  if (getExtremePeriodAtNoon(solarDay) === undefined) {
    add(solarDay.solarNoon, DayPeriod.EVENING);
  }
  if (isDayCrossed) add(day.setting, DayPeriod.EVENING);
  if (isNightCrossed) add(night.setting, DayPeriod.NIGHT);
  return { initial, transitions };
}
