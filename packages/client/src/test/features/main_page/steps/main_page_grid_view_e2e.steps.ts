import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  ALL_ZONE_LABEL_PARTS,
  seedPreferences,
} from "../../settings/steps/settingsE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { readThemeColours, type Theme } from "./themeTokens";

const { Given, Then } = createBdd(test);

const GRID_VIEW_ID = "grid";
const GRID_VIEW_SELECTOR = `[data-view-id="${GRID_VIEW_ID}"]`;
const GRID_PANEL_SELECTOR = 'ul[data-row-variant="grid-row"]';
const ZONE_LINE_SELECTOR = "[data-zone-line]";
const NETWORK_NOTE_PATTERN = /network|offline|сеть|офлайн/i;
const SEEDED_THEME = "SYSTEM";
const SEEDED_HOUR_FORMAT = "H24";

// Implements FR7 of add-view-mode-setting-and-grid-skeleton: the stored view mode, read by the app from its first render.
Given("the view mode is Grid", async ({ locationsWorld }) => {
  await seedPreferences(
    locationsWorld.page,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: {
        theme: SEEDED_THEME,
        hourFormat: SEEDED_HOUR_FORMAT,
        interfaceLanguage: locationsWorld.seededInterfaceLanguage,
        zoneLabelParts: ALL_ZONE_LABEL_PARTS,
        viewMode: GRID_VIEW_ID,
        dayColouring: "TIME_OF_DAY",
        workingHours: { start: "10:00", end: "18:00" },
        dayPalette: "VIVID",
        shareLanguage: null,
        shareZoneLabelParts: ["UTC_OFFSET", "ZONE_ABBREVIATION"],
        enabledTools: [],
      },
    }),
  );
});

// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton.
Then(
  "the zone line of {string} is on the same line as its city",
  async ({ locationsWorld }, city: string) => {
    const row = listRow(locationsWorld.page, city);
    const cityBox = await requireBox(row.getByText(city, { exact: true }));
    const zoneLineBox = await requireBox(row.locator(ZONE_LINE_SELECTOR));
    expect(zoneLineBox.y).toBeLessThan(cityBox.y + cityBox.height);
    expect(zoneLineBox.y + zoneLineBox.height).toBeGreaterThan(cityBox.y);
  },
);

// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton.
Then(
  "the date of {string} is on the same line as its time and before it",
  async ({ locationsWorld }, city: string) => {
    const row = listRow(locationsWorld.page, city);
    const dateBox = await requireBox(row.locator("time"));
    const timeBox = await requireBox(
      row.getByRole("button", { name: /^Enter time/ }),
    );
    expect(dateBox.y).toBeLessThan(timeBox.y + timeBox.height);
    expect(dateBox.y + dateBox.height).toBeGreaterThan(timeBox.y);
    expect(dateBox.x + dateBox.width).toBeLessThanOrEqual(timeBox.x);
  },
);

// Verifies UX3 of add-view-mode-setting-and-grid-skeleton: the row and panel colours are the theme tokens.
Then(
  /^every Grid row has the surface colour of the (light|dark) theme$/,
  async ({ locationsWorld }, theme: Theme) => {
    const { surface } = readThemeColours(theme);
    const rows = locationsWorld.page
      .locator(GRID_PANEL_SELECTOR)
      .getByRole("listitem");
    await expect(rows).not.toHaveCount(0);
    for (const row of await rows.all()) {
      await expect(row).toHaveCSS("background-color", surface);
    }
  },
);

Then(
  /^the Grid panel has the border colour of the (light|dark) theme$/,
  async ({ locationsWorld }, theme: Theme) => {
    await expect(locationsWorld.page.locator(GRID_PANEL_SELECTOR)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).cardBorder,
    );
  },
);

// Verifies FR7 of add-view-mode-setting-and-grid-skeleton: Grid offline.
Then(
  "the Grid view shows the rows of {string} and {string}",
  async ({ locationsWorld }, firstCity: string, secondCity: string) => {
    const rows = locationsWorld.page
      .locator(GRID_VIEW_SELECTOR)
      .getByRole("listitem");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(firstCity);
    await expect(rows.nth(1)).toContainText(secondCity);
  },
);

Then(
  "the Grid view shows only the row of {string}",
  async ({ locationsWorld }, city: string) => {
    const rows = locationsWorld.page
      .locator(GRID_VIEW_SELECTOR)
      .getByRole("listitem");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(city);
  },
);

Then(
  "no note or alert about the network is shown",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByRole("alert")).toHaveCount(0);
    for (const statusText of await page.getByRole("status").allTextContents()) {
      expect(statusText).not.toMatch(NETWORK_NOTE_PATTERN);
    }
  },
);

const LIGHT_ROW_HEADER_WEIGHT = "700";
const GRID_PANEL_RADIUS_PX = 14;

// Verifies FR17 of redesign-cards-grid-and-day-palettes: the row header sizes.
Then(
  /^the city of "([^"]+)" is (\d+) px and its time (\d+) px(, both weight 700)?$/,
  async (
    { locationsWorld },
    city: string,
    citySize: string,
    timeSize: string,
    bothBold: string | undefined,
  ) => {
    const row = listRow(locationsWorld.page, city);
    const cityText = row.getByText(city, { exact: true }).first();
    const timeButton = row.getByRole("button", { name: /^Enter time/ });
    await expect(cityText).toHaveCSS("font-size", `${citySize}px`);
    await expect(timeButton).toHaveCSS("font-size", `${timeSize}px`);
    if (bothBold !== undefined) {
      await expect(cityText).toHaveCSS("font-weight", LIGHT_ROW_HEADER_WEIGHT);
      await expect(timeButton).toHaveCSS(
        "font-weight",
        LIGHT_ROW_HEADER_WEIGHT,
      );
    }
  },
);

Then("the Grid panel has a radius of 14 px", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.locator(GRID_PANEL_SELECTOR)).toHaveCSS(
    "border-top-left-radius",
    `${GRID_PANEL_RADIUS_PX}px`,
  );
});

Then(
  /^the divider between the Grid rows has the (light|dark) card border colour$/,
  async ({ locationsWorld }, theme: Theme) => {
    const rows = locationsWorld.page
      .locator(GRID_PANEL_SELECTOR)
      .getByRole("listitem");
    await expect(rows.nth(1)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).cardBorder,
    );
  },
);
