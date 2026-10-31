import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import {
  BUTTON_ROLE,
  HOUR_FORMAT_VALUES,
  seedPreferences,
  settingsButton,
  THEME_RECORDER_KEY,
  THEME_VALUES,
  UNREADABLE_PREFERENCES_TEXT,
} from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

// Verifies FR7 of add-settings-page-and-device-time-location: stored and unreadable preferences.
Given("the stored preferences are unreadable", async ({ locationsWorld }) => {
  await seedPreferences(locationsWorld.page, UNREADABLE_PREFERENCES_TEXT);
});

Given(
  "the stored preferences are theme {word} and hour format {word}",
  async ({ locationsWorld }, themeName: string, hourFormatName: string) => {
    const hourFormat =
      HOUR_FORMAT_VALUES[hourFormatName] ?? HOUR_FORMAT_VALUES["24-hour"];
    await seedPreferences(
      locationsWorld.page,
      JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        payload: { theme: THEME_VALUES[themeName], hourFormat },
      }),
    );
  },
);

Then(
  "the settings show the unreadable note with Reset",
  async ({ locationsWorld }) => {
    const note = locationsWorld.page.getByRole("alert");
    await expect(note).toContainText(englishLocale.settings.unreadable);
    await expect(
      note.getByRole(BUTTON_ROLE, { name: englishLocale.settings.reset }),
    ).toBeVisible();
  },
);

Given("the app is installed for offline use", async ({ locationsWorld }) => {
  await locationsWorld.page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await locationsWorld.page.reload();
  await locationsWorld.page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
  );
});

When("the preferences are stored", async ({ locationsWorld }) => {
  await expect
    .poll(() =>
      locationsWorld.page.evaluate(
        (key) => window.localStorage.getItem(key),
        STORAGE_KEYS.PREFERENCES,
      ),
    )
    .not.toBeNull();
});

// Verifies FR4, NFR-A3 of add-settings-page-and-device-time-location: tokens read from tokens.css.
Given(
  /^the system colour scheme is (light|dark)$/,
  async ({ locationsWorld }, scheme: "light" | "dark") => {
    await locationsWorld.page.emulateMedia({ colorScheme: scheme });
  },
);

When(
  /^the system colour scheme becomes (light|dark)$/,
  async ({ locationsWorld }, scheme: "light" | "dark") => {
    await locationsWorld.page.emulateMedia({ colorScheme: scheme });
  },
);

Then(
  /^the page background is the (light|dark) token colour$/,
  async ({ locationsWorld }, theme: "light" | "dark") => {
    await expect(locationsWorld.page.locator("body")).toHaveCSS(
      "background-color",
      readThemeColours(theme).background,
    );
  },
);

// Verifies FR4, FR7 of add-settings-page-and-device-time-location: the stored theme is set before the header renders.
Given(
  "the stored theme is recorded when the header first appears",
  async ({ locationsWorld }) => {
    await locationsWorld.page.addInitScript((recorderKey) => {
      const observer = new MutationObserver(() => {
        if (document.querySelector("header")) {
          (window as unknown as Record<string, unknown>)[recorderKey] =
            document.documentElement.dataset.theme;
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    }, THEME_RECORDER_KEY);
  },
);

Then(
  "the dark theme was applied when the header first appeared",
  async ({ locationsWorld }) => {
    await expect(settingsButton(locationsWorld.page)).toBeVisible();
    const recordedTheme = await locationsWorld.page.evaluate(
      (recorderKey) =>
        (window as unknown as Record<string, unknown>)[recorderKey],
      THEME_RECORDER_KEY,
    );
    expect(recordedTheme).toBe("dark");
  },
);

// Verifies FR5 of add-settings-page-and-device-time-location: shown times and hour labels.
Then(
  "the time of {string} reads {string}",
  async ({ locationsWorld }, city: string, time: string) => {
    const row = locationsWorld.page
      .getByRole("listitem")
      .filter({ hasText: city });
    await expect(
      row.locator("time").locator("xpath=preceding-sibling::button"),
    ).toHaveText(time);
  },
);

Then(
  "the hour labels of {string} are {string}",
  async ({ locationsWorld }, city: string, labelsText: string) => {
    const row = locationsWorld.page
      .getByRole("listitem")
      .filter({ hasText: city });
    const labels = await row.locator("[data-hour-label]").allTextContents();
    expect(labels.map((label) => label.trim())).toEqual(labelsText.split(", "));
  },
);
