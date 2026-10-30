import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  listRow,
  parseCityNames,
} from "../../locations/steps/locationsE2eHelpers";
import { readListOrder } from "../../locations/steps/locationsReorderE2eHelpers";
import { type Box, requireBox } from "./timeSelectionE2eHelpers";
import {
  AMBIGUOUS_DAY_INSTANT,
  AMBIGUOUS_HINT_PATTERN,
  AMBIGUOUS_TYPED_TEXT,
  GAP_HINT_PATTERN,
  GAP_TYPED_TEXT,
  HINT_CITY,
  openWallTimeInput,
  tabUntilFocused,
  typeWallTime,
  wallTimeButtonOf,
  wallTimeFieldOf,
  wallTimeHintOf,
} from "./wallTimeE2eHelpers";

const { When, Then } = createBdd(test);

const MIN_TOUCH_TARGET_PX = 44;
const SIZE_TOLERANCE_PX = 1;
const PLACE_COLUMN_XPATH =
  "xpath=ancestor::span[contains(@class,'flex-col')][1]";
const LIVE_REGION_SELECTOR = "[aria-live]";
const DAY_TRACK_SELECTOR = "[data-day-track-bar]";
const cardBoxesBeforeOpening = new WeakMap<object, Box>();
const scrollBeforeTyping = new WeakMap<object, number>();

// Verifies FR1 of add-wall-time-input-with-hint: the field opens on a click.
When(
  "the user opens the wall-time input of {string}",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    cardBoxesBeforeOpening.set(
      locationsWorld,
      await requireBox(listRow(page, city)),
    );
    await openWallTimeInput(page, city);
  },
);

// Verifies FR1 of add-wall-time-input-with-hint: the text is fully selected.
Then(
  "the wall-time field of {string} holds {string}, fully selected",
  async ({ locationsWorld }, city: string, time: string) => {
    const field = wallTimeFieldOf(locationsWorld.page, city);
    await expect(field).toHaveValue(time);
    await expect(field).toBeFocused();
    const selectedText = await field.evaluate((element: HTMLInputElement) =>
      element.value.slice(
        element.selectionStart ?? 0,
        element.selectionEnd ?? 0,
      ),
    );
    expect(selectedText).toBe(time);
  },
);

// Verifies FR5 of add-wall-time-input-with-hint: Escape cancels.
When(
  "the user presses Escape in the wall-time field",
  async ({ locationsWorld }) => {
    await locationsWorld.page.keyboard.press("Escape");
  },
);

// Verifies FR5, NFR-A4 of add-wall-time-input-with-hint: focus returns to the time.
Then(
  "the time button of {string} has the focus",
  async ({ locationsWorld }, city: string) => {
    await expect(wallTimeButtonOf(locationsWorld.page, city)).toBeFocused();
  },
);

// Verifies NFR-A4, NFR-A2, UX2 of add-wall-time-input-with-hint: keys only.
When(
  "the user types {string} in the wall-time input of {string} with the keyboard only",
  async ({ locationsWorld }, text: string, city: string) => {
    const { page } = locationsWorld;
    scrollBeforeTyping.set(
      locationsWorld,
      await page.evaluate(() => window.scrollY),
    );
    await tabUntilFocused(page, wallTimeButtonOf(page, city));
    await page.keyboard.press("Enter");
    await expect(wallTimeFieldOf(page, city)).toBeFocused();
    await page.keyboard.type(text);
    await page.keyboard.press("Enter");
  },
);

// Verifies UX2 of add-wall-time-input-with-hint: the order of the cards.
Then(
  /^the cards are in the order (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    expect(await readListOrder(locationsWorld.page)).toEqual(
      parseCityNames(quotedNames),
    );
  },
);

// Verifies NFR-A4 of add-wall-time-input-with-hint: typing does not scroll.
Then("the page did not scroll", async ({ locationsWorld }) => {
  const scrollAfter = await locationsWorld.page.evaluate(() => window.scrollY);
  expect(scrollAfter).toBe(scrollBeforeTyping.get(locationsWorld));
});

// Verifies NFR-A2 of add-wall-time-input-with-hint: numeric keyboard, no autocompletion.
Then(
  "the wall-time field requests a numeric keyboard",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await openWallTimeInput(page, HINT_CITY);
    const field = wallTimeFieldOf(page, HINT_CITY);
    await expect(field).toHaveAttribute("inputmode", "numeric");
    await expect(field).toHaveAttribute("autocomplete", "off");
    await expect(field).toHaveAttribute("type", "text");
  },
);

// Verifies NFR-A4, FR3 of add-wall-time-input-with-hint: Tab commits.
When(
  "the user types {string} and presses Tab",
  async ({ locationsWorld }, text: string) => {
    await locationsWorld.page.keyboard.type(text);
    await locationsWorld.page.keyboard.press("Tab");
  },
);

// Verifies NFR-A2, FR11 of add-wall-time-input-with-hint: the accessible name.
Then(
  "the time button of {string} is named {string}",
  async ({ locationsWorld }, city: string, name: string) => {
    await expect(
      listRow(locationsWorld.page, city).getByRole("button", { name }),
    ).toBeVisible();
  },
);

