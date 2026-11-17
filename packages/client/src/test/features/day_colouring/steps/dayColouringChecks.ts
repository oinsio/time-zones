// Implements FR1 of colour-locations-without-day-periods-in-accent: the no-day-period label of the shared checks.
// Implements FR8, FR9, FR10, FR11 of add-day-colouring-setting: shared checks of the day colouring steps.
import { expect } from "vitest";
import { DayColour, type DayColourStop } from "@/presenter";
import type { createTimeSelectionWorld } from "../../time_selection/steps/timeSelectionWorld";

type TimeSelectionWorld = ReturnType<typeof createTimeSelectionWorld>;

const PRECISION = 6;
const STOP_SEPARATOR = ", ";
const LABEL_SEPARATOR = " ";

const COLOUR_BY_NAME: Record<string, DayColour> = {
  night: DayColour.NIGHT,
  morning: DayColour.MORNING,
  day: DayColour.DAY,
  "no-day-period": DayColour.NO_DAY_PERIOD,
  evening: DayColour.EVENING,
  plain: DayColour.PLAIN,
  working: DayColour.WORKING_TIME,
  "non-working": DayColour.NON_WORKING_TIME,
};

const parseStops = (text: string): DayColourStop[] =>
  text.split(STOP_SEPARATOR).map((stopText) => {
    const [fraction, colourName] = stopText.split(LABEL_SEPARATOR);
    return { fraction: Number(fraction), colour: COLOUR_BY_NAME[colourName] };
  });

/** Asserts the colour stops of a city's track, e.g. "0.5 non-working, 0.5 working". */
export const expectColourStops = (
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

/** The hours of a text such as `09:07-18:00`. */
export const parseWorkingHoursText = (text: string) => {
  const [start, end] = text.split("-");
  return { start, end };
};
