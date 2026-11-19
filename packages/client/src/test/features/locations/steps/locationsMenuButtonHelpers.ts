// Verifies FR1, FR2, FR3, UX1 of make-location-menu-button-vertical: measuring the menu button of a row.
import { expect, type Locator, type Page } from "@playwright/test";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  cityOf,
  dateOf,
  LAYOUT_TOLERANCE_PX,
  zoneLineOf,
} from "./locationsCardLayoutHelpers";
import { listRow } from "./locationsE2eHelpers";

export const MAX_MENU_FOOTPRINT_PX = 32;
export const MIN_HIT_AREA_PX = 44;
export const MAX_SPACING_DIFFERENCE_PX = 10;
export const MAX_DOTS_CENTRE_OFFSET_PX = 3;
const HALF = 2;
const GRID_PANEL_SELECTOR = 'ul[data-row-variant="grid-row"]';
const STICKY_HEADER_SELECTOR = ".sticky";
const OFFSET_DIFFERENCE_SELECTOR = "[data-offset-difference]";
const WALL_TIME_PATTERN = /^(Enter time|Ввести время)/;
const MEETING_TIME_PATTERN = /^(Enter meeting time|Ввести время встречи)/;
const MENU_BUTTON_PATTERN = /^(Actions for|Действия:)/;

export type Box = { x: number; y: number; width: number; height: number };

export const rightOf = (box: Box) => box.x + box.width;
export const bottomOf = (box: Box) => box.y + box.height;

export const menuButtonOf = (row: Locator) =>
  row.getByRole("button", { name: MENU_BUTTON_PATTERN });
export const menuDotsOf = (row: Locator) => menuButtonOf(row).locator("svg");
export const timeButtonOf = (row: Locator) =>
  row.getByRole("button", { name: WALL_TIME_PATTERN }).first();
export const meetingTimeOf = (row: Locator) =>
  row.getByRole("button", { name: MEETING_TIME_PATTERN }).first();

export async function rowsOf(page: Page) {
  const rows = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("button", { name: MENU_BUTTON_PATTERN }) });
  await expect(rows.first()).toBeVisible();
  return rows.all();
}

export const isGridView = async (page: Page) =>
  (await page.locator(GRID_PANEL_SELECTOR).count()) > 0;

const pixelsOf = (cssValue: string) => Number.parseFloat(cssValue);

const borderAndPaddingRight = (row: Locator) =>
  row.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      border: style.borderRightWidth,
      padding: style.paddingRight,
    };
  });

/** The row's right content edge: a card minus border and padding, a Grid row's sticky header box. */
export async function contentRightEdge(page: Page, row: Locator) {
  if (await isGridView(page)) {
    return rightOf(
      await requireBox(row.locator(STICKY_HEADER_SELECTOR).first()),
    );
  }
  const { border, padding } = await borderAndPaddingRight(row);
  return rightOf(await requireBox(row)) - pixelsOf(border) - pixelsOf(padding);
}

/** The right border: a card's, or the Grid panel's (never the row, which has none). */
export async function rightBorderEdge(page: Page, row: Locator) {
  const container = (await isGridView(page))
    ? page.locator(GRID_PANEL_SELECTOR)
    : row;
  const { border } = await borderAndPaddingRight(container);
  return rightOf(await requireBox(container)) - pixelsOf(border);
}

/** The box a button must stay inside: its card or the Grid panel. */
export async function containerBoxOf(page: Page, row: Locator) {
  return requireBox(
    (await isGridView(page)) ? page.locator(GRID_PANEL_SELECTOR) : row,
  );
}

export const overlapsBy = (first: Box, second: Box) =>
  Math.min(rightOf(first), rightOf(second)) - Math.max(first.x, second.x) >
    LAYOUT_TOLERANCE_PX &&
  Math.min(bottomOf(first), bottomOf(second)) - Math.max(first.y, second.y) >
    LAYOUT_TOLERANCE_PX;

export const centreOfBoxY = (box: Box) => box.y + box.height / HALF;
export const centreOfBoxX = (box: Box) => box.x + box.width / HALF;

/** The row's neighbours of the button: time, date, city, offset difference and zone line. */
export const neighboursOf = (page: Page, city: string): Locator[] => {
  const row = listRow(page, city);
  return [
    timeButtonOf(row),
    dateOf(page, city),
    cityOf(page, city),
    row.locator(OFFSET_DIFFERENCE_SELECTOR).first(),
    zoneLineOf(page, city),
  ];
};
