import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";
import { parseCityNames } from "./locationsE2eHelpers";
import {
  allGrabAreas,
  countLocationWrites,
  grabArea,
  menuButton,
  readListOrder,
  readLocationWriteCount,
  WRITE_SETTLE_MS,
} from "./locationsReorderE2eHelpers";

const { Given, When, Then } = createBdd(test);

const LIVE_REGION = "[aria-live]";

Given("the page is taller than the screen", async ({ locationsWorld }) => {
  // The app mounts after the load event (the boot chunk imports it), so wait for the cards.
  await expect
    .poll(() =>
      locationsWorld.page.evaluate(
        () => document.documentElement.scrollHeight > window.innerHeight,
      ),
    )
    .toBe(true);
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

// Verifies FR15 of redesign-cards-grid-and-day-palettes: no drag handle anywhere.
Then("the list offers no move handle", async ({ locationsWorld }) => {
  await expect(allGrabAreas(locationsWorld.page).first()).toBeVisible();
  await expect(
    locationsWorld.page.getByRole("button", { name: /^Move / }),
  ).toHaveCount(0);
});

// Verifies FR15 of redesign-cards-grid-and-day-palettes: the grab cursor.
Then(
  "the grab area of {string} shows the {word} cursor",
  async ({ locationsWorld }, cityName: string, cursor: string) => {
    await expect(grabArea(locationsWorld.page, cityName)).toHaveCSS(
      "cursor",
      cursor,
    );
  },
);

// Verifies FR15 of redesign-cards-grid-and-day-palettes: the grab area is not a Tab stop.
Then(
  "the grab area of {string} is no button and no Tab stop",
  async ({ locationsWorld }, cityName: string) => {
    const area = grabArea(locationsWorld.page, cityName);
    await expect(area).not.toHaveAttribute("role", /.+/);
    await expect(area).not.toHaveAttribute("tabindex", /.+/);
  },
);

// Verifies FR16 of redesign-cards-grid-and-day-palettes: a move that cannot apply is disabled.
Then(
  "in the location menu of {string} the item {string} is disabled",
  async ({ locationsWorld }, cityName: string, itemName: string) => {
    const { page } = locationsWorld;
    await menuButton(page, cityName).click();
    await expect(
      page.getByRole("menuitem", { name: itemName }),
    ).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Escape");
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
