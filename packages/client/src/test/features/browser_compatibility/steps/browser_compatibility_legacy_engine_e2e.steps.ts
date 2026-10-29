import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { Given, Then } = createBdd(test);

const POLYFILL_CHUNK_NAME = "installLegacySupport";
const SEARCH_DIALOG_ROLE = "dialog";
const SEARCH_DIALOG_ROLE_SELECTOR = `[role="${SEARCH_DIALOG_ROLE}"]`;
const requestedUrlsByWorld = new WeakMap<object, string[]>();

Given("the page requests are recorded", async ({ locationsWorld }) => {
  const requestedUrls: string[] = [];
  requestedUrlsByWorld.set(locationsWorld, requestedUrls);
  locationsWorld.page.on("request", (pageRequest) => {
    requestedUrls.push(pageRequest.url());
  });
});

// Verifies NFR-P2, M5 of support-legacy-ios-12-safari: the chunk of `installLegacySupport` is not requested.
Then("the page has requested no polyfill chunk", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect(page.getByRole("main")).toBeVisible();
  const requestedUrls = requestedUrlsByWorld.get(locationsWorld) ?? [];
  expect(requestedUrls.length).toBeGreaterThan(0);
  expect(
    requestedUrls.filter((url) => url.includes(POLYFILL_CHUNK_NAME)),
  ).toEqual([]);
});

// Verifies NFR-A1 of support-legacy-ios-12-safari: the search dialog without Pointer Events.
Then(
  "the search dialog has no accessibility violations",
  async ({ locationsWorld }) => {
    const dialog = locationsWorld.page.getByRole(SEARCH_DIALOG_ROLE);
    await expect(dialog).toBeVisible();
    const accessibilityScan = await new AxeBuilder({
      page: locationsWorld.page,
    })
      .include(SEARCH_DIALOG_ROLE_SELECTOR)
      .analyze();
    expect(accessibilityScan.violations).toEqual([]);
  },
);
