import { expect } from "@playwright/test";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  HOUR_LABEL_SELECTOR,
  hourLabelsOf,
  requireBox,
} from "./timeSelectionE2eHelpers";
import { wallTimeButtonOf } from "./wallTimeE2eHelpers";

/** Implements FR1, FR5 of fix-location-card-and-header-layout (E2E helpers). */
export const TOLERANCE_PX = 1;
export const HOUR_LABEL_ROW_HEIGHT_PX = 16;
export const TIME_COLUMN_XPATH = "xpath=..";
export const MENU_BUTTON_SELECTOR = "button[aria-haspopup]";
export const TRACK_SELECTOR = "[data-day-track-bar]";

export const parseCities = (quotedNames: string) =>
  [...quotedNames.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

export const boxesOfCard = async (
  page: Parameters<typeof listRow>[0],
  city: string,
) => {
  const row = listRow(page, city);
  return {
    city: await requireBox(row.getByText(city, { exact: true }).first()),
    time: await requireBox(wallTimeButtonOf(page, city)),
    track: await requireBox(row.locator(TRACK_SELECTOR)),
    menu: await requireBox(row.locator(MENU_BUTTON_SELECTOR).last()),
  };
};

/** The vertical spread of the text lines of a time button and whether it clips. */
export const measureTimeButton = (
  page: Parameters<typeof listRow>[0],
  city: string,
) =>
  wallTimeButtonOf(page, city).evaluate((button) => {
    const range = document.createRange();
    range.selectNodeContents(button);
    const tops = [...range.getClientRects()].map((rect) => rect.top);
    return {
      lineSpread: Math.max(...tops) - Math.min(...tops),
      isClipped: button.scrollWidth > button.clientWidth,
    };
  });

/** Every hour label of the card is one line high and the last ends at the track's right edge. */
export const expectHourLabelsOnOneLine = async (
  page: Parameters<typeof listRow>[0],
  city: string,
) => {
  await expect(hourLabelsOf(page, city).first()).toBeVisible();
  const labels = await hourLabelsOf(page, city).all();
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect((await requireBox(label)).height).toBeLessThanOrEqual(
      HOUR_LABEL_ROW_HEIGHT_PX,
    );
  }
  const bar = await requireBox(listRow(page, city).locator(TRACK_SELECTOR));
  const last = await requireBox(
    listRow(page, city).locator(HOUR_LABEL_SELECTOR).last(),
  );
  expect(
    Math.abs(last.x + last.width - (bar.x + bar.width)),
  ).toBeLessThanOrEqual(TOLERANCE_PX);
};
