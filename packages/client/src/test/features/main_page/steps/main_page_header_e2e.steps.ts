import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  queryField,
  UNREADABLE_DOCUMENT_TEXT,
} from "../../locations/steps/locationsE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { englishLocale } from "./englishTexts";

const { Given, When, Then } = createBdd(test);

const BANNER_ROLE = "banner";
const HEADING_ROLE = "heading";
const BUTTON_ROLE = "button";
const MIN_TARGET_SIZE_PX = 44;
const MAX_ADJACENT_GAP_PX = 24;
const SETTINGS_HEADING = englishLocale.settings.title;

const headerOf = (page: Page) => page.getByRole(BANNER_ROLE);
const headerButton = (page: Page, name: string) =>
  headerOf(page).getByRole(BUTTON_ROLE, { name, exact: true });

/** The left edge of the header part, in the header's reading order. */
const leftEdgeOf = async (part: Locator) => (await requireBox(part)).x;

const headerPart = (page: Page, description: string) => {
  const buttonMatch = description.match(/^the button named "(.+)"$/);
  if (buttonMatch) return headerButton(page, buttonMatch[1]);
  const titleMatch = description.match(/^the title "(.+)"$/);
  if (titleMatch) {
    return headerOf(page).getByRole(HEADING_ROLE, { name: titleMatch[1] });
  }
  throw new Error(`Unknown header part: ${description}`);
};

// Verifies FR2, NFR-R1, UX1 of add-settings-page-and-device-time-location: the header order.
Then(
  /^the header shows, from left to right, (.+), (.+) and (.+)$/,
  async ({ locationsWorld }, first: string, second: string, third: string) => {
    const { page } = locationsWorld;
    const parts = [first, second, third].map((part) => headerPart(page, part));
    await expect(parts[0]).toBeVisible();
    const edges = await Promise.all(parts.map(leftEdgeOf));
    expect(edges).toEqual([...edges].sort((left, right) => left - right));
    expect(new Set(edges).size).toBe(edges.length);
  },
);

// Verifies NFR-R1 of add-settings-page-and-device-time-location: both buttons group at the right.
Then(
  "the button named {string} is directly before the button named {string}",
  async ({ locationsWorld }, firstName: string, secondName: string) => {
    const { page } = locationsWorld;
    const first = await requireBox(headerButton(page, firstName));
    const second = await requireBox(headerButton(page, secondName));
    const gap = second.x - (first.x + first.width);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(MAX_ADJACENT_GAP_PX);
  },
);

Then(
  "the button named {string} shows no visible text",
  async ({ locationsWorld }, name: string) => {
    const visibleText = await headerButton(
      locationsWorld.page,
      name,
    ).innerText();
    expect(visibleText).toBe("");
  },
);

Then(
  "the button named {string} shows the visible text {string}",
  async ({ locationsWorld }, name: string, visibleText: string) => {
    await expect(headerButton(locationsWorld.page, name)).toHaveText(
      visibleText,
    );
  },
);

// Verifies FR1, FR2 of add-settings-page-and-device-time-location.
When(
  "the user chooses the header button named {string}",
  async ({ locationsWorld }, name: string) => {
    await headerButton(locationsWorld.page, name).click();
  },
);

When(
  "the user closes the search with Esc and chooses the header button named {string}",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    await page.keyboard.press("Escape");
    await expect(queryField(page)).toBeHidden();
    await headerButton(page, name).click();
  },
);

Then("the settings page is shown", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByRole(HEADING_ROLE, { name: SETTINGS_HEADING }),
  ).toBeVisible();
});

Then(
  "exactly one button is named {string}",
  async ({ locationsWorld }, name: string) => {
    await expect(
      locationsWorld.page.getByRole(BUTTON_ROLE, { name, exact: true }),
    ).toHaveCount(1);
  },
);

// Verifies FR2 of add-settings-page-and-device-time-location: no search over an unreadable list.
Given("the stored list is unreadable", async ({ locationsWorld }) => {
  await locationsWorld.seedDocument(UNREADABLE_DOCUMENT_TEXT);
});

Then("the load error with Reset is shown", async ({ locationsWorld }) => {
  const alert = locationsWorld.page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(
    alert.getByRole(BUTTON_ROLE, { name: englishLocale.locations.reset }),
  ).toBeVisible();
});

Then(
  "the header shows the button named {string} and no button named {string}",
  async ({ locationsWorld }, shownName: string, absentName: string) => {
    const { page } = locationsWorld;
    await expect(headerButton(page, shownName)).toBeVisible();
    await expect(headerButton(page, absentName)).toHaveCount(0);
  },
);

// Verifies NFR-A2 of add-settings-page-and-device-time-location: targets of 44 by 44 px.
Then(
  "both header buttons are at least {int} by {int} px",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    const { page } = locationsWorld;
    expect([minWidth, minHeight]).toEqual([
      MIN_TARGET_SIZE_PX,
      MIN_TARGET_SIZE_PX,
    ]);
    for (const name of ["Add location", "Settings"]) {
      const box = await requireBox(headerButton(page, name));
      expect(box.width).toBeGreaterThanOrEqual(minWidth);
      expect(box.height).toBeGreaterThanOrEqual(minHeight);
    }
  },
);
