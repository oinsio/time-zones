import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";
import {
  addLocationButton,
  queryField,
  resultOption,
} from "./locationsE2eHelpers";
import {
  appendFocusedField,
  blurActiveElement,
  installDefaultPreventedRecorder,
  type OutsideField,
  outsideField,
  readDefaultPrevented,
  SHIFT_MODIFIER_BITMASK,
  SHORTCUT_KEY,
  SLASH_KEY_CODE,
  waitForTwoAnimationFrames,
} from "./locationsShortcutE2eHelpers";

const { Given, When, Then } = createBdd(test);

const SEARCH_DIALOG_ROLE = "dialog";
const CDP_KEY_DOWN_COMMAND = "Input.dispatchKeyEvent";
const CDP_KEY_DOWN_TYPE = "keyDown";

// Verifies FR1, FR5, UX1 of open-location-search-with-slash-shortcut.
When(/^the user presses "\/" on the main page$/, async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await blurActiveElement(page);
  await installDefaultPreventedRecorder(page);
  await page.keyboard.press(SHORTCUT_KEY);
});

// Verifies FR2, FR3 of open-location-search-with-slash-shortcut.
When(/^the user presses "\/"$/, async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press(SHORTCUT_KEY);
});

// Verifies FR4 of open-location-search-with-slash-shortcut.
When(
  /^the user presses "\/" holding (Control|Meta|Alt) on the main page$/,
  async ({ locationsWorld }, modifier: string) => {
    const { page } = locationsWorld;
    await blurActiveElement(page);
    await page.keyboard.press(`${modifier}+${SHORTCUT_KEY}`);
  },
);

// Verifies FR4 of open-location-search-with-slash-shortcut (D5: CDP for Shift).
When(
  /^the user presses "\/" with Shift on a layout that needs it$/,
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await blurActiveElement(page);
    const session = await page.context().newCDPSession(page);
    await session.send(CDP_KEY_DOWN_COMMAND, {
      type: CDP_KEY_DOWN_TYPE,
      key: SHORTCUT_KEY,
      code: SLASH_KEY_CODE,
      text: SHORTCUT_KEY,
      modifiers: SHIFT_MODIFIER_BITMASK,
    });
  },
);

// Verifies FR1, M4 of open-location-search-with-slash-shortcut.
When(
  /^the user picks "([^"]+)" in the search with the keyboard$/,
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await page.keyboard.type(cityName);
    await expect(resultOption(page, cityName).first()).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  },
);

// Verifies FR3 of open-location-search-with-slash-shortcut.
When(
  "focus moves to the close action of the search",
  async ({ locationsWorld }) => {
    await locationsWorld.page
      .getByRole("button", { name: englishLocale.locations.close })
      .focus();
  },
);

// Verifies FR2 of open-location-search-with-slash-shortcut.
Given(
  /^a (text input|textarea|contenteditable element) outside the search has focus$/,
  async ({ locationsWorld }, field: string) => {
    await appendFocusedField(locationsWorld.page, field as OutsideField);
  },
);

// Verifies FR1 of open-location-search-with-slash-shortcut.
Then(
  "the search is open with focus in an empty query field",
  async ({ locationsWorld }) => {
    const field = queryField(locationsWorld.page);
    await expect(field).toBeFocused();
    await expect(field).toHaveValue("");
  },
);

// Verifies UX1 of open-location-search-with-slash-shortcut.
Then(
  /^the "\/" key press did not reach the browser$/,
  async ({ locationsWorld }) => {
    expect(await readDefaultPrevented(locationsWorld.page)).toBe(true);
  },
);

// Verifies NFR-A1 of open-location-search-with-slash-shortcut.
Then(
  /^the "Add location" action announces the "\/" keyboard shortcut$/,
  async ({ locationsWorld }) => {
    await expect(addLocationButton(locationsWorld.page)).toHaveAttribute(
      "aria-keyshortcuts",
      SHORTCUT_KEY,
    );
  },
);

// Verifies FR2, FR4, FR6 of open-location-search-with-slash-shortcut.
Then("the search does not open", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await waitForTwoAnimationFrames(page);
  await expect(page.getByRole(SEARCH_DIALOG_ROLE)).toHaveCount(0);
});

// Verifies FR2 of open-location-search-with-slash-shortcut.
Then(/^the focused field holds "\/"$/, async ({ locationsWorld }) => {
  const field = outsideField(locationsWorld.page);
  const isContentEditable =
    (await field.getAttribute("contenteditable")) !== null;
  if (isContentEditable) await expect(field).toHaveText(SHORTCUT_KEY);
  else await expect(field).toHaveValue(SHORTCUT_KEY);
});

// Verifies FR3 of open-location-search-with-slash-shortcut.
Then("exactly one search is open", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.getByRole(SEARCH_DIALOG_ROLE)).toHaveCount(
    1,
  );
});

// Verifies FR3 of open-location-search-with-slash-shortcut.
Then(
  /^the query field holds "(\/?)"$/,
  async ({ locationsWorld }, text: string) => {
    await expect(queryField(locationsWorld.page)).toHaveValue(text);
  },
);
