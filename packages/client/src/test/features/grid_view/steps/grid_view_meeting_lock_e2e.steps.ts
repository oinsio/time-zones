// Verifies FR1, FR2, FR3, FR4, NFR-A1, NFR-A2, NFR-R1, UX1 of fix-grid-meeting-range-lock-and-layering: locked controls and the meeting range input in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  menuButton,
  parseCityNames,
} from "../../locations/steps/locationsE2eHelpers";
import { cellOf } from "./hourGridE2eHelpers";
import { endHandleOf } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const MAX_TAB_STOPS = 40;
const RUSSIAN_CITY_NAMES: Record<string, string> = {
  Almaty: "Алматы",
  Moscow: "Москва",
};
const SHARE_BUTTON_NAME = "Share meeting";
const MEETING_END_NAME = "Meeting end";
const MOVE_HANDLE_PREFIX = "Move ";
const SAMPLE_COLUMN = 9;
const SAMPLE_END_KEY = "PageUp";
const SAMPLE_SPAN_END = "11:00";
const SPAN_BUTTON_PATTERN = /^(Enter meeting time|Ввести время встречи)/;
const START_FIELD_PATTERN = /^(Start time|Время начала)/;
const END_FIELD_PATTERN = /^(End time|Время окончания)/;
const LOCKABLE_BUTTONS_SELECTOR =
  "button[aria-roledescription], button[aria-haspopup='menu']";
const WALL_TIME_BUTTON_PATTERN = /^(Enter time|Ввести время —)/;

/** The Tab stops a step visited, read by the step that checks them. */
const visitedByPage = new WeakMap<Page, string[]>();

const focusedName = (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    return (
      element?.getAttribute("aria-label") ?? element?.textContent?.trim() ?? ""
    );
  });

/** Presses Tab until `isLast` accepts the focused name (or the stop count runs out) and returns every name. */
async function tabUntil(
  page: Page,
  isLast: (name: string) => boolean,
  visited: string[] = [],
) {
  while (visited.length < MAX_TAB_STOPS) {
    await page.keyboard.press("Tab");
    const name = await focusedName(page);
    visited.push(name);
    if (isLast(name)) break;
  }
  return visited;
}

/** The row of a city under its English or its Russian name, whichever language the screen uses. */
const rowOfCity = (page: Page, city: string) =>
  page.getByRole("listitem").filter({
    hasText: new RegExp(`${city}|${RUSSIAN_CITY_NAMES[city] ?? city}`),
  });
const spanButtonOf = (page: Page, city: string) =>
  rowOfCity(page, city).getByRole("button", { name: SPAN_BUTTON_PATTERN });
const fieldsOf = (page: Page, city: string) => [
  rowOfCity(page, city).getByRole("textbox", { name: START_FIELD_PATTERN }),
  rowOfCity(page, city).getByRole("textbox", { name: END_FIELD_PATTERN }),
];

// Implements FR1, FR2, FR3 of fix-grid-meeting-range-lock-and-layering: the meeting range 09:00–11:00 in a row that is not first.
When(
  "the user sets the meeting range 09:00–11:00 in Almaty",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await cellOf(page, "Almaty", SAMPLE_COLUMN).click();
    await endHandleOf(page).press(SAMPLE_END_KEY);
    await expect(endHandleOf(page)).toHaveAttribute(
      "aria-valuetext",
      SAMPLE_SPAN_END,
    );
  },
);

// Verifies NFR-A2 of fix-grid-meeting-range-lock-and-layering.
When(
  "the user tabs through the panel from the meeting bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.getByRole("button", { name: SHARE_BUTTON_NAME }).focus();
    visitedByPage.set(
      page,
      await tabUntil(page, (name) => name === MEETING_END_NAME, [
        SHARE_BUTTON_NAME,
      ]),
    );
  },
);

When("the user tabs through the page", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  visitedByPage.set(page, await tabUntil(page, () => false));
});

When(
  "the user presses Tab 3 times and notes the focus each time",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const visited: string[] = [];
    for (let press = 0; press < 3; press++) {
      await page.keyboard.press("Tab");
      visited.push(await focusedName(page));
    }
    visitedByPage.set(page, visited);
  },
);

Then("the focus visited, in this order:", async ({ locationsWorld }, table) => {
  const expectedNames = (table.raw() as string[][]).map(([name]) => name);
  expect(visitedByPage.get(locationsWorld.page)).toEqual(expectedNames);
});

Then(
  /^the Tab stops include (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    expect(visitedByPage.get(locationsWorld.page)).toEqual(
      expect.arrayContaining(parseCityNames(quotedNames)),
    );
  },
);

