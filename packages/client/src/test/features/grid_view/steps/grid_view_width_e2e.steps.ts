import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  cellOf,
  cellsOf,
  frameOf,
  panelOf,
  requireBox,
} from "./hourGridE2eHelpers";

const { When, Then } = createBdd(test);

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const HOURS_PER_DAY = 24;
const LAST_COLUMN = HOURS_PER_DAY - 1;
const MIN_NARROW_CELL_PX = 36;
const MAX_NARROW_CELL_PX = 40;
const MIN_VISIBLE_CELLS = 8;
const MAX_VISIBLE_CELLS = 10;
const PIXEL_TOLERANCE = 1;
const SCROLL_TO_END = (element: HTMLElement) => {
  element.scrollLeft = element.scrollWidth;
};

// Verifies NFR-R1 of add-grid-hour-cells-and-hour-frame.
Then(
  "all 24 cells of every row are inside the panel and the strips do not scroll",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    for (const city of ALL_CITIES) {
      await expect(cellsOf(page, city)).toHaveCount(HOURS_PER_DAY);
      const firstBox = await requireBox(cellOf(page, city, 0));
      const lastBox = await requireBox(cellOf(page, city, LAST_COLUMN));
      expect(firstBox.x).toBeGreaterThanOrEqual(panelBox.x);
      expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(
        panelBox.x + panelBox.width + PIXEL_TOLERANCE,
      );
    }
    const scrollSizes = await panelOf(page).evaluate((panel) => ({
      scrollWidth: panel.scrollWidth,
      clientWidth: panel.clientWidth,
    }));
    expect(scrollSizes.scrollWidth).toBeLessThanOrEqual(
      scrollSizes.clientWidth,
    );
  },
);

// Verifies NFR-R2 of add-grid-hour-cells-and-hour-frame.
Then(
  "every cell is 36 to 40 px wide and 8 to 10 cells of each row are visible",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    for (const city of ALL_CITIES) {
      const cellBoxes = [];
      for (let column = 0; column < HOURS_PER_DAY; column++) {
        cellBoxes.push(await requireBox(cellOf(page, city, column)));
      }
      for (const box of cellBoxes) {
        expect(box.width + 2).toBeGreaterThanOrEqual(MIN_NARROW_CELL_PX);
        expect(box.width + 2).toBeLessThanOrEqual(MAX_NARROW_CELL_PX);
      }
      const visibleCount = cellBoxes.filter(
        (box) =>
          box.x >= panelBox.x - PIXEL_TOLERANCE &&
          box.x + box.width <= panelBox.x + panelBox.width + PIXEL_TOLERANCE,
      ).length;
      expect(visibleCount).toBeGreaterThanOrEqual(MIN_VISIBLE_CELLS);
      expect(visibleCount).toBeLessThanOrEqual(MAX_VISIBLE_CELLS);
    }
  },
);

Then("the hour frame is fully visible", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(async () => {
      const panelBox = await requireBox(panelOf(page));
      const frameBox = await requireBox(frameOf(page));
      return (
        frameBox.x >= panelBox.x - PIXEL_TOLERANCE &&
        frameBox.x + frameBox.width <=
          panelBox.x + panelBox.width + PIXEL_TOLERANCE
      );
    })
    .toBe(true);
});

// Verifies NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame.
When(
  "the user scrolls the strip of {string} to its end",
  async ({ locationsWorld }, city: string) => {
    // The strips share one scrolling panel; scrolling the strip's panel scrolls them all.
    await sliderOf(locationsWorld.page, city)
      .locator("xpath=ancestor::ul[1]")
      .evaluate(SCROLL_TO_END);
  },
);

Then(
  /^all four strips show their last cell and the city of "([^"]+)" stays at its place$/,
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const cityText = listRow(page, city).getByText(city, { exact: true });
    const cityBoxBefore = await requireBox(cityText);
    const panelBox = await requireBox(panelOf(page));
    for (const rowCity of ALL_CITIES) {
      const lastBox = await requireBox(cellOf(page, rowCity, LAST_COLUMN));
      expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(
        panelBox.x + panelBox.width + PIXEL_TOLERANCE,
      );
      expect(lastBox.x).toBeGreaterThanOrEqual(panelBox.x);
    }
    const cityBoxAfter = await requireBox(cityText);
    expect(cityBoxAfter.x).toBeCloseTo(cityBoxBefore.x, 0);
  },
);

// Verifies NFR-R2 of add-grid-hour-cells-and-hour-frame: End moves the frame to the last column.
When(
  "the user focuses the hour strip of {string} and presses End",
  async ({ locationsWorld }, city: string) => {
    await sliderOf(locationsWorld.page, city).focus();
    await locationsWorld.page.keyboard.press("End");
  },
);
