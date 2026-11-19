import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  queryField,
  UNREADABLE_DOCUMENT_TEXT,
} from "../../locations/steps/locationsE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { englishLocale } from "./englishTexts";
import { readThemeColours } from "./themeTokens";

const { Given, When, Then } = createBdd(test);

const BANNER_ROLE = "banner";
const HEADING_ROLE = "heading";
const BUTTON_ROLE = "button";
const MIN_TARGET_SIZE_PX = 44;
const CENTRE_TOLERANCE_PX = 1;
const MAX_TAB_PRESSES = 12;
const SETTINGS_HEADING = englishLocale.settings.title;
const HEADER_ICON_SIZE_PX = 27;
const HEADER_BUTTON_COUNT = 2;
const CONTENT_COLUMN_MAX_WIDTH_PX = 1120;
const COLUMN_PADDING_PX = 32;
const TITLE_FONT_WEIGHT = "700";

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

// Verifies NFR-A3 of redesign-cards-grid-and-day-palettes: targets of 44 by 44 px and icons of 27 px.
Then(
  "both header buttons are at least {int} by {int} px and their icons {int} px",
  async (
    { locationsWorld },
    minWidth: number,
    minHeight: number,
    iconSize: number,
  ) => {
    const { page } = locationsWorld;
    expect([minWidth, minHeight, iconSize]).toEqual([
      MIN_TARGET_SIZE_PX,
      MIN_TARGET_SIZE_PX,
      HEADER_ICON_SIZE_PX,
    ]);
    for (const name of ["Add location", "Settings"]) {
      const button = headerButton(page, name);
      const box = await requireBox(button);
      expect(box.width).toBeGreaterThanOrEqual(minWidth);
      expect(box.height).toBeGreaterThanOrEqual(minHeight);
      const iconBox = await requireBox(button.locator("svg"));
      expect(iconBox.width).toBe(iconSize);
      expect(iconBox.height).toBe(iconSize);
    }
  },
);

// Verifies FR6, UX1 of redesign-cards-grid-and-day-palettes: accent icons without text.
Then(
  "both header buttons show an icon in the accent colour and no visible text",
  async ({ locationsWorld }) => {
    const buttons = headerOf(locationsWorld.page).getByRole(BUTTON_ROLE);
    await expect(buttons).toHaveCount(HEADER_BUTTON_COUNT);
    for (const button of await buttons.all()) {
      await expect(button.locator("svg")).toBeVisible();
      expect(await button.innerText()).toBe("");
      await expect(button).toHaveCSS("color", readThemeColours("light").accent);
    }
  },
);

Then("the header has no bottom border", async ({ locationsWorld }) => {
  await expect(headerOf(locationsWorld.page)).toHaveCSS(
    "border-bottom-width",
    "0px",
  );
});

// Verifies FR12 of redesign-cards-grid-and-day-palettes: the header fills the content column.
Then(
  "the title starts at the left edge of the content column and the settings button ends at its right edge",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewportWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    const columnWidth = Math.min(viewportWidth, CONTENT_COLUMN_MAX_WIDTH_PX);
    const columnLeft = (viewportWidth - columnWidth) / 2;
    const titleBox = await requireBox(headerOf(page).getByRole(HEADING_ROLE));
    const settingsBox = await requireBox(headerButton(page, "Настройки"));
    expect(titleBox.x).toBeGreaterThanOrEqual(columnLeft);
    expect(titleBox.x - columnLeft).toBeLessThanOrEqual(COLUMN_PADDING_PX);
    expect(settingsBox.x + settingsBox.width).toBeLessThanOrEqual(
      columnLeft + columnWidth,
    );
    expect(
      columnLeft + columnWidth - (settingsBox.x + settingsBox.width),
    ).toBeLessThanOrEqual(COLUMN_PADDING_PX);
  },
);

Then(
  "the title font size is {int} px and its weight 700",
  async ({ locationsWorld }, fontSize: number) => {
    const title = headerOf(locationsWorld.page).getByRole(HEADING_ROLE);
    await expect(title).toHaveCSS("font-size", `${fontSize}px`);
    await expect(title).toHaveCSS("font-weight", TITLE_FONT_WEIGHT);
  },
);

Then(
  "the title is left of the button named {string}",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    const titleBox = await requireBox(headerOf(page).getByRole(HEADING_ROLE));
    const buttonBox = await requireBox(headerButton(page, name));
    expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(buttonBox.x);
  },
);

// Verifies FR6 of redesign-cards-grid-and-day-palettes: Settings is the last control of the header.
Then(
  "the button named {string} is the rightmost header control",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    const buttonBox = await requireBox(headerButton(page, name));
    for (const other of await headerOf(page).getByRole(BUTTON_ROLE).all()) {
      const otherBox = await requireBox(other);
      expect(otherBox.x + otherBox.width).toBeLessThanOrEqual(
        buttonBox.x + buttonBox.width + CENTRE_TOLERANCE_PX,
      );
    }
  },
);

// Verifies NFR-A1 of fix-location-card-and-header-layout: DOM order is the Tab order.
Then(
  "Tab reaches the button named {string} before the button named {string}",
  async ({ locationsWorld }, firstName: string, secondName: string) => {
    const { page } = locationsWorld;
    const reachedNames: string[] = [];
    for (let press = 0; press < MAX_TAB_PRESSES; press += 1) {
      await page.keyboard.press("Tab");
      reachedNames.push(
        await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? "",
        ),
      );
    }
    const firstIndex = reachedNames.indexOf(firstName);
    expect(firstIndex).toBeGreaterThanOrEqual(0);
    expect(reachedNames.indexOf(secondName)).toBeGreaterThan(firstIndex);
  },
);

// Verifies FR13 of add-grid-meeting-range-and-share: the meeting bar is the whole header while a meeting range is set.
Then(
  /^the header shows the meeting bar, with no button named "([^"]+)" or "([^"]+)" and no title "([^"]+)"$/,
  async ({ locationsWorld }, addName: string, settingsName, title: string) => {
    const header = headerOf(locationsWorld.page);
    await expect(header.getByRole(HEADING_ROLE)).toHaveText(/^Встреча · /);
    await expect(header.getByRole(BUTTON_ROLE, { name: addName })).toHaveCount(
      0,
    );
    await expect(
      header.getByRole(BUTTON_ROLE, { name: settingsName }),
    ).toHaveCount(0);
    await expect(header.getByRole(HEADING_ROLE, { name: title })).toHaveCount(
      0,
    );
  },
);

Then(/^pressing "\/" opens no search$/, async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await page.keyboard.press("/");
  await expect(queryField(page)).toHaveCount(0);
});

// Verifies FR13 of add-grid-meeting-range-and-share: the other tab picks Cards in the settings.
When(
  "the view mode becomes Cards in another tab",
  async ({ locationsWorld }) => {
    const otherTab = await locationsWorld.openOtherTab();
    await otherTab
      .getByRole(BUTTON_ROLE, { name: englishLocale.settings.open })
      .click();
    await otherTab.getByRole("radio", { name: "Cards" }).check({ force: true });
  },
);
