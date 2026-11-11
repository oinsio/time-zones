// Verifies FR6, UX1 of refine-meeting-range-entry-and-handles: the separator typed on a real keyboard.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { When, Then } = createBdd(test);

const WALL_TIME_INPUT = "the wall-time input";
const END_FIELD_INPUT = "the end field of the meeting range input";
const SHOWN_SEPARATOR = ", ";
const SAMPLE_COLUMN = 9;
const WALL_TIME_ERROR = "Enter the time as HH:MM";
const FIELD_NAMES: Record<string, RegExp> = {
  [WALL_TIME_INPUT]: /^Enter time — Almaty/,
  "the start field of the meeting range input": /^Start time — Almaty/,
  [END_FIELD_INPUT]: /^End time — Almaty/,
};

/** The field the last step opened and the values it showed after each typed digit, per page. */
const openedFields = new WeakMap<Page, Locator>();
const shownValues = new WeakMap<Page, string[]>();

const fieldOf = (page: Page): Locator => {
  const field = openedFields.get(page);
  if (field === undefined) throw new Error("No field was opened");
  return field;
};

When(
  /^the user opened (the wall-time input|the start field of the meeting range input|the end field of the meeting range input) of Almaty and its text is selected$/,
  async ({ locationsWorld }, input: string) => {
    const { page } = locationsWorld;
    if (input === WALL_TIME_INPUT) {
      await page.getByRole("button", { name: FIELD_NAMES[input] }).click();
    } else {
      await page
        .locator("[data-hour-strip]")
        .first()
        .locator("[data-hour-cell]")
        .nth(SAMPLE_COLUMN)
        .click();
      await page
        .getByRole("button", { name: /^Enter meeting time — Almaty/ })
        .click();
    }
    const field = page.getByRole("textbox", { name: FIELD_NAMES[input] });
    const isEndField = input === END_FIELD_INPUT;
    if (isEndField) {
      await field.focus();
      await field.selectText();
    }
    await expect(field).toBeFocused();
    openedFields.set(page, field);
  },
);

When(
  /^the user types the digits "([^"]+)" one by one$/,
  async ({ locationsWorld }, digits: string) => {
    const { page } = locationsWorld;
    const shown: string[] = [];
    for (const digit of digits) {
      await page.keyboard.type(digit);
      shown.push(await fieldOf(page).inputValue());
    }
    shownValues.set(page, shown);
  },
);

When("the user presses Backspace twice", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press("Backspace");
  await locationsWorld.page.keyboard.press("Backspace");
});

When(
  /^the user types "([^"]+)" on the keyboard and presses Enter$/,
  async ({ locationsWorld }, text: string) => {
    await locationsWorld.page.keyboard.type(text);
    await locationsWorld.page.keyboard.press("Enter");
  },
);

Then(
  /^the field shows (.+) after each digit$/,
  async ({ locationsWorld }, expectedValues: string) => {
    expect(shownValues.get(locationsWorld.page)).toEqual(
      expectedValues.split(SHOWN_SEPARATOR),
    );
  },
);

Then("the caret is after the last character", async ({ locationsWorld }) => {
  const caretAtEnd = await fieldOf(locationsWorld.page).evaluate(
    (element: HTMLInputElement) =>
      element.selectionStart === element.value.length &&
      element.selectionEnd === element.value.length,
  );
  expect(caretAtEnd).toBe(true);
});

Then(
  /^the field shows "([^"]+)"$/,
  async ({ locationsWorld }, text: string) => {
    await expect(fieldOf(locationsWorld.page)).toHaveValue(text);
  },
);

Then(
  "the field shows the error {string}",
  async ({ locationsWorld }, message: string) => {
    expect(message).toBe(WALL_TIME_ERROR);
    await expect(locationsWorld.page.getByText(message)).toBeVisible();
  },
);

Then(
  "{string} shows the time {string}",
  async ({ locationsWorld }, city: string, time: string) => {
    await expect(
      locationsWorld.page.getByRole("button", {
        name: new RegExp(`^Enter time — ${city}, ${time}$`),
      }),
    ).toBeVisible();
  },
);
