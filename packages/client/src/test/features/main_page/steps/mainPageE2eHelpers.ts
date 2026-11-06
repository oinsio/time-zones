import type { Page } from "@playwright/test";
import { englishLocale } from "./englishTexts";
import type { BoundingBox } from "./main_page_e2e.fixtures";

export const APP_ROOT_URL = ".";

export const EMPTY_STATE_TEXT = englishLocale.views.cardsEmptyState;
export const ERROR_TEXT = englishLocale.mainPage.viewError;
export const RETRY_LABEL = englishLocale.mainPage.retry;
export const STORAGE_WARNING_TEXT = englishLocale.mainPage.storageUnavailable;

/** The polite notices region of the page (the footer's status region). */
export const NOTICES_REGION_SELECTOR =
  'footer [role="status"][aria-live="polite"]';

export const failStorageWrites = () => {
  Storage.prototype.setItem = () => {
    throw new DOMException("quota", "QuotaExceededError");
  };
};

// Verifies NFR-A1 of add-main-page-scaffold: the service worker precaches the
// build and controls the page before the offline state is entered.
export const installServiceWorker = async ({ page }: { page: Page }) => {
  await page.goto(APP_ROOT_URL);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
};

export async function readHeaderBox(page: Page): Promise<BoundingBox> {
  const headerBox = await page.getByRole("heading", { level: 1 }).boundingBox();
  if (!headerBox) throw new Error("The page heading has no bounding box");
  return headerBox;
}
