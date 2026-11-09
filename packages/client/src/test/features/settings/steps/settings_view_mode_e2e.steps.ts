// Verifies FR4, FR5, NFR-A1, UX1 of add-view-mode-setting-and-grid-skeleton.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  RADIO_ROLE,
  RADIOGROUP_ROLE,
} from "./settingsE2eHelpers";

const { When, Then } = createBdd(test);

const VIEW_GROUP_NAME = /^(View|Вид)$/;
const GRID_VIEW_SELECTOR = '[data-view-id="grid"]';
const MIN_TAB_PRESSES = 40;
const TAB_KEY = "Tab";
const LANDSCAPE_WIDTH_PX = 844;
const LANDSCAPE_HEIGHT_PX = 390;

const viewGroup = (page: Page) =>
  page.getByRole(RADIOGROUP_ROLE, { name: VIEW_GROUP_NAME });
const viewLabels = (group: Locator) =>
  group.locator("label").filter({ has: group.page().getByRole(RADIO_ROLE) });

Then(
  "the view options are named {string} and {string}, in this order",
  async ({ locationsWorld }, first: string, second: string) => {
    await expect(viewLabels(viewGroup(locationsWorld.page))).toHaveText([
      first,
      second,
    ]);
  },
);

Then(
  "the option {string} of the view group is checked",
  async ({ locationsWorld }, name: string) => {
    await expect(
      viewGroup(locationsWorld.page).getByRole(RADIO_ROLE, { name }),
    ).toBeChecked();
  },
);

When("the user tabs to the view group", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const viewRadios = viewGroup(page).getByRole(RADIO_ROLE);
  for (let pressCount = 0; pressCount < MIN_TAB_PRESSES; pressCount += 1) {
    await page.keyboard.press(TAB_KEY);
    if (
      await viewRadios.evaluateAll((radios) =>
        radios.includes(document.activeElement as HTMLInputElement),
      )
    ) {
      return;
    }
  }
  throw new Error("the view group never received the focus");
});

Then(
  "every view option is at least {int} by {int} px",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    for (const label of await viewLabels(
      viewGroup(locationsWorld.page),
    ).all()) {
      const box = await label.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(minWidth);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight);
    }
  },
);

Then(
  "the checked view option is filled with the accent colour",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const accentColour = await page
      .getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME })
      .locator("svg")
      .evaluate((element) => getComputedStyle(element).color);
    const checkedLabel = viewLabels(viewGroup(page)).filter({
      has: page.locator("input:checked"),
    });
    await expect(checkedLabel).toHaveCount(1);
    await expect(checkedLabel).toHaveCSS("background-color", accentColour);
  },
);

When("the phone is turned to landscape", async ({ locationsWorld }) => {
  await locationsWorld.page.setViewportSize({
    width: LANDSCAPE_WIDTH_PX,
    height: LANDSCAPE_HEIGHT_PX,
  });
});

Then("the main page still shows the Grid view", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.locator(GRID_VIEW_SELECTOR)).toBeVisible();
});
