import { GRADIENT_PERCENT_DIGITS, PERCENT_PER_FRACTION } from "@/constants";
import { DayColour, type DayColourStop } from "@/presenter";

/**
 * CSS custom properties of the design tokens of each day colour
 * (`styles/tokens.css`): the plain colour and working time are the accent.
 * Implements FR9, FR10 of add-day-colouring-setting (D4).
 * Implements FR8, FR9 of bind-day-periods-to-sun (D6, D7): `NO_DAY_PERIOD` is the non-working grey.
 */
export const DAY_COLOUR_VARIABLES: Record<DayColour, string> = {
  [DayColour.NIGHT]: "--color-day-night",
  [DayColour.MORNING]: "--color-day-morning",
  [DayColour.DAY]: "--color-day-daylight",
  [DayColour.EVENING]: "--color-day-evening",
  [DayColour.PLAIN]: "--color-accent",
  [DayColour.WORKING_TIME]: "--color-accent",
  [DayColour.NON_WORKING_TIME]: "--color-day-non-working",
  [DayColour.NO_DAY_PERIOD]: "--color-day-non-working",
};

/**
 * The digit class of an hour cell per day colour, one theme-independent class
 * each; the token behind it switches with the theme (D6).
 * Implements NFR-A3 of add-day-colouring-setting (D4, D6).
 */
export const DAY_COLOUR_FOREGROUND_CLASS_NAMES: Record<DayColour, string> = {
  [DayColour.NIGHT]: "text-foreground",
  [DayColour.MORNING]: "text-hour-cell-foreground",
  [DayColour.DAY]: "text-hour-cell-foreground",
  [DayColour.EVENING]: "text-hour-cell-foreground",
  [DayColour.PLAIN]: "text-accent-foreground",
  [DayColour.WORKING_TIME]: "text-accent-foreground",
  [DayColour.NON_WORKING_TIME]: "text-foreground",
  [DayColour.NO_DAY_PERIOD]: "text-foreground",
};

const NO_GRADIENT = "none";
const TRACK_START_FRACTION = 0;
const TRACK_END_FRACTION = 1;

export const formatPercent = (fraction: number): string =>
  `${Number((fraction * PERCENT_PER_FRACTION).toFixed(GRADIENT_PERCENT_DIGITS))}%`;

/**
 * The track background: a left-to-right gradient through the colour stops of
 * the day colouring. Colours are reached only through the design tokens. CSS
 * needs two colour stops, so a single stop is written twice, at 0% and 100%.
 * Implements FR6 of add-time-sliders-to-location-cards (D7).
 * Implements FR2, FR9, FR10, FR12 of add-day-colouring-setting (D4).
 */
export function buildDayTrackGradient(stops: readonly DayColourStop[]): string {
  if (stops.length === 0) return NO_GRADIENT;
  const drawnStops =
    stops.length === 1
      ? [
          { ...stops[0], fraction: TRACK_START_FRACTION },
          { ...stops[0], fraction: TRACK_END_FRACTION },
        ]
      : stops;
  const colorStops = drawnStops.map(
    (stop) =>
      `var(${DAY_COLOUR_VARIABLES[stop.colour]}) ${formatPercent(stop.fraction)}`,
  );
  return `linear-gradient(to right, ${colorStops.join(", ")})`;
}
