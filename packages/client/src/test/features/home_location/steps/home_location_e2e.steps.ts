import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  buildStoredLocations,
  listRow,
  menuButton,
  parseCityNames,
} from "../../locations/steps/locationsE2eHelpers";
import { readListOrder } from "../../locations/steps/locationsReorderE2eHelpers";

const { Given, When, Then } = createBdd(test);

const RUSSIAN_LANGUAGE = "ru";
const MENU_ROLE = "menu";
const MENU_ITEM_ROLE = "menuitem";

const menuItem = (page: Page, itemName: string) =>
  page.getByRole(MENU_ITEM_ROLE, { name: itemName });

// Verifies FR1, FR7 of set-home-location-and-show-differences: seeds a list with its home.
Given(
  /^the list holds (.+) and home is "([^"]+)"$/,
  async ({ locationsWorld }, quotedNames: string, homeCityName: string) => {
    const [homeLocation] = buildStoredLocations([homeCityName]);
    await locationsWorld.seedList(
      buildStoredLocations(parseCityNames(quotedNames)),
      homeLocation,
    );
    await locationsWorld.reloadIfOpen();
  },
);

// Verifies FR12 of set-home-location-and-show-differences.
Given(
  "the locations interface language is Russian",
  async ({ locationsWorld }) => {
    await locationsWorld.seedLanguage(RUSSIAN_LANGUAGE);
  },
);

// Verifies FR11, NFR-A2 of set-home-location-and-show-differences.
When(
  "the user focuses the location menu button of {string} and presses Enter",
  async ({ locationsWorld }, cityName: string) => {
    await menuButton(locationsWorld.page, cityName).focus();
    await locationsWorld.page.keyboard.press("Enter");
  },
);

When("the user presses Esc", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press("Escape");
});

Then(
  "the menu opens with focus on its first item",
  async ({ locationsWorld }) => {
    const items = locationsWorld.page.getByRole(MENU_ITEM_ROLE);
    await expect(locationsWorld.page.getByRole(MENU_ROLE)).toBeVisible();
    await expect(items.first()).toBeFocused();
  },
);

Then(
  "the menu is closed and focus is on the location menu button of {string}",
  async ({ locationsWorld }, cityName: string) => {
    await expect(locationsWorld.page.getByRole(MENU_ROLE)).toBeHidden();
    await expect(menuButton(locationsWorld.page, cityName)).toBeFocused();
  },
);

// Verifies FR11, UX3 of set-home-location-and-show-differences: opening the menu does not reorder.
Then(
  "the list order is still {string}",
  async ({ locationsWorld }, expectedOrder: string) => {
    expect(await readListOrder(locationsWorld.page)).toEqual(
      expectedOrder.split(", "),
    );
  },
);

When(
  "the user chooses {string} in the location menu of {string}",
  async ({ locationsWorld }, itemName: string, cityName: string) => {
    await menuButton(locationsWorld.page, cityName).click();
    await menuItem(locationsWorld.page, itemName).click();
  },
);

// Verifies FR11, FR12 of set-home-location-and-show-differences: names in both languages.
Then(
  "the menu offers the items {string}",
  async ({ locationsWorld }, quotedItems: string) => {
    const itemNames = quotedItems.split(", ");
    await expect(locationsWorld.page.getByRole(MENU_ITEM_ROLE)).toHaveText(
      itemNames,
    );
  },
);

When(
  "the user opens the location menu named {string}",
  async ({ locationsWorld }, buttonName: string) => {
    await locationsWorld.page.getByRole("button", { name: buttonName }).click();
  },
);

Then(
  "the row of {string} has a mark named {string}",
  async ({ locationsWorld }, cityName: string, markName: string) => {
    await expect(
      listRow(locationsWorld.page, cityName).getByRole("img", {
        name: markName,
      }),
    ).toBeVisible();
  },
);

Then(
  "the row of {string} has no mark named {string}",
  async ({ locationsWorld }, cityName: string, markName: string) => {
    await expect(
      listRow(locationsWorld.page, cityName).getByRole("img", {
        name: markName,
      }),
    ).toHaveCount(0);
  },
);

// Verifies NFR-R1 of set-home-location-and-show-differences.
When(
  "the location menu of {string} is open",
  async ({ locationsWorld }, cityName: string) => {
    await menuButton(locationsWorld.page, cityName).click();
    await expect(locationsWorld.page.getByRole(MENU_ROLE)).toBeVisible();
  },
);