// Verifies NFR-A1, NFR-A3 of add-wall-time-input-with-hint: the states axe-core scans.
When(/^the page shows (.+)$/, async ({ locationsWorld }, state: string) => {
  const { page } = locationsWorld;
  switch (state) {
    case "the time buttons":
      break;
    case "an open field":
      await openWallTimeInput(page, HINT_CITY);
      break;
    case "a field with an error":
      await openWallTimeInput(page, HINT_CITY);
      await page.keyboard.type("abc");
      await page.keyboard.press("Enter");
      await expect(page.getByText("Enter the time as HH:MM")).toBeVisible();
      break;
    case "a GAP hint":
      await typeWallTime(page, HINT_CITY, GAP_TYPED_TEXT);
      await expect(
        wallTimeHintOf(page).filter({ hasText: GAP_HINT_PATTERN }),
      ).toBeVisible();
      break;
    case "an AMBIGUOUS hint":
      await page.clock.setFixedTime(AMBIGUOUS_DAY_INSTANT);
      await page.reload();
      await typeWallTime(page, HINT_CITY, AMBIGUOUS_TYPED_TEXT);
      await expect(
        wallTimeHintOf(page).filter({ hasText: AMBIGUOUS_HINT_PATTERN }),
      ).toBeVisible();
      break;
    default:
      throw new Error(`Unknown state: ${state}`);
  }
});

// Verifies UX1 of add-wall-time-input-with-hint: the hit area.
Then(
  "the time button of {string} is at least 44 by 44 px",
  async ({ locationsWorld }, city: string) => {
    const box = await requireBox(wallTimeButtonOf(locationsWorld.page, city));
    expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  },
);

// Verifies NFR-A3 of add-wall-time-input-with-hint: a visible focus ring.
Then(
  "the time button of {string} shows a focus outline",
  async ({ locationsWorld }, city: string) => {
    const button = wallTimeButtonOf(locationsWorld.page, city);
    await button.focus();
    await locationsWorld.page.keyboard.press("Shift+Tab");
    await locationsWorld.page.keyboard.press("Tab");
    const outlineStyle = await button.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    );
    expect(outlineStyle).not.toBe("none");
  },
);

// Verifies UX1 of add-wall-time-input-with-hint: the text cursor on hover.
Then(
  "the time button of {string} has the text cursor",
  async ({ locationsWorld }, city: string) => {
    const button = wallTimeButtonOf(locationsWorld.page, city);
    await button.hover();
    expect(
      await button.evaluate((element) => getComputedStyle(element).cursor),
    ).toBe("text");
  },
);

// Verifies NFR-A1, NFR-A3 of add-wall-time-input-with-hint: polite status, times not announced.
Then(
  "the hint is a status outside any live region with no time in it",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(wallTimeHintOf(page)).toHaveCount(1);
    await expect(
      page
        .locator(LIVE_REGION_SELECTOR)
        .locator("time, button[aria-label^='Enter time']"),
    ).toHaveCount(0);
    const isInsideLiveRegion = await wallTimeHintOf(page).evaluate(
      (element, selector) => element.closest(selector) !== null,
      LIVE_REGION_SELECTOR,
    );
    expect(isInsideLiveRegion).toBe(false);
  },
);

// Verifies NFR-R1, UX2 of add-wall-time-input-with-hint: the card keeps its size.
Then(
  "the card of {string} keeps its size",
  async ({ locationsWorld }, city: string) => {
    const before = cardBoxesBeforeOpening.get(locationsWorld);
    const after = await requireBox(listRow(locationsWorld.page, city));
    expect(
      Math.abs(after.width - (before?.width ?? Number.NaN)),
    ).toBeLessThanOrEqual(SIZE_TOLERANCE_PX);
    expect(
      Math.abs(after.height - (before?.height ?? Number.NaN)),
    ).toBeLessThanOrEqual(SIZE_TOLERANCE_PX);
  },
);

// Verifies NFR-R1, UX3 of add-wall-time-input-with-hint: the hint's place in the card.
Then(
  "the hint sits below the place column and above the day track",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const row = listRow(page, HINT_CITY);
    const hintBox = await requireBox(wallTimeHintOf(page));
    const cardBox = await requireBox(row);
    const placeBox = await requireBox(
      row
        .getByText(HINT_CITY, { exact: true })
        .first()
        .locator(PLACE_COLUMN_XPATH),
    );
    const trackBox = await requireBox(row.locator(DAY_TRACK_SELECTOR));
    expect(hintBox.y).toBeGreaterThanOrEqual(
      placeBox.y + placeBox.height - SIZE_TOLERANCE_PX,
    );
    expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(
      trackBox.y + SIZE_TOLERANCE_PX,
    );
    expect(hintBox.x).toBeGreaterThanOrEqual(cardBox.x - SIZE_TOLERANCE_PX);
    expect(hintBox.x + hintBox.width).toBeLessThanOrEqual(
      cardBox.x + cardBox.width + SIZE_TOLERANCE_PX,
    );
  },
);

// Verifies FR13 of add-wall-time-input-with-hint: a plain click opens the field.
When(
  "the user taps the time of {string}",
  async ({ locationsWorld }, city: string) => {
    await wallTimeButtonOf(locationsWorld.page, city).click();
  },
);

Then(
  "the wall-time input of {string} is open",
  async ({ locationsWorld }, city: string) => {
    await expect(wallTimeFieldOf(locationsWorld.page, city)).toBeVisible();
  },
);
