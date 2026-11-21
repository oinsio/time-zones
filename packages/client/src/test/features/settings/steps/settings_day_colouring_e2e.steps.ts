// Verifies NFR-A1, NFR-A2, NFR-A4, NFR-R1, UX2 of add-day-colouring-setting.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  MIN_OPTION_HEIGHT_PX,
  RADIO_ROLE,
  RADIOGROUP_ROLE,
  seedPreferenceFields,
  settingsButton,
} from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const COLOURING_GROUP_NAME = /^(Colouring|Раскраска)$/;
const WORKING_HOURS_ROW_NAME = /^(Working hours|Рабочие часы)$/;
const GROUP_ROLE = "group";
const TEXTBOX_ROLE = "textbox";
const MAX_COMPACT_ROW_HEIGHT_PX = 56;
const MAX_TAB_PRESSES = 40;
const TAB_KEY = "Tab";
const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";
const NO_OUTLINE_STYLE = "none";
const COLOURING_VALUES: Record<string, string> = {
  Plain: "PLAIN",
  "Time of day": "TIME_OF_DAY",
  "Working hours": "WORKING_HOURS",
};
const DEFAULT_WORKING_HOURS = { start: "10:00", end: "18:00" };

const colouringGroup = (page: Page) =>
  page.getByRole(RADIOGROUP_ROLE, { name: COLOURING_GROUP_NAME });
const workingHoursRow = (page: Page) =>
  page.getByRole(GROUP_ROLE, { name: WORKING_HOURS_ROW_NAME });
const fieldOf = (page: Page, name: string) =>
  page.getByRole(TEXTBOX_ROLE, { name, exact: true });
const optionLabels = (page: Page) =>
  colouringGroup(page)
    .locator("label")
    .filter({ has: page.getByRole(RADIO_ROLE) });

const outlineStyleOf = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).outlineStyle);

