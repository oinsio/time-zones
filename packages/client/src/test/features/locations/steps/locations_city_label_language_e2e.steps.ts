import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { STORAGE_KEYS } from "@/constants";
import { openSettings } from "../../settings/steps/settingsE2eHelpers";
import {
  languageButton,
  languageList,
} from "../../settings/steps/settingsLanguageE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { menuButton } from "./locationsE2eHelpers";

const { When, Then } = createBdd(test);

const BUTTON_ROLE = "button";
/** The back button is named «Назад» in Russian, so scenarios in both languages find it. */
const BACK_BUTTON_NAME = /^(Back|Назад)$/;
const recordedDocuments = new WeakMap<object, string | null>();

// Verifies FR2 of show-city-labels-in-interface-language: the switch reaches the cards through the settings.
When(
  "the user switches the interface language to {string}",
  async ({ locationsWorld }, languageName: string) => {
    const { page } = locationsWorld;
    await openSettings(page);
    await languageButton(page).click();
    await languageList(page)
      .getByRole(BUTTON_ROLE, { name: languageName })
      .click();
    await expect(languageList(page)).toHaveCount(0);
    await page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME }).click();
  },
);

// Verifies FR1, FR2 of show-city-labels-in-interface-language.
Then(
  "the card reads {string}",
  async ({ locationsWorld }, cityName: string) => {
    await expect(
      locationsWorld.page.getByRole("listitem").getByText(cityName, {
        exact: true,
      }),
    ).toBeVisible();
  },
);

// Verifies FR2 of show-city-labels-in-interface-language: the stored list is not rewritten by a switch.
When(
  "the stored locations document is recorded",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    recordedDocuments.set(
      page,
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        STORAGE_KEYS.LOCATIONS,
      ),
    );
  },
);

Then(
  "the stored locations document is unchanged",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const currentDocument = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      STORAGE_KEYS.LOCATIONS,
    );
    expect(currentDocument).toBe(recordedDocuments.get(page));
  },
);

// Verifies FR3, NFR-A1 of show-city-labels-in-interface-language.
Then(
  "the location menu button is named {string}",
  async ({ locationsWorld }, name: string) => {
    const cityName = name.replace(/^Actions for /, "");
    await expect(menuButton(locationsWorld.page, cityName)).toBeVisible();
  },
);

Then(
  "the time button's name starts with {string}",
  async ({ locationsWorld }, namePrefix: string) => {
    await expect(
      locationsWorld.page
        .locator(`button[aria-label^="${namePrefix}"]`)
        .first(),
    ).toBeVisible();
  },
);
