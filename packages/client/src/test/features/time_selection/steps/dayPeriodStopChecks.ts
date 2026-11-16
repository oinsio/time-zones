// Implements FR5, FR9, UX1 of bind-day-periods-to-sun: checks of the colour stops of a track.
import { expect } from "vitest";
import { MINUTES_PER_HOUR, PERCENT_PER_FRACTION } from "@/constants";
import { DayColour } from "@/presenter";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

type TimeSelectionWorld = ReturnType<typeof createTimeSelectionWorld>;

const BOUNDARY_SEPARATOR = ", ";
const BLEND_WINDOW_MINUTES = 30;
const BOUNDARY_TOLERANCE_MINUTES = 3;
const MINUTES_PER_DAY = 1440;
const BOUNDARY_PATTERN = /^(\w+) to (\w+) (\d{2}):(\d{2})$/;
const STOPS_PER_BOUNDARY = 2;
const COLOUR_BY_WORD: Record<string, DayColour> = {
  night: DayColour.NIGHT,
  morning: DayColour.MORNING,
  day: DayColour.DAY,
  daylight: DayColour.DAY,
  evening: DayColour.EVENING,
};

/** Checks that the stops pair up around the listed boundaries: "night to morning 05:48, …". */
export const expectBoundaryStops = (
  world: TimeSelectionWorld,
  city: string,
  boundariesText: string,
) => {
  const stops = world.trackOf(city).stops;
  const boundaries = boundariesText.split(BOUNDARY_SEPARATOR);
  expect(stops).toHaveLength(boundaries.length * STOPS_PER_BOUNDARY);
  boundaries.forEach((boundaryText, index) => {
    const match = BOUNDARY_PATTERN.exec(boundaryText);
    if (match === null) throw new Error(`unreadable boundary ${boundaryText}`);
    const [first, second] = stops.slice(
      index * STOPS_PER_BOUNDARY,
      (index + 1) * STOPS_PER_BOUNDARY,
    );
    expect([first.colour, second.colour]).toEqual([
      COLOUR_BY_WORD[match[1]],
      COLOUR_BY_WORD[match[2]],
    ]);
    const firstMinutes = first.fraction * MINUTES_PER_DAY;
    const secondMinutes = second.fraction * MINUTES_PER_DAY;
    expect(secondMinutes - firstMinutes).toBeCloseTo(BLEND_WINDOW_MINUTES, 0);
    const centreMinutes = (firstMinutes + secondMinutes) / STOPS_PER_BOUNDARY;
    const expectedMinutes =
      Number(match[3]) * MINUTES_PER_HOUR + Number(match[4]);
    expect(Math.abs(centreMinutes - expectedMinutes)).toBeLessThan(
      BOUNDARY_TOLERANCE_MINUTES,
    );
  });
};

/** The share of the track between the centres of the night-to-morning and morning-to-day boundaries. */
export const getMorningBandPercent = (
  world: TimeSelectionWorld,
  city: string,
): number => {
  const stops = world.trackOf(city).stops;
  const centre = (index: number) =>
    (stops[index].fraction + stops[index + 1].fraction) / STOPS_PER_BOUNDARY;
  return (centre(STOPS_PER_BOUNDARY) - centre(0)) * PERCENT_PER_FRACTION;
};

export const expectWholeTrackColour = (
  world: TimeSelectionWorld,
  city: string,
  colourWord: string,
) =>
  expect(world.trackOf(city).stops).toEqual([
    { fraction: 0, colour: COLOUR_BY_WORD[colourWord] },
  ]);
