import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { BACK_BUTTON_NAME, BUTTON_ROLE } from "./settingsE2eHelpers";
import { languageButton } from "./settingsLanguageE2eHelpers";

const { Then } = createBdd(test);

const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const COLOR_PROPERTY = "color";
const LINE_HEIGHT_PROPERTY = "line-height";
const TAB_KEY = "Tab";
const TAB_PRESSES_FROM_LANGUAGE_BUTTON = 4;
const SUBPIXEL_TOLERANCE_PX = 1;

// Verifies NFR-A1 of polish-settings-and-remove-offline-update-notice: the colour of the icons.
Then(
  "the deploy time has the colour of the back button's icon",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const iconColor = await page
      .getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME })
      .locator("svg")
      .evaluate(
        (icon, property) => getComputedStyle(icon).getPropertyValue(property),
        COLOR_PROPERTY,
      );
    await expect(page.locator(DEPLOY_TIME_SELECTOR)).toHaveCSS(
      COLOR_PROPERTY,
      iconColor,
    );
  },
);

// Verifies NFR-A1 of polish-settings-and-remove-offline-update-notice: plain text, no Tab stop.
Then("the deploy time is not a Tab stop", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await languageButton(page).focus();
  for (let press = 0; press < TAB_PRESSES_FROM_LANGUAGE_BUTTON; press += 1) {
    await page.keyboard.press(TAB_KEY);
    await expect(page.locator(DEPLOY_TIME_SELECTOR)).not.toBeFocused();
  }
});

// Verifies NFR-R1 of polish-settings-and-remove-offline-update-notice: one line.
Then("the deploy time takes one line", async ({ locationsWorld }) => {
  const deployTime = locationsWorld.page.locator(DEPLOY_TIME_SELECTOR);
  const lineHeight = await deployTime.evaluate(
    (element, property) => getComputedStyle(element).getPropertyValue(property),
    LINE_HEIGHT_PROPERTY,
  );
  const box = await deployTime.boundingBox();
  expect(box?.height).toBeLessThanOrEqual(
    Number.parseFloat(lineHeight) + SUBPIXEL_TOLERANCE_PX,
  );
});
