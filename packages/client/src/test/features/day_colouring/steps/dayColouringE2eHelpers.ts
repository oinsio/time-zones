// Implements FR12 of add-day-colouring-setting: reading the day colours a view draws, in a real browser.
import type { Locator, Page } from "@playwright/test";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";

const DAY_TRACK_BAR_SELECTOR = "[data-day-track-bar]";
const HOUR_CELL_SELECTOR = "[data-hour-cell]";
const HOURS_PER_DAY = 24;

/** The track bar of a city: the Cards day track, or the hour strip slider's own bar when it has one. */
export const dayTrackBarOf = (page: Page, city: string): Locator =>
  sliderOf(page, city).locator(DAY_TRACK_BAR_SELECTOR);

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
