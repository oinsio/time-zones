import { GRADIENT_PERCENT_DIGITS, PERCENT_PER_FRACTION } from "@/constants";
import { DayPeriod, type DayPeriodStop } from "@/presenter";

/** CSS custom properties of the day-period design tokens (`styles/tokens.css`). */
export const DAY_PERIOD_COLOR_VARIABLES: Record<DayPeriod, string> = {
  [DayPeriod.NIGHT]: "--color-day-night",
  [DayPeriod.MORNING]: "--color-day-morning",
  [DayPeriod.WORK]: "--color-day-working",
  [DayPeriod.EVENING]: "--color-day-evening",
};

const NO_GRADIENT = "none";

export const formatPercent = (fraction: number): string =>
  `${Number((fraction * PERCENT_PER_FRACTION).toFixed(GRADIENT_PERCENT_DIGITS))}%`;

/**
 * The track background: a left-to-right gradient through the colour stops of
 * the day periods. Colours are reached only through the design tokens.
 * Implements FR6 of add-time-sliders-to-location-cards (D7).
 */
export function buildDayTrackGradient(stops: readonly DayPeriodStop[]): string {
  if (stops.length === 0) return NO_GRADIENT;
  const colorStops = stops.map(
    (stop) =>
      `var(${DAY_PERIOD_COLOR_VARIABLES[stop.period]}) ${formatPercent(stop.fraction)}`,
  );
  return `linear-gradient(to right, ${colorStops.join(", ")})`;
}
