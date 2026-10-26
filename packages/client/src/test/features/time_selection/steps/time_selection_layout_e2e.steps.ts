import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  barOf,
  centreOfBox,
  hourLabelsOf,
  readTokenStyle,
  requireBox,
  timeTextOf,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";

const { Then } = createBdd(test);

const TOLERANCE_PX = 1;
const CITY_LINE_SELECTOR = "span.font-semibold";

// Verifies NFR-R2 of add-time-sliders-to-location-cards: the track takes its own line.
Then(
  "the track of {string} is below its city and time and spans the card's content width",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const bar = await requireBox(barOf(page, city));
    const time = await requireBox(timeTextOf(page, city));
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
    expect(bar.y).toBeGreaterThanOrEqual(time.y + time.height - TOLERANCE_PX);
    expect(
      Math.abs(bar.width - (card.width - cardEdges.left - cardEdges.right)),
    ).toBeLessThanOrEqual(TOLERANCE_PX);
  },
);

// Verifies NFR-R2, UX3 of add-time-sliders-to-location-cards: the track sits on the city line.
Then(
  "the track of {string} is right of its time column on the same line with its hour labels under it",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const bar = await requireBox(barOf(page, city));
    const time = await requireBox(timeTextOf(page, city));
    const cityLine = await requireBox(
      listRow(page, city).locator(CITY_LINE_SELECTOR).first(),
    );
    const barCentreY = centreOfBox(bar).y;
    expect(bar.x).toBeGreaterThanOrEqual(time.x + time.width - TOLERANCE_PX);
    expect(barCentreY).toBeGreaterThanOrEqual(cityLine.y);
    expect(barCentreY).toBeLessThanOrEqual(cityLine.y + cityLine.height);
    const labels = hourLabelsOf(page, city);
    await expect(labels).toHaveCount(5);
    for (const label of await labels.all()) {
      const labelBox = await requireBox(label);
      expect(labelBox.y).toBeGreaterThanOrEqual(
        bar.y + bar.height - TOLERANCE_PX,
      );
    }
  },
);

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
