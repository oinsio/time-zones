import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";
import { listRow } from "./locationsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const APP_ROOT_URL = ".";

// Verifies FR14 of add-locations-via-search: two pages of one browser context.
Given("the app is open in two tabs", async ({ locationsWorld }) => {
  await locationsWorld.page.goto(APP_ROOT_URL);
  await locationsWorld.openOtherTab();
});

Then(
  "the other tab shows {string} without a reload",
  async ({ locationsWorld }, cityName: string) => {
    await expect(
      listRow(locationsWorld.requireOtherTab(), cityName),
    ).toBeVisible();
  },
);

Then(
  "the other tab no longer shows {string} without a reload",
  async ({ locationsWorld }, cityName: string) => {
    await expect(
      listRow(locationsWorld.requireOtherTab(), cityName),
    ).toHaveCount(0);
  },
);

// Verifies FR16 of add-locations-via-search: the service worker has precached
// the build and controls the page before the network goes away.
Given(
  "the service worker controls the locations app",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.goto(APP_ROOT_URL);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
  },
);

Given("the network is gone", async ({ locationsWorld }) => {
  await locationsWorld.page.context().setOffline(true);
});

When(
  "the user reopens the locations app without network",
  async ({ locationsWorld }) => {
    await locationsWorld.page.context().setOffline(true);
    await locationsWorld.page.reload();
  },
);
