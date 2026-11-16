import { expect } from "vitest";
import { NANOSECONDS_PER_MINUTE, TRACK_STEP_MINUTES } from "@/constants";
import { DAY_PERIOD_SCHEDULE, getDayPeriod } from "@/model";
import { DayColour, type DayColourStop } from "@/presenter";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

type TimeSelectionWorld = ReturnType<typeof createTimeSelectionWorld>;

const PRECISION = 6;
const STOP_SEPARATOR = ", ";
const LABEL_SEPARATOR = " ";
const COLOUR_BY_NAME: Record<string, DayColour> = {
  night: DayColour.NIGHT,
  morning: DayColour.MORNING,
  work: DayColour.DAY,
  evening: DayColour.EVENING,
};

const parseStops = (text: string): DayColourStop[] =>
  text.split(STOP_SEPARATOR).map((stopText) => {
    const [fraction, colourName] = stopText.split(LABEL_SEPARATOR);
    return { fraction: Number(fraction), colour: COLOUR_BY_NAME[colourName] };
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
    expect(actual[index]?.colour).toBe(stop.colour);
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
        previous.colour !== next.colour;
      if (isInsideBlend) continue;
      const localTime = day.start
        .add({ nanoseconds: minute * NANOSECONDS_PER_MINUTE })
        .toZonedDateTimeISO(zone)
        .toPlainTime();
      expect((previous ?? next)?.colour).toBe(
        DayColour[getDayPeriod(localTime, DAY_PERIOD_SCHEDULE)],
      );
      checkedPositions += 1;
    }
  }
  return checkedPositions;
};
