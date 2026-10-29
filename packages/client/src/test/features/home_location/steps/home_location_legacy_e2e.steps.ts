import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { menuButton } from "../../locations/steps/locationsE2eHelpers";
import {
  centreOf,
  dispatchTouch,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";

const { When, Then } = createBdd(test);

const MENU_ROLE = "menu";
const OUTSIDE_TAP_POINT = { x: 1, y: 1 };

/** A finger touching and lifting at the centre of an element. */
async function tap(page: Page, locatorCentre: { x: number; y: number }) {
  const session = await startTouch(page);
  await dispatchTouch(session, "touchStart", locatorCentre);
  await dispatchTouch(session, "touchEnd");
}

// Verifies FR14 of set-home-location-and-show-differences: taps reach the menu without Pointer Events.
When(
  "the user taps the location menu button of {string}",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await tap(page, await centreOf(menuButton(page, cityName)));
    await expect(page.getByRole(MENU_ROLE)).toBeVisible();
  },
);

When(
  "the user taps the location menu button of {string} and then {string}",
  async ({ locationsWorld }, cityName: string, itemName: string) => {
    const { page } = locationsWorld;
    await tap(page, await centreOf(menuButton(page, cityName)));
    await tap(
      page,
      await centreOf(page.getByRole("menuitem", { name: itemName })),
    );
  },
);

When("the user taps outside the menu", async ({ locationsWorld }) => {
  await tap(locationsWorld.page, OUTSIDE_TAP_POINT);
});

Then("the menu is closed", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.getByRole(MENU_ROLE)).toBeHidden();
});
