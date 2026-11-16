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

export function getSolarDayPeriods(solarDay: SolarDay): SolarDayPeriods {
  const { night, day } = solarDay;
  const isNightCrossed = night.state === SunThresholdState.CROSSES;
  const isDayReached = day.state !== SunThresholdState.STAYS_BELOW;
  const isNightReached = night.state !== SunThresholdState.STAYS_BELOW;
  let initial = DayPeriod.NIGHT;
  if (!isNightCrossed && isNightReached) {
    initial =
      day.state === SunThresholdState.STAYS_ABOVE
        ? DayPeriod.DAY
        : DayPeriod.MORNING;
  }
  const candidates: [number | undefined, DayPeriod][] = [
    [night.rising, DayPeriod.MORNING],
    [day.rising, DayPeriod.DAY],
    // Between −6° and +6° at noon the morning turns into the evening there.
    [
      !isDayReached && isNightReached ? solarDay.solarNoon : undefined,
      DayPeriod.EVENING,
    ],
    [day.setting, DayPeriod.EVENING],
    [night.setting, DayPeriod.NIGHT],
  ];
  return {
    initial,
    transitions: candidates.flatMap(([instant, to]) =>
      instant === undefined ? [] : [{ instant, to }],
    ),
  };
}
