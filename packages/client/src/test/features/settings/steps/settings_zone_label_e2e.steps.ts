// Verifies FR2, NFR-A1, NFR-R1 of add-country-to-zone-label
import { expect, type Locator } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  BUTTON_ROLE,
  MIN_TOGGLE_SIZE_PX,
  seedZoneLabelParts,
  ZONE_LABEL_TAB_LIMIT,
  zoneLabelGroupOf,
  zoneLabelToggleOf,
} from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const ELEMENT_SEPARATOR = ", ";
const ZONE_LINE_ELEMENTS = "[data-zone-line] > span";
const PRESSED_ATTRIBUTE = "aria-pressed";
const TOGGLE_NAMES = ["Country", "Abbreviation", "UTC offset"];
const NO_OUTLINE_STYLE = "none";
const ROW_TOLERANCE_PX = 1;

const requireBox = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("the element has no box");
  return box;
};
const togglesOf = async (page: Parameters<typeof zoneLabelGroupOf>[0]) =>
  zoneLabelGroupOf(page).getByRole(BUTTON_ROLE).all();
const tabUntilFocused = async (
  page: Parameters<typeof zoneLabelGroupOf>[0],
  target: Locator,
) => {
  for (let step = 0; step < ZONE_LABEL_TAB_LIMIT; step++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
};

// Seeds the preferences document with the zone label of the scenario.
Given(
  /^the zone label shows (.+)$/,
  async ({ locationsWorld }, partsName: string) => {
    await seedZoneLabelParts(
      locationsWorld.page,
      partsName,
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

// Verifies FR12 of show-zone-abbreviations-and-zone-label-setting: names and pressed state.
Then(
  "the group {string} holds the pressed toggle buttons {string}, {string} and {string} in this order",
  async (
    { locationsWorld },
    groupName: string,
    first: string,
    second: string,
    third: string,
  ) => {
    const group = zoneLabelGroupOf(locationsWorld.page, groupName);
    for (const name of [first, second, third]) {
      await expect(
        group.getByRole(BUTTON_ROLE, { name, exact: true }),
      ).toHaveAttribute(PRESSED_ATTRIBUTE, "true");
    }
    await expect(group.getByRole(BUTTON_ROLE)).toHaveText([
      first,
      second,
      third,
    ]);
  },
);

Then(
  "the description of the group {string} contains {string}",
  async ({ locationsWorld }, groupName: string, text: string) => {
    await expect(
      zoneLabelGroupOf(locationsWorld.page, groupName),
    ).toHaveAccessibleDescription(new RegExp(text));
  },
);

// Verifies NFR-A1 of show-zone-abbreviations-and-zone-label-setting: keyboard.
When(
  "the user tabs to the toggle {string} and presses {string}",
  async ({ locationsWorld }, name: string, key: string) => {
    const { page } = locationsWorld;
    await tabUntilFocused(page, zoneLabelToggleOf(page, name));
    await page.keyboard.press(key);
  },
);

// Verifies NFR-A2 of polish-settings-and-remove-offline-update-notice: Tab order follows the zone line.
When(
  "the user focuses the toggle {string} and presses {string}",
  async ({ locationsWorld }, name: string, key: string) => {
    const { page } = locationsWorld;
    await zoneLabelToggleOf(page, name).focus();
    await page.keyboard.press(key);
  },
);

Then(
  "the toggle {string} is focused",
  async ({ locationsWorld }, name: string) => {
    await expect(zoneLabelToggleOf(locationsWorld.page, name)).toBeFocused();
  },
);

Then(
  "the toggle {string} is not pressed",
  async ({ locationsWorld }, name: string) => {
    await expect(zoneLabelToggleOf(locationsWorld.page, name)).toHaveAttribute(
      PRESSED_ATTRIBUTE,
      "false",
    );
  },
);

Then(
  "the toggle {string} is pressed",
  async ({ locationsWorld }, name: string) => {
    await expect(zoneLabelToggleOf(locationsWorld.page, name)).toHaveAttribute(
      PRESSED_ATTRIBUTE,
      "true",
    );
  },
);

Then(
  "the example shows {string}",
  async ({ locationsWorld }, example: string) => {
    await expect(
      zoneLabelGroupOf(locationsWorld.page).locator(ZONE_LINE_ELEMENTS),
    ).toHaveText(example.split(ELEMENT_SEPARATOR));
  },
);

// Verifies NFR-A1 of show-zone-abbreviations-and-zone-label-setting: size, focus, icon.
Then(
  "each zone label toggle is at least {int} px wide and {int} px high",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    expect([minWidth, minHeight]).toEqual([
      MIN_TOGGLE_SIZE_PX,
      MIN_TOGGLE_SIZE_PX,
    ]);
    for (const toggle of await togglesOf(locationsWorld.page)) {
      const box = await requireBox(toggle);
      expect(box.width).toBeGreaterThanOrEqual(minWidth);
      expect(box.height).toBeGreaterThanOrEqual(minHeight);
    }
  },
);

Then(
  "the toggle {string} shows a focus outline when focused with the keyboard",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    const toggle = zoneLabelToggleOf(page, name);
    await tabUntilFocused(page, toggle);
    const outlineStyle = await toggle.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    );
    expect(outlineStyle).not.toBe(NO_OUTLINE_STYLE);
  },
);

Then(
  "only the toggle {string} shows the check icon",
  async ({ locationsWorld }, name: string) => {
    for (const toggleName of TOGGLE_NAMES) {
      await expect(
        zoneLabelToggleOf(locationsWorld.page, toggleName).locator("svg"),
      ).toHaveCount(toggleName === name ? 1 : 0);
    }
  },
);

// Verifies NFR-R1 of add-country-to-zone-label: one row.
Then(
  "the three zone label toggles share one row",
  async ({ locationsWorld }) => {
    const boxes = await Promise.all(
      (await togglesOf(locationsWorld.page)).map(requireBox),
    );
    expect(boxes).toHaveLength(TOGGLE_NAMES.length);
    for (const box of boxes) {
      expect(Math.abs(box.y - boxes[0].y)).toBeLessThanOrEqual(
        ROW_TOLERANCE_PX,
      );
    }
  },
);

// Verifies NFR-R2, UX2 of show-zone-abbreviations-and-zone-label-setting: no layout jump.
const boxesBeforeToggling = new WeakMap<
  object,
  Awaited<ReturnType<typeof requireBox>>[]
>();

When(
  "the user turns the toggle {string} off",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    boxesBeforeToggling.set(
      locationsWorld,
      await Promise.all((await togglesOf(page)).map(requireBox)),
    );
    await zoneLabelToggleOf(page, name).click();
    await expect(zoneLabelToggleOf(page, name)).toHaveAttribute(
      PRESSED_ATTRIBUTE,
      "false",
    );
  },
);

Then(
  "the three zone label toggles keep their position and size",
  async ({ locationsWorld }) => {
    const boxesAfter = await Promise.all(
      (await togglesOf(locationsWorld.page)).map(requireBox),
    );
    expect(boxesAfter).toEqual(boxesBeforeToggling.get(locationsWorld));
  },
);
