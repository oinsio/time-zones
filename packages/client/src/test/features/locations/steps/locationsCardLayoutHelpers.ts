// Verifies FR7, FR8, FR10, FR11, NFR-R1, UX1 of redesign-cards-grid-and-day-palettes: shared card layout helpers.
import { expect, type Locator, type Page } from "@playwright/test";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { listRow } from "./locationsE2eHelpers";

export const ZONE_LINE_SELECTOR = "[data-zone-line]";
export const DAY_PERIOD_MARKER_SELECTOR = ".text-card-marker";
export const TIME_BUTTON_NAME = /^Enter time|^Ввести время/;
export const CARD_RADIUS_PX = 14;
export const CARD_BORDER_WIDTH_PX = 1;
export const CARD_GAP_PX = 12;
export const MARK_SIZE_PX = 23;
export const MARKER_SIZE_PX = 14;
export const MARKER_GAP_PX = 4;
export const LAYOUT_TOLERANCE_PX = 1;
export const SAME_LINE_TOLERANCE_PX = 4;
export const BOLD_WEIGHT = "700";
export const DIFFERENCE_WEIGHT = "600";
export const DIFFERENCE_SIZE_PX = 16;
export const CARD_PADDING_CLASS_TOLERANCE_PX = 24;

export const cityOf = (page: Page, city: string) =>
  listRow(page, city).getByText(city, { exact: true }).first();
export const timeOf = (page: Page, city: string) =>
  listRow(page, city).getByRole("button", { name: TIME_BUTTON_NAME });
export const dateOf = (page: Page, city: string) =>
  listRow(page, city).locator("time").first();
export const zoneLineOf = (page: Page, city: string) =>
  listRow(page, city).locator(ZONE_LINE_SELECTOR).first();

export const centreY = async (locator: Locator) => {
  const box = await requireBox(locator);
  return box.y + box.height / 2;
};
export const onOneLine = async (locators: Locator[]) => {
  const centres = await Promise.all(locators.map(centreY));
  expect(Math.max(...centres) - Math.min(...centres)).toBeLessThanOrEqual(
    SAME_LINE_TOLERANCE_PX * 2,
  );
};
