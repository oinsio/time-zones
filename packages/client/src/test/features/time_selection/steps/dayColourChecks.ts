import { expect } from "vitest";
import { NANOSECONDS_PER_MINUTE, TRACK_STEP_MINUTES } from "@/constants";
import {
  DAY_PERIOD_SCHEDULE,
  DayPeriod,
  type DayPeriodStop,
  getDayPeriod,
} from "@/model";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

type TimeSelectionWorld = ReturnType<typeof createTimeSelectionWorld>;

const PRECISION = 6;
const STOP_SEPARATOR = ", ";
const LABEL_SEPARATOR = " ";
const PERIOD_BY_NAME: Record<string, DayPeriod> = {
  night: DayPeriod.NIGHT,
  morning: DayPeriod.MORNING,
  working: DayPeriod.WORK,
  evening: DayPeriod.EVENING,
};

const parseStops = (text: string): DayPeriodStop[] =>
  text.split(STOP_SEPARATOR).map((stopText) => {
    const [fraction, periodName] = stopText.split(LABEL_SEPARATOR);
    return { fraction: Number(fraction), period: PERIOD_BY_NAME[periodName] };
  });

/** Asserts the colour stops presented for a city, e.g. "0.27 night, 0.31 morning". */
export const expectStops = (
  world: TimeSelectionWorld,
  city: string,
  stopsText: string,
) => {
  const actual = world.trackOf(city).stops;
  const expected = parseStops(stopsText);
  expect(actual).toHaveLength(expected.length);
  expected.forEach((stop, index) => {
    expect(actual[index]?.fraction).toBeCloseTo(stop.fraction, PRECISION);
    expect(actual[index]?.period).toBe(stop.period);
  });
};

export const expectLabels = (
  world: TimeSelectionWorld,
  city: string,
  labelsText: string,
) =>
  expect(world.trackOf(city).hourLabels.map(({ label }) => label)).toEqual(
    labelsText.split(LABEL_SEPARATOR),
  );

/** Checks every quarter-hour outside a blend window; returns how many were checked. */
export const expectPeriodColoursOutsideBlends = (
  world: TimeSelectionWorld,
): number => {
  let checkedPositions = 0;
  for (const row of world.rows()) {
    const day = world.dayBoundsOf(row.cityLabel);
    const stops = world.trackOf(row.cityLabel).stops;
    const zone = KNOWN_CITIES[row.cityLabel].timeZoneId;
    for (
      let minute = 0;
      minute < day.lengthMinutes;
      minute += TRACK_STEP_MINUTES
    ) {
      const fraction = minute / day.lengthMinutes;
      const previous = stops.filter((stop) => stop.fraction <= fraction).at(-1);
      const next = stops.find((stop) => stop.fraction > fraction);
      const isInsideBlend =
        previous !== undefined &&
        next !== undefined &&
        previous.period !== next.period;
      if (isInsideBlend) continue;
      const localTime = day.start
        .add({ nanoseconds: minute * NANOSECONDS_PER_MINUTE })
        .toZonedDateTimeISO(zone)
        .toPlainTime();
      expect((previous ?? next)?.period).toBe(
        getDayPeriod(localTime, DAY_PERIOD_SCHEDULE),
      );
      checkedPositions += 1;
    }
  }
  return checkedPositions;
};
