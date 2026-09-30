import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { test } from "./locations_ui_e2e.fixtures";
import {
  addLocationButton,
  buildStoredLocations,
  listRow,
  openSearch,
  parseCityNames,
  queryField,
  removeButton,
  resultOption,
  typeQuery,
} from "./locationsE2eHelpers";
import { enterLocationsState, type LocationsState } from "./locationsStates";

const { Given, When, Then } = createBdd(test);

const SEARCH_DIALOG_ROLE = "dialog";
const TRANSPARENT_COLOUR = "rgba(0, 0, 0, 0)";

// Verifies FR10 of add-locations-via-search: seeded before the app reads it.
Given(
  /^the stored locations are (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    await locationsWorld.seedList(
      buildStoredLocations(parseCityNames(quotedNames)),
    );
    await locationsWorld.reloadIfOpen();
  },
);

// Verifies FR8, UX4 of add-locations-via-search.
When(
  "the user adds {string} from the search",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await openSearch(page);
    await typeQuery(page, cityName);
    await resultOption(page, cityName).click();
  },
);

// Verifies NFR-A2 of add-locations-via-search.
When(
  "the user opens the search with Enter, types {string}, presses Down and Enter",
  async ({ locationsWorld }, query: string) => {
    const { page } = locationsWorld;
    await addLocationButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(queryField(page)).toBeFocused();
    await page.keyboard.type(query);
    await expect(resultOption(page, query)).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  },
);

// Verifies NFR-A2 of add-locations-via-search.
When(
  "the user opens the search with Enter and presses Esc",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await addLocationButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(queryField(page)).toBeFocused();
    await page.keyboard.press("Escape");
  },
);

// Verifies FR10 of add-locations-via-search.
When(
  "the user removes {string}",
  async ({ locationsWorld }, cityName: string) => {
    await removeButton(locationsWorld.page, cityName).click();
  },
);

// Verifies NFR-A3 of add-locations-via-search.
When(
  "the user removes {string} with the keyboard",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await removeButton(page, cityName).focus();
    await page.keyboard.press("Enter");
  },
);

// Verifies NFR-A1, UX5 of add-locations-via-search.
Given(
  /^the locations screen uses the (light|dark) theme$/,
  async ({ locationsWorld }, theme: Theme) => {
    await locationsWorld.page.emulateMedia({ colorScheme: theme });
  },
);

// Verifies NFR-A1, UX1 of add-locations-via-search.
When(
  /^the locations are in the (.+) state$/,
  async ({ locationsWorld }, state: string) => {
    await enterLocationsState(locationsWorld, state as LocationsState);
  },
);

// Verifies FR8 of add-locations-via-search.
Then("the search is closed", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.getByRole(SEARCH_DIALOG_ROLE)).toBeHidden();
});

// Verifies FR8, FR10 of add-locations-via-search.
Then(
  "the locations list shows {string}",
  async ({ locationsWorld }, cityName: string) => {
    await expect(listRow(locationsWorld.page, cityName)).toBeVisible();
  },
);

// Verifies FR10 of add-locations-via-search.
Then(
  "the locations list does not show {string}",
  async ({ locationsWorld }, cityName: string) => {
    await expect(listRow(locationsWorld.page, cityName)).toHaveCount(0);
  },
);

// Verifies FR10, FR17 of add-locations-via-search.
Then(
  "the locations list holds {int} location(s)",
  async ({ locationsWorld }, locationCount: number) => {
    await expect(locationsWorld.page.getByRole("listitem")).toHaveCount(
      locationCount,
    );
  },
);

// Verifies NFR-A2, NFR-A3 of add-locations-via-search.
Then('focus is on the "Add location" action', async ({ locationsWorld }) => {
  await expect(addLocationButton(locationsWorld.page)).toBeFocused();
});

// Verifies NFR-A3 of add-locations-via-search.
Then(
  "focus is on the remove action of {string}",
  async ({ locationsWorld }, cityName: string) => {
    await expect(removeButton(locationsWorld.page, cityName)).toBeFocused();
  },
);

// Verifies NFR-A1, M3 of add-locations-via-search.
Then(
  "the locations screen has no accessibility violations",
  async ({ locationsWorld }) => {
    const accessibilityScan = await new AxeBuilder({
      page: locationsWorld.page,
    }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  },
);

// Verifies UX5 of add-locations-via-search: computed colours equal the tokens.
Then(
  /^the list and the search use the (light|dark) theme token colours$/,
  async ({ locationsWorld }, theme: Theme) => {
    const { page } = locationsWorld;
    const expectedColours = readThemeColours(theme);
    const pageColours = await page
      .locator("main")
      .evaluate((main, transparent) => {
        let backgroundElement: Element | null = main;
        let background = transparent;
        while (backgroundElement && background === transparent) {
          background = getComputedStyle(backgroundElement).backgroundColor;
          backgroundElement = backgroundElement.parentElement;
        }
        return { background, foreground: getComputedStyle(main).color };
      }, TRANSPARENT_COLOUR);
    expect(pageColours).toEqual({
      background: expectedColours.background,
      foreground: expectedColours.foreground,
    });

    const searchDialog = page.getByRole(SEARCH_DIALOG_ROLE);
    if (await searchDialog.isVisible()) {
      await expect(searchDialog).toHaveCSS(
        "background-color",
        expectedColours.surface,
      );
      await expect(searchDialog).toHaveCSS("color", expectedColours.foreground);
    }
    const firstRow = page.getByRole("listitem").first();
    if (await firstRow.isVisible()) {
      await expect(firstRow).toHaveCSS(
        "background-color",
        expectedColours.surface,
      );
    }
  },
);
