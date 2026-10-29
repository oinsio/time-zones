import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  BAR_SELECTOR,
  centreOfBox,
  requireBox,
} from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  hereEntryOf,
  hereEntrySliderOf,
  hereEntryTimeOf,
} from "./hereEntryE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { parseCityNames } from "./locationsE2eHelpers";
import {
  dispatchTouch,
  readListOrder,
  startTouch,
} from "./locationsReorderE2eHelpers";

const { When, Then } = createBdd(test);

const MAX_TAB_PRESSES = 12;
const TAP_FRACTION_PERCENT = 75;
const PERCENT = 100;
const TAB_KEY = "Tab";

const tabStopCounts = new WeakMap<Page, { inside: number; hasLeft: boolean }>();

const isFocusInsideHereEntry = (page: Page) =>
  page.evaluate(
    () => document.activeElement?.closest("section[aria-label]") !== null,
  );

// Verifies FR4 of show-here-entry-for-device-time: the Here entry is apart from the list.
Then(
  /^the rows are the Here entry, (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    const { page } = locationsWorld;
    const hereEntryBox = await requireBox(hereEntryOf(page));
    const firstCardBox = await requireBox(page.getByRole("listitem").first());
    expect(hereEntryBox.y).toBeLessThan(firstCardBox.y);
    expect(await readListOrder(page)).toEqual(parseCityNames(quotedNames));
  },
);

// Verifies FR11 of show-here-entry-for-device-time: the view contract.
Then(
  "the first row is the Here entry showing {string}",
  async ({ locationsWorld }, time: string) => {
    const { page } = locationsWorld;
    await expect(hereEntryTimeOf(page)).toHaveText(time);
    const hereEntryBox = await requireBox(hereEntryOf(page));
    const firstCardBox = await requireBox(page.getByRole("listitem").first());
    expect(hereEntryBox.y).toBeLessThan(firstCardBox.y);
  },
);

// Verifies FR5 of show-here-entry-for-device-time.
Then(
  "the Here entry shows the time {string}",
  async ({ locationsWorld }, time: string) => {
    await expect(hereEntryTimeOf(locationsWorld.page)).toHaveText(time);
  },
);

// Verifies FR12 of show-here-entry-for-device-time: a finger tap without Pointer Events.
When(
  "the user taps three quarters of the Here entry's day track",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const barBox = await requireBox(
      hereEntrySliderOf(page).locator(BAR_SELECTOR),
    );
    const point = {
      x: barBox.x + (barBox.width * TAP_FRACTION_PERCENT) / PERCENT,
      y: centreOfBox(barBox).y,
    };
    await dispatchTouch(session, "touchStart", point);
    await dispatchTouch(session, "touchEnd");
  },
);

// Verifies NFR-A2 of show-here-entry-for-device-time.
Then(
  "the Here entry is named {string}",
  async ({ locationsWorld }, accessibleName: string) => {
    await expect(
      locationsWorld.page.getByRole("region", { name: accessibleName }),
    ).toBeVisible();
  },
);

Then(
  "the location list has {int} items",
  async ({ locationsWorld }, itemCount: number) => {
    await expect(locationsWorld.page.getByRole("listitem")).toHaveCount(
      itemCount,
    );
  },
);

Then(
  "the Here entry's slider is named {string}",
  async ({ locationsWorld }, sliderName: string) => {
    await expect(
      hereEntryOf(locationsWorld.page).getByRole("slider", {
        name: sliderName,
      }),
    ).toBeVisible();
  },
);

Then("the Here entry is shown", async ({ locationsWorld }) => {
  await expect(hereEntryOf(locationsWorld.page)).toBeVisible();
});

// Verifies NFR-A2 of show-here-entry-for-device-time: the Tab stops inside the Here entry.
When(
  "the user moves the focus through the page with Tab",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(hereEntryOf(page)).toBeVisible();
    const counts = { inside: 0, hasLeft: false };
    for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount++) {
      await page.keyboard.press(TAB_KEY);
      const isInside = await isFocusInsideHereEntry(page);
      if (isInside) counts.inside += 1;
      else if (counts.inside > 0) {
        counts.hasLeft = true;
        break;
      }
    }
    tabStopCounts.set(page, counts);
  },
);

Then(
  "exactly one element of the Here entry takes the focus: the slider named {string}",
  async ({ locationsWorld }, sliderName: string) => {
    const { page } = locationsWorld;
    expect(tabStopCounts.get(page)?.inside).toBe(1);
    await hereEntrySliderOf(page).focus();
    await expect(
      hereEntryOf(page).getByRole("slider", { name: sliderName }),
    ).toBeFocused();
  },
);

Then(
  "the next Tab moves the focus out of the Here entry",
  async ({ locationsWorld }) => {
    expect(tabStopCounts.get(locationsWorld.page)?.hasLeft).toBe(true);
  },
);
