import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";
import { parseCityNames } from "./locationsE2eHelpers";
import {
  allMoveHandles,
  countLocationWrites,
  handleNamed,
  readListOrder,
  readLocationWriteCount,
  WRITE_SETTLE_MS,
} from "./locationsReorderE2eHelpers";

const { Given, When, Then } = createBdd(test);

const LIVE_REGION = "[aria-live]";

Given("the page is taller than the screen", async ({ locationsWorld }) => {
  const isTaller = await locationsWorld.page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  expect(isTaller).toBe(true);
});

Then("the page has scrolled down", async ({ locationsWorld }) => {
  await expect
    .poll(() => locationsWorld.page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
});

Given("location writes are counted", async ({ locationsWorld }) => {
  await countLocationWrites(locationsWorld.page);
});

Then("no location write happened", async ({ locationsWorld }) => {
  await locationsWorld.page.waitForTimeout(WRITE_SETTLE_MS);
  expect(await readLocationWriteCount(locationsWorld.page)).toBe(0);
});

Given("writing to storage fails", async ({ locationsWorld }) => {
  await locationsWorld.failAllStorageWrites();
});

Then("the storage warning is shown", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByText(englishLocale.mainPage.storageUnavailable),
  ).toBeVisible();
});

When("the user reopens the locations app", async ({ locationsWorld }) => {
  await locationsWorld.page.reload();
});

// Verifies FR1, FR3, FR4 of reorder-locations-by-drag-and-drop: order in DOM order.
Then(
  /^the locations list order is (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    await expect
      .poll(() => readListOrder(locationsWorld.page))
      .toEqual(parseCityNames(quotedNames));
  },
);

// Verifies FR5 of reorder-locations-by-drag-and-drop.
Then(
  /^the other tab shows the order (.+) without a reload$/,
  async ({ locationsWorld }, quotedNames: string) => {
    await expect
      .poll(() => readListOrder(locationsWorld.requireOtherTab()))
      .toEqual(parseCityNames(quotedNames));
  },
);

// Verifies FR1, NFR-A5 of reorder-locations-by-drag-and-drop: exact handle names.
Then(
  "the list offers the move handle {string}",
  async ({ locationsWorld }, handleName: string) => {
    await expect(handleNamed(locationsWorld.page, handleName)).toBeVisible();
  },
);

Then(
  "the list offers no move handle {string}",
  async ({ locationsWorld }, handleName: string) => {
    await expect(handleNamed(locationsWorld.page, handleName)).toHaveCount(0);
  },
);

// Verifies NFR-A5 of reorder-locations-by-drag-and-drop.
Then(
  "every move handle is at least {int} by {int} px",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    const handles = allMoveHandles(locationsWorld.page);
    await expect(handles.first()).toBeVisible();
    for (const handle of await handles.all()) {
      const box = await handle.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(minWidth);
      expect(box?.height).toBeGreaterThanOrEqual(minHeight);
    }
  },
);

// Verifies NFR-A2 of reorder-locations-by-drag-and-drop: focus returns to the handle.
Then(
  "focus is on the move handle {string}",
  async ({ locationsWorld }, handleName: string) => {
    await expect(handleNamed(locationsWorld.page, handleName)).toBeFocused();
  },
);

// Verifies NFR-A3 of reorder-locations-by-drag-and-drop.
Then(
  "the reorder announcement reads {string}",
  async ({ locationsWorld }, announcement: string) => {
    await expect(
      locationsWorld.page.locator(LIVE_REGION, { hasText: announcement }),
    ).toHaveText(announcement);
  },
);
