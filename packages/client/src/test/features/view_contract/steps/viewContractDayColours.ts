// Implements FR12 of add-day-colouring-setting: per-view reader of the day colours, for the view contract.
import type { Locator } from "@playwright/test";

const DAY_TRACK_BAR_SELECTOR = "[data-day-track-bar]";
const HOUR_CELL_SELECTOR = "[data-hour-cell]";
const HOURS_PER_DAY = 24;

/**
 * The computed colours a row draws: in Grid the background of each hour cell
 * (or of the one cell at `atHour`), in Cards the colours of the track gradient
 * (or the colour of its stop at `atHour`). Resolved by the browser to `rgb(...)`.
 */
export const readRowDayColours = async (
  row: Locator,
  atHour?: number,
): Promise<string[]> => {
  const cells = row.locator(HOUR_CELL_SELECTOR);
  if ((await cells.count()) > 0) {
    const colours = await cells.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).backgroundColor),
    );
    return atHour === undefined ? colours : [colours[atHour]];
  }
  const gradient = await row
    .locator(DAY_TRACK_BAR_SELECTOR)
    .evaluate((element) => getComputedStyle(element).backgroundImage);
  const stops = [...gradient.matchAll(/(rgb\([^)]*\)) ([\d.]+)%/g)].map(
    (match) => ({ colour: match[1], percent: Number(match[2]) }),
  );
  if (atHour === undefined)
    return [...new Set(stops.map((stop) => stop.colour))];
  const position = (atHour / HOURS_PER_DAY) * 100;
  const before = stops.filter((stop) => stop.percent <= position).at(-1);
  return [(before ?? stops[0]).colour];
};
