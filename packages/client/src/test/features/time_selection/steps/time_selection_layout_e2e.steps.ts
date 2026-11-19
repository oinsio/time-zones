import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow, menuButton } from "../../locations/steps/locationsE2eHelpers";
import {
  barOf,
  hourLabelsOf,
  readTokenStyle,
  requireBox,
  timeTextOf,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";

const { Then } = createBdd(test);

const TOLERANCE_PX = 1;
const HOUR_LABEL_COUNT = 5;

const cardContentWidthOf = async (page: Page, city: string) => {
  const card = await requireBox(listRow(page, city));
  const cardEdges = await listRow(page, city).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      left:
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.borderLeftWidth),
      right:
        Number.parseFloat(style.paddingRight) +
        Number.parseFloat(style.borderRightWidth),
    };
  });
  return card.width - cardEdges.left - cardEdges.right;
};

// Verifies FR13, UX1 of redesign-cards-grid-and-day-palettes: the track under the zone line and the date.
Then(
  "the track of {string} is below its zone line and date and spans the card's content width",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const bar = await requireBox(barOf(page, city));
    const zoneLine = await requireBox(
      listRow(page, city).locator("[data-zone-line]").first(),
    );
    const date = await requireBox(listRow(page, city).locator("time").first());
    expect(bar.y).toBeGreaterThanOrEqual(
      Math.max(zoneLine.y + zoneLine.height, date.y + date.height) -
        TOLERANCE_PX,
    );
    expect(
      Math.abs(bar.width - (await cardContentWidthOf(page, city))),
    ).toBeLessThanOrEqual(TOLERANCE_PX);
  },
);

// Verifies FR13, UX1 of redesign-cards-grid-and-day-palettes: the track on its own line, labels under it.
Then(
  "the track of {string} is below the line of its city and time, spans the card's content width and has its hour labels under it",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const bar = await requireBox(barOf(page, city));
    const time = await requireBox(timeTextOf(page, city));
    const menu = await requireBox(menuButton(page, city));
    expect(bar.y).toBeGreaterThanOrEqual(
      Math.max(time.y + time.height, menu.y + menu.height) - TOLERANCE_PX,
    );
    expect(
      Math.abs(bar.width - (await cardContentWidthOf(page, city))),
    ).toBeLessThanOrEqual(TOLERANCE_PX);
    const labels = hourLabelsOf(page, city);
    await expect(labels).toHaveCount(HOUR_LABEL_COUNT);
    for (const label of await labels.all()) {
      const labelBox = await requireBox(label);
      expect(labelBox.y).toBeGreaterThanOrEqual(
        bar.y + bar.height - TOLERANCE_PX,
      );
    }
  },
);

// Verifies FR13 of redesign-cards-grid-and-day-palettes: the handle border by theme.
Then(
  "the visible handle of {string} has a border of {int} px in the colour {string}",
  async ({ locationsWorld }, city: string, width: number, colour: string) => {
    const handle = visibleHandleOf(locationsWorld.page, city);
    await expect(handle).toHaveCSS("border-top-width", `${width}px`);
    await expect(handle).toHaveCSS("border-top-color", hexToRgb(colour));
  },
);

const HEX_RADIX = 16;
const hexToRgb = (hex: string): string =>
  `rgb(${[1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), HEX_RADIX))
    .join(", ")})`;

// Verifies NFR-R2, UX1 of add-time-sliders-to-location-cards: bar height and visible handle size.
Then(
  "the track of {string} is {int} px high and its visible handle {int} px wide",
  async (
    { locationsWorld },
    city: string,
    barHeight: number,
    handleWidth: number,
  ) => {
    const { page } = locationsWorld;
    expect((await requireBox(barOf(page, city))).height).toBe(barHeight);
    expect((await requireBox(visibleHandleOf(page, city))).width).toBe(
      handleWidth,
    );
  },
);

// Verifies UX3 of add-time-sliders-to-location-cards: muted text with tabular figures.
Then(
  "the hour labels of {string} are muted text with tabular figures",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const mutedColour = await readTokenStyle(
      page,
      "color",
      "--color-muted-foreground",
    );
    for (const label of await hourLabelsOf(page, city).all()) {
      await expect(label).toHaveCSS("color", mutedColour);
      const numericVariant = await label.evaluate(
        (element) => getComputedStyle(element).fontVariantNumeric,
      );
      expect(numericVariant).toContain("tabular-nums");
    }
  },
);

// Verifies FR4, UX1 of fix-day-track-handle-overlap-and-end-of-day: the handle covers nothing.
Then(
  "the handle of {string} lies inside its card and clear of its time and its menu",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const card = await requireBox(listRow(page, city));
    const visibleHandle = await requireBox(visibleHandleOf(page, city));
    const time = await requireBox(timeTextOf(page, city));
    const menu = await requireBox(menuButton(page, city));
    expect(visibleHandle.x).toBeGreaterThanOrEqual(card.x - TOLERANCE_PX);
    expect(visibleHandle.x + visibleHandle.width).toBeLessThanOrEqual(
      card.x + card.width + TOLERANCE_PX,
    );
    for (const covered of [time, menu]) {
      const overlapsHorizontally =
        visibleHandle.x < covered.x + covered.width - TOLERANCE_PX &&
        visibleHandle.x + visibleHandle.width > covered.x + TOLERANCE_PX;
      const overlapsVertically =
        visibleHandle.y < covered.y + covered.height - TOLERANCE_PX &&
        visibleHandle.y + visibleHandle.height > covered.y + TOLERANCE_PX;
      expect(overlapsHorizontally && overlapsVertically).toBe(false);
    }
  },
);
