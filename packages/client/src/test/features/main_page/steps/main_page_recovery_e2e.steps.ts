import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./main_page_e2e.fixtures";
import {
  APP_ROOT_URL,
  EMPTY_STATE_TEXT,
  ERROR_TEXT,
  failStorageWrites,
  installServiceWorker,
  RETRY_LABEL,
  readHeaderBox,
  STORAGE_WARNING_TEXT,
  UPDATE_CHECK_FAILED_TEXT,
} from "./mainPageE2eHelpers";

const { Given, When, Then } = createBdd(test);

// Verifies FR6, NFR-A2 of add-main-page-scaffold: first visit, before the
// service worker controls the page, so page.route sees the chunk request.
Given(
  "the view cannot be loaded on the first visit",
  async ({ mainPageWorld }) => {
    await mainPageWorld.blockCardsChunk();
  },
);

When("the main page shows the error", async ({ mainPageWorld }) => {
  await mainPageWorld.page.goto(APP_ROOT_URL);
  await expect(mainPageWorld.page.getByRole("alert")).toContainText(ERROR_TEXT);
});

Then("focus has not moved", async ({ mainPageWorld }) => {
  const focusedTagName = await mainPageWorld.page.evaluate(
    () => document.activeElement?.tagName,
  );
  expect(focusedTagName).toBe("BODY");
});

When("the failure cause is gone", async ({ mainPageWorld }) => {
  await mainPageWorld.unblockCardsChunk();
});

When(
  "the user reaches Retry with Tab and presses Enter",
  async ({ mainPageWorld }) => {
    const { page } = mainPageWorld;
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: RETRY_LABEL })).toBeFocused();
    await page.keyboard.press("Enter");
  },
);

Then("the view is shown", async ({ mainPageWorld }) => {
  await expect(mainPageWorld.page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
});

// Verifies FR1, UX3 of add-main-page-scaffold: the header stays put.
Given(
  "the app has been installed and its header position is recorded",
  async ({ mainPageWorld }) => {
    await installServiceWorker(mainPageWorld);
    await expect(mainPageWorld.page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
    mainPageWorld.recordedHeaderBox = await readHeaderBox(mainPageWorld.page);
  },
);

When(
  "the update check fails because the network is unreachable",
  async ({ mainPageWorld }) => {
    await mainPageWorld.failUpdateChecksOnNextLoad();
    await mainPageWorld.page.reload();
    await expect(
      mainPageWorld.page.getByText(UPDATE_CHECK_FAILED_TEXT),
    ).toBeVisible();
  },
);

When("storage becomes unavailable", async ({ mainPageWorld }) => {
  const { page } = mainPageWorld;
  await page.addInitScript(failStorageWrites);
  await page.reload();
  await expect(page.getByText(STORAGE_WARNING_TEXT)).toBeVisible();
});

Then("the header has not moved", async ({ mainPageWorld }) => {
  const currentHeaderBox = await readHeaderBox(mainPageWorld.page);
  expect(currentHeaderBox).toEqual(mainPageWorld.recordedHeaderBox);
});