Then('no Tab stop is a handle "Move …"', async ({ locationsWorld }) => {
  const visited = visitedByPage.get(locationsWorld.page) ?? [];
  expect(visited.length).toBeGreaterThan(0);
  expect(visited.filter((name) => name.startsWith(MOVE_HANDLE_PREFIX))).toEqual(
    [],
  );
});

// Verifies FR3, FR4 of fix-grid-meeting-range-lock-and-layering.
When(
  "the user opens the meeting range input of {string}",
  async ({ locationsWorld }, city: string) => {
    await spanButtonOf(locationsWorld.page, city).click();
    await expect(fieldsOf(locationsWorld.page, city)[0]).toBeFocused();
  },
);

Then(
  "the meeting range input of {string} is closed",
  async ({ locationsWorld }, city: string) => {
    await expect(fieldsOf(locationsWorld.page, city)[0]).toHaveCount(0);
    await expect(fieldsOf(locationsWorld.page, city)[1]).toHaveCount(0);
  },
);

When(
  "the user tabs to the meeting range button of {string} and presses Enter",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await page
      .getByRole("button", { name: /^(Share meeting|Поделиться встречей)$/ })
      .focus();
    const target = spanButtonOf(page, city);
    for (let stop = 0; stop < MAX_TAB_STOPS; stop++) {
      if (
        await target.evaluate((element) => element === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(target).toBeFocused();
    await page.keyboard.press("Enter");
  },
);

When(
  /^the user types "([^"]+)", presses Tab, types "([^"]+)" and presses Enter$/,
  async ({ locationsWorld }, startText: string, endText: string) => {
    const { page } = locationsWorld;
    await page.keyboard.type(startText);
    await page.keyboard.press("Tab");
    await page.keyboard.type(endText);
    await page.keyboard.press("Enter");
  },
);

Then(
  "the focus is on the meeting range button of {string}",
  async ({ locationsWorld }, city: string) => {
    await expect(spanButtonOf(locationsWorld.page, city)).toBeFocused();
  },
);

Then(
  "both fields of the meeting range input are fully inside the viewport",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    for (const field of fieldsOf(page, "Moscow")) {
      const box = await field.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        viewport?.width ?? 0,
      );
    }
  },
);

When(
  "the user confirms {string} and {string} in the meeting range input of {string}",
  async ({ locationsWorld }, startText: string, endText: string, city) => {
    const [startField, endField] = fieldsOf(locationsWorld.page, city);
    await startField.fill(startText);
    await endField.fill(endText);
    await endField.press("Enter");
  },
);

Then(
  "the meeting range input of {string} shows an error",
  async ({ locationsWorld }, city: string) => {
    await expect(
      rowOfCity(locationsWorld.page, city).locator(
        "input[aria-invalid='true']",
      ),
    ).not.toHaveCount(0);
  },
);

// Verifies FR1, FR2, UX1 of fix-grid-meeting-range-lock-and-layering.
Then(
  "every drag handle and every location menu button is disabled",
  async ({ locationsWorld }) => {
    const buttons = locationsWorld.page.locator(LOCKABLE_BUTTONS_SELECTOR);
    expect(await buttons.count()).toBeGreaterThan(0);
    for (const button of await buttons.all()) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveCSS("opacity", "0.4");
    }
  },
);

Then(
  "every drag handle and every location menu button is enabled",
  async ({ locationsWorld }) => {
    const buttons = locationsWorld.page.locator(LOCKABLE_BUTTONS_SELECTOR);
    expect(await buttons.count()).toBeGreaterThan(0);
    for (const button of await buttons.all())
      await expect(button).toBeEnabled();
  },
);

When(
  "the user clicks the location menu button of {string} in spite of the lock",
  async ({ locationsWorld }, city: string) => {
    await menuButton(locationsWorld.page, city).click({ force: true });
  },
);

Then("no location menu is open", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.getByRole("menu")).toHaveCount(0);
});

Then(
  "the location menu button of {string} is disabled",
  async ({ locationsWorld }, city: string) => {
    await expect(menuButton(locationsWorld.page, city)).toBeDisabled();
  },
);

Then("no row offers the wall-time input", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByRole("button", { name: WALL_TIME_BUTTON_PATTERN }),
  ).toHaveCount(0);
});

Then("the page has no horizontal scroll", async ({ locationsWorld }) => {
  const { scrollWidth, clientWidth } = await locationsWorld.page.evaluate(
    () => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
  );
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
