// Verifies FR17, NFR-R1, UX3 of redesign-cards-grid-and-day-palettes: the redesigned hour cells.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { cellsOf } from "./hourGridE2eHelpers";

const { Then } = createBdd(test);

const CELL_RADIUS_PX = 5;
const CELL_DIGITS_PX = 15;
const CELL_GAP_PX = 3;
const CELL_WIDTH_ON_PHONE_PX = 38;
const SUBPIXEL_TOLERANCE_PX = 0.5;
const FIRST_CITY = "Almaty";
const DIGITS_SELECTOR = ".text-grid-cell";

Then(
  "every hour cell has a 5 px radius, 15 px digits and is {int} px high",
  async ({ locationsWorld }, height: number) => {
    const cells = cellsOf(locationsWorld.page, FIRST_CITY);
    await expect(cells.first()).toBeVisible();
    for (const cell of await cells.all()) {
      await expect(cell).toHaveCSS(
        "border-top-left-radius",
        `${CELL_RADIUS_PX}px`,
      );
      await expect(cell.locator(DIGITS_SELECTOR).first()).toHaveCSS(
        "font-size",
        `${CELL_DIGITS_PX}px`,
      );
      await expect(cell).toHaveCSS("height", `${height}px`);
    }
  },
);

Then(
  "neighbouring cells of a row are 3 px apart",
  async ({ locationsWorld }) => {
    const cells = await cellsOf(locationsWorld.page, FIRST_CITY).all();
    for (let index = 1; index < cells.length; index += 1) {
      const previous = await cells[index - 1].boundingBox();
      const current = await cells[index].boundingBox();
      expect(
        Math.abs(
          (current?.x ?? 0) -
            ((previous?.x ?? 0) + (previous?.width ?? 0)) -
            CELL_GAP_PX,
        ),
      ).toBeLessThanOrEqual(SUBPIXEL_TOLERANCE_PX);
    }
  },
);

Then(
  "every hour cell is 38 px wide and the strip scrolls horizontally",
  async ({ locationsWorld }) => {
    const cells = cellsOf(locationsWorld.page, FIRST_CITY);
    await expect(cells.first()).toBeVisible();
    for (const cell of await cells.all()) {
      const box = await cell.boundingBox();
      expect(box?.width).toBe(CELL_WIDTH_ON_PHONE_PX);
    }
    const isScrollable = await cells.first().evaluate((cell) => {
      for (
        let ancestor = cell.parentElement;
        ancestor !== null;
        ancestor = ancestor.parentElement
      ) {
        if (ancestor.scrollWidth > ancestor.clientWidth) return true;
      }
      return false;
    });
    expect(isScrollable).toBe(true);
  },
);
