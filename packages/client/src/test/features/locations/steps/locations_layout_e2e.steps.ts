import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";
import { SCREEN_HEIGHT_PX } from "./locationsE2eHelpers";

const { Given, Then } = createBdd(test);

const SEARCH_DIALOG_ROLE = "dialog";
const CENTER_TOLERANCE_PX = 1;
const HALF = 2;
const SCREENSHOT_NAME_SEPARATOR = "-";
const DEPLOY_TIME_SCREENSHOT_STYLE =
  "[data-deploy-time], [data-zone-rules-release] { visibility: hidden; }";

// Verifies NFR-R1 of add-locations-via-search.
Given(
  "the screen is {int} px wide for the locations",
  async ({ locationsWorld }, screenWidth: number) => {
    await locationsWorld.page.setViewportSize({
      width: screenWidth,
      height: SCREEN_HEIGHT_PX,
    });
  },
);

Then(
  "the locations screen does not scroll horizontally",
  async ({ locationsWorld }) => {
    const pageWidths = await locationsWorld.page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(pageWidths.scrollWidth).toBeLessThanOrEqual(pageWidths.clientWidth);
  },
);

Then("the search fills the screen", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const dialogBox = await page.getByRole(SEARCH_DIALOG_ROLE).boundingBox();
  const viewport = page.viewportSize();
  expect(dialogBox).toMatchObject({
    x: 0,
    y: 0,
    width: viewport?.width,
    height: viewport?.height,
  });
});

Then("the search is a centered dialog", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const dialogBox = await page.getByRole(SEARCH_DIALOG_ROLE).boundingBox();
  const viewport = page.viewportSize();
  if (!dialogBox || !viewport) throw new Error("The search has no box");
  expect(dialogBox.width).toBeLessThan(viewport.width);
  expect(
    Math.abs(dialogBox.x + dialogBox.width / HALF - viewport.width / HALF),
  ).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
  expect(
    Math.abs(dialogBox.y + dialogBox.height / HALF - viewport.height / HALF),
  ).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
});

// Verifies NFR-R2 of add-locations-via-search: baselines live under __screenshots__.
Then(
  "the locations screen matches the approved screenshot",
  async ({ locationsWorld, $test }) => {
    const screenshotName = $test
      .info()
      .title.replace(/[^A-Za-z0-9]+/g, SCREENSHOT_NAME_SEPARATOR);
    // Verifies NFR-R1 of support-legacy-ios-12-safari: approved baselines pass unchanged with the legacy CSS fallbacks
    // Verifies NFR-R2 of polish-settings-and-remove-offline-update-notice: the deploy time text is hidden, its line keeps its box
    // Verifies NFR-R1 of add-remote-zone-rules-updates: the zone rules release line is hidden the same way
    await locationsWorld.page.addStyleTag({
      content: DEPLOY_TIME_SCREENSHOT_STYLE,
    });
    await expect(locationsWorld.page).toHaveScreenshot(`${screenshotName}.png`);
  },
);
