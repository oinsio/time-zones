import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { languageButton } from "./settingsLanguageE2eHelpers";

const { Then } = createBdd(test);

const RELEASE_LINE_SELECTOR = "[data-zone-rules-release]";
const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const COLOR_PROPERTY = "color";
const LINE_HEIGHT_PROPERTY = "line-height";
const TAB_KEY = "Tab";
const TAB_PRESSES_FROM_LANGUAGE_BUTTON = 4;
const SUBPIXEL_TOLERANCE_PX = 1;

// Verifies NFR-A1, UX3 of add-remote-zone-rules-updates: the colour of the deploy time.
Then(
  "the zone rules release line has the colour of the deploy time",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const deployTimeColor = await page
      .locator(DEPLOY_TIME_SELECTOR)
      .evaluate(
        (element, property) =>
          getComputedStyle(element).getPropertyValue(property),
        COLOR_PROPERTY,
      );
    await expect(page.locator(RELEASE_LINE_SELECTOR)).toHaveCSS(
      COLOR_PROPERTY,
      deployTimeColor,
    );
  },
);

// Verifies NFR-A1 of add-remote-zone-rules-updates: plain text, no Tab stop.
Then(
  "the zone rules release line is not a Tab stop",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await languageButton(page).focus();
    for (let press = 0; press < TAB_PRESSES_FROM_LANGUAGE_BUTTON; press += 1) {
      await page.keyboard.press(TAB_KEY);
      await expect(page.locator(RELEASE_LINE_SELECTOR)).not.toBeFocused();
    }
  },
);

// Verifies NFR-R1, UX3 of add-remote-zone-rules-updates: one line.
Then(
  "the zone rules release line takes one line",
  async ({ locationsWorld }) => {
    const releaseLine = locationsWorld.page.locator(RELEASE_LINE_SELECTOR);
    const lineHeight = await releaseLine.evaluate(
      (element, property) =>
        getComputedStyle(element).getPropertyValue(property),
      LINE_HEIGHT_PROPERTY,
    );
    const box = await releaseLine.boundingBox();
    expect(box?.height).toBeLessThanOrEqual(
      Number.parseFloat(lineHeight) + SUBPIXEL_TOLERANCE_PX,
    );
  },
);