// Implements FR2, FR6 of add-day-colouring-setting: the colouring in force when the app opens.
Given(
  "the day colouring is {string}",
  async ({ locationsWorld }, name: string) => {
    await seedPreferenceFields(
      locationsWorld.page,
      {
        dayColouring: COLOURING_VALUES[name],
        workingHours: DEFAULT_WORKING_HOURS,
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
      },
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

Given(
  "the day colouring is {string} and the hour format is {string}",
  async ({ locationsWorld }, name: string, hourFormat: string) => {
    await seedPreferenceFields(
      locationsWorld.page,
      {
        dayColouring: COLOURING_VALUES[name],
        workingHours: DEFAULT_WORKING_HOURS,
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        hourFormat,
      },
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

Then(
  "the colouring options are named {string}, {string} and {string}, in this order",
  async ({ locationsWorld }, first: string, second: string, third: string) => {
    await expect(optionLabels(locationsWorld.page)).toHaveText([
      first,
      second,
      third,
    ]);
  },
);

Then(
  "the option {string} of the colouring group is checked",
  async ({ locationsWorld }, name: string) => {
    await expect(
      colouringGroup(locationsWorld.page).getByRole(RADIO_ROLE, { name }),
    ).toBeChecked();
  },
);

When("the user tabs to the colouring group", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const radios = colouringGroup(page).getByRole(RADIO_ROLE);
  for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount += 1) {
    await page.keyboard.press(TAB_KEY);
    if (
      await radios.evaluateAll((elements) =>
        elements.includes(document.activeElement as HTMLInputElement),
      )
    ) {
      return;
    }
  }
  throw new Error("the colouring group never received the focus");
});

Then("the working hours row is shown", async ({ locationsWorld }) => {
  await expect(workingHoursRow(locationsWorld.page)).toBeVisible();
});

When(
  "the user types {string} into the field {string} and presses Enter",
  async ({ locationsWorld }, text: string, name: string) => {
    const field = fieldOf(locationsWorld.page, name);
    await field.fill(text);
    await field.press(ENTER_KEY);
  },
);

Then(
  "the fields {string} and {string} are marked invalid",
  async ({ locationsWorld }, startName: string, endName: string) => {
    for (const name of [startName, endName]) {
      await expect(fieldOf(locationsWorld.page, name)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }
  },
);

Then(
  "both fields are described by {string}",
  async ({ locationsWorld }, hint: string) => {
    const row = workingHoursRow(locationsWorld.page);
    for (const field of await row.getByRole(TEXTBOX_ROLE).all()) {
      await expect(field).toHaveAccessibleDescription(hint);
    }
    await expect(row.getByRole("status")).toHaveText(hint);
  },
);

Then(
  "every colouring option is at least {int} by {int} px and both working hours fields are at least {int} px high",
  async (
    { locationsWorld },
    minWidth: number,
    minHeight: number,
    fieldHeight: number,
  ) => {
    expect(fieldHeight).toBe(MIN_OPTION_HEIGHT_PX);
    for (const label of await optionLabels(locationsWorld.page).all()) {
      const box = await label.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(minWidth);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight);
    }
    for (const field of await workingHoursRow(locationsWorld.page)
      .getByRole(TEXTBOX_ROLE)
      .all()) {
      expect((await field.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(
        fieldHeight,
      );
    }
  },
);

When(
  "the user focuses the field {string}",
  async ({ locationsWorld }, name: string) => {
    await fieldOf(locationsWorld.page, name).focus();
  },
);

Then("the focused field shows a focus outline", async ({ locationsWorld }) => {
  const focusedField = locationsWorld.page.locator("input:focus-visible");
  await expect(focusedField).toHaveCount(1);
  expect(await outlineStyleOf(focusedField)).not.toBe(NO_OUTLINE_STYLE);
});

Then(
  "the colouring group and the working hours row are each at most {int} px high with their caption and controls on one row",
  async ({ locationsWorld }, maxHeight: number) => {
    expect(maxHeight).toBe(MAX_COMPACT_ROW_HEIGHT_PX);
    const { page } = locationsWorld;
    const rows = [
      {
        row: colouringGroup(page),
        caption: colouringGroup(page).locator("span").first(),
        controls: optionLabels(page).first(),
      },
      {
        row: workingHoursRow(page).locator(":scope > div").first(),
        caption: workingHoursRow(page).locator("span").first(),
        controls: workingHoursRow(page).locator("input").first(),
      },
    ];
    for (const { row, caption, controls } of rows) {
      const rowBox = await row.boundingBox();
      const captionBox = await caption.boundingBox();
      const controlsBox = await controls.boundingBox();
      expect(rowBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
        maxHeight,
      );
      expect(captionBox?.y ?? 0).toBeLessThan(
        (controlsBox?.y ?? 0) + (controlsBox?.height ?? 0),
      );
    }
  },
);

Then(
  "the working hours fields show {string} and {string} and no hint is shown",
  async ({ locationsWorld }, start: string, end: string) => {
    const row = workingHoursRow(locationsWorld.page);
    await expect(row.getByRole(TEXTBOX_ROLE).nth(0)).toHaveValue(start);
    await expect(row.getByRole(TEXTBOX_ROLE).nth(1)).toHaveValue(end);
    await expect(row.getByRole("status")).toBeEmpty();
  },
);

When(
  "the user presses Esc in the field {string}",
  async ({ locationsWorld }, name: string) => {
    const field = fieldOf(locationsWorld.page, name);
    await field.focus();
    await field.press(ESCAPE_KEY);
  },
);

Then("the working hours row is still shown", async ({ locationsWorld }) => {
  await expect(workingHoursRow(locationsWorld.page)).toBeVisible();
});

Then("the main page is shown", async ({ locationsWorld }) => {
  await expect(settingsButton(locationsWorld.page)).toBeVisible();
  await expect(workingHoursRow(locationsWorld.page)).toHaveCount(0);
});

// Verifies NFR-A2 of add-day-colouring-setting: a saved Enter does not move the focus.
Then(
  "the field {string} keeps the focus",
  async ({ locationsWorld }, name: string) => {
    await expect(fieldOf(locationsWorld.page, name)).toBeFocused();
  },
);
