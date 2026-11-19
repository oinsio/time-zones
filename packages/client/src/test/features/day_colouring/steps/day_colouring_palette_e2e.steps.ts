// Verifies FR4, FR17 of redesign-cards-grid-and-day-palettes: the day palette in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { cellOf } from "../../grid_view/steps/hourGridE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  type DayPaletteName,
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { seedPreferenceFields } from "../../settings/steps/settingsE2eHelpers";
import { dayTrackBarOf } from "./dayColouringE2eHelpers";
import { STORAGE_KEYS } from "@/constants";

const { Given, When, Then } = createBdd(test);

const PALETTE_VALUES: Record<string, string> = {
  Vivid: "VIVID",
  Muted: "MUTED",
};
const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;
const CHANNEL_START_INDEXES = [1, 3, 5];
const NIGHT_COLUMN = 3;
const MORNING_COLUMN = 6;
const DAYLIGHT_COLUMN = 9;
const EVENING_COLUMN = 17;
const MUTED_PALETTE_VALUE = "MUTED";

const toComputedRgb = (hexColour: string): string =>
  `rgb(${CHANNEL_START_INDEXES.map((startIndex) =>
    Number.parseInt(
      hexColour.slice(startIndex, startIndex + HEX_DIGITS_PER_CHANNEL),
      HEX_RADIX,
    ),
  ).join(", ")})`;

const trackLooksOf = new WeakMap<Page, string>();

/** What the city draws: the track gradient of Cards or the cell backgrounds of Grid. */
const readLookOf = (page: Page): Promise<string> =>
  page.evaluate(() =>
    Array.from(
      document.querySelectorAll("[data-day-track-bar], [data-hour-cell]"),
    )
      .map((element) => {
        const style = getComputedStyle(element);
        return `${style.backgroundImage}|${style.backgroundColor}`;
      })
      .join(";"),
  );

Given(
  "the day palette is {string}",
  async ({ locationsWorld }, paletteName: string) => {
    await seedPreferenceFields(
      locationsWorld.page,
      { dayPalette: PALETTE_VALUES[paletteName] },
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

Then(
  "the night colour used by {string} is {string}",
  async ({ locationsWorld }, city: string, nightHex: string) => {
    const { page } = locationsWorld;
    const nightColour = toComputedRgb(nightHex);
    const trackBar = dayTrackBarOf(page, city);
    if (await trackBar.count()) {
      await expect
        .poll(() =>
          trackBar.evaluate(
            (element) => getComputedStyle(element).backgroundImage,
          ),
        )
        .toContain(nightColour);
    } else {
      await expect.poll(() => readLookOf(page)).toContain(nightColour);
    }
  },
);

When(
  "the user switches the day palette from Vivid to Muted",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(
      page.locator("[data-day-track-bar], [data-hour-cell]").first(),
    ).toBeAttached();
    trackLooksOf.set(page, await readLookOf(page));
    await page.evaluate(
      ({ key, mutedValue }) => {
        const stored = JSON.parse(window.localStorage.getItem(key) ?? "{}");
        stored.payload = { ...stored.payload, dayPalette: mutedValue };
        window.localStorage.setItem(key, JSON.stringify(stored));
      },
      { key: STORAGE_KEYS.PREFERENCES, mutedValue: MUTED_PALETTE_VALUE },
    );
    await page.reload();
    await expect(
      page.locator("li", { hasText: "Almaty" }).first(),
    ).toBeVisible();
  },
);

Then(
  "the colours of the tracks have not changed",
  async ({ locationsWorld }) => {
    const before = trackLooksOf.get(locationsWorld.page);
    expect(before).toBeTruthy();
    expect(await readLookOf(locationsWorld.page)).toBe(before);
  },
);

Then(
  /^column 3 of "([^"]+)" has the night colour, column 6 the morning, column 9 the daylight and column 17 the evening colour of the (light|dark) theme and the (Vivid|Muted) palette$/,
  async (
    { locationsWorld },
    city: string,
    theme: Theme,
    paletteName: string,
  ) => {
    const colours = readThemeColours(
      theme,
      paletteName.toLowerCase() as DayPaletteName,
    );
    const { page } = locationsWorld;
    const expectations: [number, string][] = [
      [NIGHT_COLUMN, colours.dayNight],
      [MORNING_COLUMN, colours.dayMorning],
      [DAYLIGHT_COLUMN, colours.dayDaylight],
      [EVENING_COLUMN, colours.dayEvening],
    ];
    for (const [column, colour] of expectations) {
      await expect(cellOf(page, city, column)).toHaveCSS(
        "background-color",
        colour,
      );
    }
  },
);

Then(
  /^the digits of the night cells of "([^"]+)" are "(#[0-9a-f]{6})" and those of its day cells "(#[0-9a-f]{6})"$/,
  async (
    { locationsWorld },
    city: string,
    nightDigits: string,
    dayDigits: string,
  ) => {
    const { page } = locationsWorld;
    await expect(cellOf(page, city, NIGHT_COLUMN)).toHaveCSS(
      "color",
      toComputedRgb(nightDigits),
    );
    await expect(cellOf(page, city, DAYLIGHT_COLUMN)).toHaveCSS(
      "color",
      toComputedRgb(dayDigits),
    );
  },
);
