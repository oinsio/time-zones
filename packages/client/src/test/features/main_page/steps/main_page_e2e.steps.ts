import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type MainPageWorld, test } from "./main_page_e2e.fixtures";
import {
  APP_ROOT_URL,
  EMPTY_STATE_TEXT,
  ERROR_TEXT,
  failStorageWrites,
  installServiceWorker,
  STORAGE_WARNING_TEXT,
} from "./mainPageE2eHelpers";
import { readThemeColours, type Theme } from "./themeTokens";

const { Given, When, Then } = createBdd(test);

const SCREEN_HEIGHT_PX = 800;
const NOTICE_CARD_SELECTOR = '[role="status"] > div';
const BUSY_SKELETON_SELECTOR = '[aria-busy="true"]';
const MAIN_SELECTOR = "main";

enum MainPageState {
  LOADING = "loading",
  ERROR = "error",
  EMPTY = "empty",
  OFFLINE = "offline",
  STORAGE_UNAVAILABLE = "storage unavailable",
}

Given(
  /^the user prefers the (light|dark) theme$/,
  async ({ mainPageWorld }, theme: Theme) => {
    await mainPageWorld.page.emulateMedia({ colorScheme: theme });
  },
);

Given(
  "the screen is {int} px wide for the main page",
  async ({ mainPageWorld }, screenWidth: number) => {
    await mainPageWorld.page.setViewportSize({
      width: screenWidth,
      height: SCREEN_HEIGHT_PX,
    });
  },
);

// Verifies NFR-A1, NFR-R1 of add-main-page-scaffold: each UI state of the page.
When(
  /^the main page is in the (loading|error|empty|offline|storage unavailable) state$/,
  async ({ mainPageWorld }, state: string) => {
    await enterState(mainPageWorld, state);
  },
);

async function enterState(mainPageWorld: MainPageWorld, state: string) {
  const { page } = mainPageWorld;
  switch (state) {
    case MainPageState.LOADING:
      await mainPageWorld.holdCardsChunk();
      await page.goto(APP_ROOT_URL);
      await expect(page.locator(BUSY_SKELETON_SELECTOR)).toBeVisible();
      break;
    case MainPageState.ERROR:
      await mainPageWorld.blockCardsChunk();
      await page.goto(APP_ROOT_URL);
      await expect(page.getByRole("alert")).toContainText(ERROR_TEXT);
      break;
    case MainPageState.EMPTY:
      await page.goto(APP_ROOT_URL);
      await expect(page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
      break;
    case MainPageState.OFFLINE:
      await installServiceWorker(mainPageWorld);
      await page.context().setOffline(true);
      await page.reload();
      await expect(page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
      break;
    case MainPageState.STORAGE_UNAVAILABLE:
      await page.addInitScript(failStorageWrites);
      await page.goto(APP_ROOT_URL);
      await expect(page.getByText(STORAGE_WARNING_TEXT)).toBeVisible();
      await expect(page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
      break;
    default:
      throw new Error(`Unknown main page state: ${state}`);
  }
}

// Verifies NFR-A1, M2 of add-main-page-scaffold.
Then(
  "the main page has no accessibility violations",
  async ({ mainPageWorld }) => {
    const accessibilityScan = await new AxeBuilder({
      page: mainPageWorld.page,
    }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  },
);

// Verifies UX2 of add-main-page-scaffold: computed colours equal the tokens.
Then(
  /^the content and every shown notice use the (light|dark) theme colours$/,
  async ({ mainPageWorld }, theme: Theme) => {
    const { page } = mainPageWorld;
    const expectedColours = readThemeColours(theme);
    const contentColours = await page
      .locator(MAIN_SELECTOR)
      .evaluate((main) => {
        let backgroundElement: Element | null = main;
        let backgroundColour = "rgba(0, 0, 0, 0)";
        while (backgroundElement && backgroundColour === "rgba(0, 0, 0, 0)") {
          backgroundColour =
            getComputedStyle(backgroundElement).backgroundColor;
          backgroundElement = backgroundElement.parentElement;
        }
        return {
          background: backgroundColour,
          foreground: getComputedStyle(main).color,
        };
      });
    expect(contentColours).toEqual({
      background: expectedColours.background,
      foreground: expectedColours.foreground,
    });

    const noticeColours = await page
      .locator(NOTICE_CARD_SELECTOR)
      .evaluateAll((noticeCards) =>
        noticeCards.map((noticeCard) => ({
          background: getComputedStyle(noticeCard).backgroundColor,
          foreground: getComputedStyle(noticeCard).color,
        })),
      );
    for (const shownNotice of noticeColours) {
      expect(shownNotice).toEqual({
        background: expectedColours.notice,
        foreground: expectedColours.noticeForeground,
      });
    }
  },
);

// Verifies NFR-R1 of add-main-page-scaffold.
Then(
  "the main page does not scroll horizontally",
  async ({ mainPageWorld }) => {
    const pageWidths = await mainPageWorld.page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(pageWidths.scrollWidth).toBeLessThanOrEqual(pageWidths.clientWidth);
  },
);
