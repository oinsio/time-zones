// Verifies FR4, M1, NFR-A1 of apply-data-updates-silently: the settings page and the accessibility of the update notice in a real browser.
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./app_shell_silent_update_e2e.fixtures";
import { deployClockOf } from "./silentUpdatePage";
import { SiteBuild } from "./silentUpdateSite";

const { Then } = createBdd(test);

const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const SETTINGS_BUTTON_NAME = "Settings";

Then(
  "the settings page names the deploy time of the data-only build",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    await page.getByRole("button", { name: SETTINGS_BUTTON_NAME }).click();
    await expect(page.locator(DEPLOY_TIME_SELECTOR)).toContainText(
      deployClockOf(silentUpdateSite.describe(SiteBuild.SILENT).deployInstant),
    );
  },
);

Then(
  "axe-core finds no violations with the update notice shown",
  async ({ smokeWorld }) => {
    const accessibilityScan = await new AxeBuilder({
      page: smokeWorld.page,
    }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  },
);
