import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "./englishTexts";
import {
  type BoundingBox,
  type MainPageWorld,
  test,
} from "./main_page_e2e.fixtures";
import { readThemeColours, type Theme } from "./themeTokens";

const { Given, When, Then } = createBdd(test);

const APP_ROOT_URL = ".";
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

const EMPTY_STATE_TEXT = englishLocale.views.cardsEmptyState;
const ERROR_TEXT = englishLocale.mainPage.viewError;
const RETRY_LABEL = englishLocale.mainPage.retry;
const UPDATE_CHECK_FAILED_TEXT = englishLocale.mainPage.updateCheckFailed;
const STORAGE_WARNING_TEXT = englishLocale.mainPage.storageUnavailable;

const failStorageWrites = () => {
  Storage.prototype.setItem = () => {
    throw new DOMException("quota", "QuotaExceededError");
  };
};

// Verifies NFR-A1 of add-main-page-scaffold: the service worker precaches the
// build and controls the page before the offline state is entered.
const installServiceWorker = async ({ page }: { page: Page }) => {
  await page.goto(APP_ROOT_URL);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
};

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

// Verifies FR6, NFR-A2 of add-main-page-scaffold: first visit, before the
// service worker controls the page, so page.route sees the chunk request.
Given(
  "the view cannot be loaded on the first visit",
  async ({ mainPageWorld }) => {
    await mainPageWorld.blockCardsChunk();
  },
);

When("the main page shows the error", async ({ mainPageWorld }) => {
  await mainPageWorld.page.goto(APP_ROOT_URL);
  await expect(mainPageWorld.page.getByRole("alert")).toContainText(ERROR_TEXT);
});

Then("focus has not moved", async ({ mainPageWorld }) => {
  const focusedTagName = await mainPageWorld.page.evaluate(
    () => document.activeElement?.tagName,
  );
  expect(focusedTagName).toBe("BODY");
});

When("the failure cause is gone", async ({ mainPageWorld }) => {
  await mainPageWorld.unblockCardsChunk();
});

When(
  "the user reaches Retry with Tab and presses Enter",
  async ({ mainPageWorld }) => {
    const { page } = mainPageWorld;
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: RETRY_LABEL })).toBeFocused();
    await page.keyboard.press("Enter");
  },
);

Then("the view is shown", async ({ mainPageWorld }) => {
  await expect(mainPageWorld.page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
});

// Verifies FR1, UX3 of add-main-page-scaffold: the header stays put.
Given(
  "the app has been installed and its header position is recorded",
  async ({ mainPageWorld }) => {
    await installServiceWorker(mainPageWorld);
    await expect(mainPageWorld.page.getByText(EMPTY_STATE_TEXT)).toBeVisible();
    mainPageWorld.recordedHeaderBox = await readHeaderBox(mainPageWorld.page);
  },
);

When(
  "the update check fails because the network is unreachable",
  async ({ mainPageWorld }) => {
    await mainPageWorld.failUpdateChecksOnNextLoad();
    await mainPageWorld.page.reload();
    await expect(
      mainPageWorld.page.getByText(UPDATE_CHECK_FAILED_TEXT),
    ).toBeVisible();
  },
);

When("storage becomes unavailable", async ({ mainPageWorld }) => {
  const { page } = mainPageWorld;
  await page.addInitScript(failStorageWrites);
  await page.reload();
  await expect(page.getByText(STORAGE_WARNING_TEXT)).toBeVisible();
});

Then("the header has not moved", async ({ mainPageWorld }) => {
  const currentHeaderBox = await readHeaderBox(mainPageWorld.page);
  expect(currentHeaderBox).toEqual(mainPageWorld.recordedHeaderBox);
});

async function readHeaderBox(page: Page): Promise<BoundingBox> {
  const headerBox = await page.getByRole("heading", { level: 1 }).boundingBox();
  if (!headerBox) throw new Error("The page heading has no bounding box");
  return headerBox;
}
