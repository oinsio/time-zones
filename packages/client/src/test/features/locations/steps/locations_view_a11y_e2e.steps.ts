import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { test } from "./locations_ui_e2e.fixtures";
import { enterLocationsState, type LocationsState } from "./locationsStates";

const { Given, When, Then } = createBdd(test);

const SEARCH_DIALOG_ROLE = "dialog";
const TRANSPARENT_COLOUR = "rgba(0, 0, 0, 0)";

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
