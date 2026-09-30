import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";
import {
  openSearch,
  parseCityNames,
  queryField,
  RETRY_NAME,
  SEARCH_LOAD_ERROR_TEXT,
  SEARCH_LOADING_TEXT,
  SUGGESTIONS_HEADING,
  typeQuery,
} from "./locationsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const APP_ROOT_URL = ".";
const PAGE_MARKER_KEY = "locationsPageMarker";
const POLITE_LIVE_REGION = '[aria-live="polite"]';

// Verifies FR15, NFR-P2 of add-locations-via-search: opens the app as a first visit.
When("the user opens the locations app", async ({ locationsWorld }) => {
  await locationsWorld.page.goto(APP_ROOT_URL);
});

// Verifies FR15, UX1 of add-locations-via-search.
Given("the search data is slow to load", async ({ locationsWorld }) => {
  await locationsWorld.holdSearchData();
});

Given("the search data cannot be loaded", async ({ locationsWorld }) => {
  await locationsWorld.failSearchData();
});

When("the search data becomes reachable", async ({ locationsWorld }) => {
  await locationsWorld.allowSearchData();
});

When("the user opens the search", async ({ locationsWorld }) => {
  await openSearch(locationsWorld.page);
});

// Verifies FR15 of add-locations-via-search (D8): the marker proves that Retry did not reload.
Given("the page is marked", async ({ locationsWorld }) => {
  await locationsWorld.page.evaluate((markerKey) => {
    Reflect.set(window, markerKey, true);
  }, PAGE_MARKER_KEY);
});

When("the user retries the search", async ({ locationsWorld }) => {
  await locationsWorld.page.getByRole("button", { name: RETRY_NAME }).click();
});

When(
  "the user searches for {string}",
  async ({ locationsWorld }, query: string) => {
    await openSearch(locationsWorld.page);
    await typeQuery(locationsWorld.page, query);
  },
);

Then("the search shows that it is loading", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByText(SEARCH_LOADING_TEXT),
  ).toBeVisible();
});

Then(
  "the search shows the load error with Retry",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByText(SEARCH_LOAD_ERROR_TEXT)).toBeVisible();
    await expect(page.getByRole("button", { name: RETRY_NAME })).toBeVisible();
  },
);

Then("the suggestions are shown", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByText(SUGGESTIONS_HEADING),
  ).toBeVisible();
  await expect(queryField(locationsWorld.page)).toBeVisible();
});

Then("the page is still marked", async ({ locationsWorld }) => {
  const isMarked = await locationsWorld.page.evaluate(
    (markerKey) => Reflect.get(window, markerKey) === true,
    PAGE_MARKER_KEY,
  );
  expect(isMarked).toBe(true);
});

// Verifies NFR-P2 of add-locations-via-search (D8): page requests, not the service worker's precache.
Then(
  "the page has not requested the search data",
  async ({ locationsWorld }) => {
    await locationsWorld.page.waitForLoadState("networkidle");
    expect(locationsWorld.searchDataRequestUrls).toEqual([]);
  },
);

Then("the page has requested the search data", async ({ locationsWorld }) => {
  await expect
    .poll(() => locationsWorld.searchDataRequestUrls.length)
    .toBeGreaterThan(0);
});

// Verifies NFR-A3 of add-locations-via-search.
Then(
  "the list offers the action {string}",
  async ({ locationsWorld }, actionName: string) => {
    await expect(
      locationsWorld.page.getByRole("button", { name: actionName }),
    ).toBeVisible();
  },
);

Then(
  "the polite announcement reads {string}",
  async ({ locationsWorld }, announcement: string) => {
    await expect(
      locationsWorld.page.locator(POLITE_LIVE_REGION, {
        hasText: announcement,
      }),
    ).toHaveCount(1);
  },
);

// Verifies FR5 of add-locations-via-search.
Then(
  /^the first results are (.+) in that order$/,
  async ({ locationsWorld }, quotedNames: string) => {
    const expectedNames = parseCityNames(quotedNames);
    const options = locationsWorld.page.getByRole("option");
    for (const [optionIndex, cityName] of expectedNames.entries()) {
      await expect(options.nth(optionIndex)).toHaveText(
        new RegExp(`^${cityName}`),
      );
    }
  },
);
