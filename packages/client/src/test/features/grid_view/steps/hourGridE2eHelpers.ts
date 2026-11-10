// Implements FR1, FR8, NFR-R1 of add-grid-hour-cells-and-hour-frame: locators and boxes of the hour grid in a real browser.
import type { Locator, Page } from "@playwright/test";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  type Box,
  requireBox,
  sliderOf,
} from "../../time_selection/steps/timeSelectionE2eHelpers";

export const GRID_PANEL_SELECTOR = 'ul[data-row-variant="grid-row"]';
export const HOUR_CELL_SELECTOR = "[data-hour-cell]";
export const HOUR_FRAME_SELECTOR = "[data-hour-frame-index]";
export const CLOCK_CHANGE_NOTE_SELECTOR = "p.bg-notice";
const HALF = 2;

export const panelOf = (page: Page) => page.locator(GRID_PANEL_SELECTOR);
export const frameOf = (page: Page) => page.locator(HOUR_FRAME_SELECTOR);
export const cellsOf = (page: Page, city: string) =>
  sliderOf(page, city).locator(HOUR_CELL_SELECTOR);
export const cellOf = (page: Page, city: string, column: number) =>
  cellsOf(page, city).nth(column);
export const rowsOf = (page: Page) =>
  panelOf(page).locator(":scope > li:not([aria-hidden])");
export const noteOf = (page: Page, city: string) =>
  listRow(page, city).locator(CLOCK_CHANGE_NOTE_SELECTOR);

export const centreOf = (box: Box) => ({
  x: box.x + box.width / HALF,
  y: box.y + box.height / HALF,
});

/** The frame column the app reports through `data-hour-frame-index`. */
export const frameColumnOf = async (page: Page): Promise<number> =>
  Number(await frameOf(page).getAttribute("data-hour-frame-index"));

/** The text of the element at a point is a descendant of (or is) the locator's element. */
export const isTopmostAt = (
  target: Locator,
  point: { x: number; y: number },
): Promise<boolean> =>
  target.evaluate((element, { x, y }) => {
    const topmost = document.elementFromPoint(x, y);
    return topmost !== null && element.contains(topmost);
  }, point);

export { requireBox };
