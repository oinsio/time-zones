import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { LOCATION_MENU_OFFSET_PX } from "@/constants";
import { isTopmostAt } from "../../grid_view/steps/hourGridE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import {
  type Box,
  bottomOf,
  menuButtonOf,
  rowsOf,
} from "./locationsMenuButtonHelpers";

const { When, Then } = createBdd(test);

const MENU_ROLE = "menu";
const MENU_ITEM_ROLE = "menuitem";
const ARROW_DOWN_KEY = "ArrowDown";
const HALF = 2;
const ADJACENT_TOLERANCE_PX = 1;
const noted = new WeakMap<Page, { x: number; y: number }>();

const rowButton = async (page: Page, position: "first" | "last" | "middle") => {
  const rows = await rowsOf(page);
  const row =
    position === "first"
      ? rows[0]
      : position === "last"
        ? rows[rows.length - 1]
        : rows[Math.floor(rows.length / HALF)];
  return menuButtonOf(row);
};
const viewportHeightOf = (page: Page) => page.viewportSize()?.height ?? 0;
const readScroll = (page: Page) =>
  page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
const isAbove = (menuBox: Box, buttonBox: Box) =>
  bottomOf(menuBox) <= buttonBox.y + ADJACENT_TOLERANCE_PX;

// Verifies FR1, FR4 of keep-location-menu-in-view-and-clear-range-after-share.
When("the page scroll offset is noted", async ({ locationsWorld }) => {
  noted.set(locationsWorld.page, await readScroll(locationsWorld.page));
});

// Verifies FR4, M2 of keep-location-menu-in-view-and-clear-range-after-share.
Then(
  "the page scroll offset is the same as before the menu opened",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    expect(await readScroll(page)).toEqual(noted.get(page));
  },
);

// Verifies FR1 of keep-location-menu-in-view-and-clear-range-after-share.
When(
  /^the user opens the location menu of the (first|last|middle) row$/,
  async ({ locationsWorld }, position: "first" | "last" | "middle") => {
    await (await rowButton(locationsWorld.page, position)).click();
    await expect(locationsWorld.page.getByRole(MENU_ROLE)).toBeVisible();
  },
);

const openMenuButtonBox = async (page: Page, button?: Locator) =>
  requireBox(button ?? page.locator('[aria-expanded="true"]'));

// Verifies FR1, M1 of keep-location-menu-in-view-and-clear-range-after-share.
Then("the menu lies above its button", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const buttonBox = await openMenuButtonBox(page);
  const menuBox = await requireBox(page.getByRole(MENU_ROLE));
  expect(isAbove(menuBox, buttonBox)).toBe(true);
});

// Verifies FR3 of keep-location-menu-in-view-and-clear-range-after-share.
When(
  /^the page is scrolled by (\d+) px$/,
  async ({ locationsWorld }, distance: string) => {
    await locationsWorld.page.evaluate(
      (pixels) => window.scrollBy(0, pixels),
      Number(distance),
    );
  },
);

// Verifies FR3 of keep-location-menu-in-view-and-clear-range-after-share.
Then("the menu stays next to its button", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(async () => {
      const buttonBox = await openMenuButtonBox(page);
      const menuBox = await requireBox(page.getByRole(MENU_ROLE));
      const gapBelow = menuBox.y - bottomOf(buttonBox);
      return (
        Math.abs(gapBelow - LOCATION_MENU_OFFSET_PX) <= ADJACENT_TOLERANCE_PX ||
        Math.abs(buttonBox.y - bottomOf(menuBox) - LOCATION_MENU_OFFSET_PX) <=
          ADJACENT_TOLERANCE_PX
      );
    })
    .toBe(true);
});

// Verifies FR2 of keep-location-menu-in-view-and-clear-range-after-share.
When(
  "the page is scrolled so that a row's location menu button is in the middle of the viewport",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const buttonBox = await requireBox(await rowButton(page, "middle"));
    await page.evaluate(
      (distance) => window.scrollBy(0, distance),
      buttonBox.y + buttonBox.height / HALF - viewportHeightOf(page) / HALF,
    );
  },
);

// Verifies FR2, NFR-A2, UX2 of keep-location-menu-in-view-and-clear-range-after-share.
Then(
  "the menu items can be reached one by one with the arrow keys inside the screen",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const items = page.getByRole(MENU_ITEM_ROLE);
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
    for (let index = 0; index < itemCount; index += 1) {
      await expect(items.nth(index)).toBeFocused();
      const itemBox = await requireBox(items.nth(index));
      expect(itemBox.y).toBeGreaterThanOrEqual(0);
      expect(bottomOf(itemBox)).toBeLessThanOrEqual(viewportHeightOf(page));
      await page.keyboard.press(ARROW_DOWN_KEY);
    }
  },
);

// Verifies FR1, M1 of keep-location-menu-in-view-and-clear-range-after-share.
Then("the menu lies under its button", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const buttonBox = await openMenuButtonBox(page);
  const menuBox = await requireBox(page.getByRole(MENU_ROLE));
  expect(menuBox.y).toBeGreaterThanOrEqual(bottomOf(buttonBox));
});

// Verifies NFR-A1 of keep-location-menu-in-view-and-clear-range-after-share.
Then(
  "every menu item inside the visible menu has that menu item on top",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const menuBox = await requireBox(page.getByRole(MENU_ROLE));
    const items = await page.getByRole(MENU_ITEM_ROLE).all();
    let checkedCount = 0;
    for (const item of items) {
      const itemBox = await requireBox(item);
      const centre = {
        x: itemBox.x + itemBox.width / HALF,
        y: itemBox.y + itemBox.height / HALF,
      };
      const isInsideVisibleBox =
        centre.y >= Math.max(menuBox.y, 0) &&
        centre.y <= Math.min(bottomOf(menuBox), viewportHeightOf(page));
      if (!isInsideVisibleBox) continue;
      checkedCount += 1;
      expect(await isTopmostAt(item, centre)).toBe(true);
    }
    expect(checkedCount).toBeGreaterThan(0);
  },
);
