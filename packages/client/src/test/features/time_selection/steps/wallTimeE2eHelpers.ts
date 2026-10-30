import { expect, type Locator, type Page } from "@playwright/test";
import { listRow } from "../../locations/steps/locationsE2eHelpers";

export const WALL_TIME_NAME_PREFIX = "Enter time — ";
export const GAP_HINT_PATTERN = /does not exist on this day/;
export const AMBIGUOUS_HINT_PATTERN = /occurs twice/;
export const AMBIGUOUS_DAY_INSTANT = "2026-11-01T07:30:00Z";
export const GAP_TYPED_TEXT = "0230";
export const AMBIGUOUS_TYPED_TEXT = "0130";
export const HINT_CITY = "New York";
const MAX_TAB_PRESSES = 30;

export const wallTimeButtonOf = (page: Page, city: string) =>
  listRow(page, city).getByRole("button", {
    name: `${WALL_TIME_NAME_PREFIX}${city}`,
  });

export const wallTimeFieldOf = (page: Page, city: string) =>
  listRow(page, city).getByRole("textbox", {
    name: `${WALL_TIME_NAME_PREFIX}${city}`,
  });

export const wallTimeHintOf = (page: Page) =>
  page.getByRole("status").filter({ hasText: /\d{2}:\d{2}/ });

/** Opens the field with a click and waits until it is shown. */
export async function openWallTimeInput(page: Page, city: string) {
  await wallTimeButtonOf(page, city).click();
  await expect(wallTimeFieldOf(page, city)).toBeVisible();
}

/** Types a text into the open field of a city and confirms it with Enter. */
export async function typeWallTime(page: Page, city: string, text: string) {
  await openWallTimeInput(page, city);
  await page.keyboard.type(text);
  await page.keyboard.press("Enter");
}

/** Moves the focus with Tab until the given element has it. */
export async function tabUntilFocused(page: Page, target: Locator) {
  for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement))
      return;
  }
  throw new Error("The element never took the focus with Tab");
}
