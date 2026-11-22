import { expect, type Page } from "@playwright/test";
import { BUTTON_ROLE } from "./settingsE2eHelpers";

export const GROUP_ROLE = "group";
export const LIST_ROLE = "list";
export const LANGUAGE_GROUP_NAME = /^(Language|Язык)$/;
export const LANGUAGE_BUTTON_NAME = /^(Language|Язык): /;
export const THEME_GROUP_NAME = /^(Theme|Тема)$/;

export const languageGroup = (page: Page) =>
  page.getByRole(GROUP_ROLE, { name: LANGUAGE_GROUP_NAME });
export const languageButton = (page: Page) =>
  languageGroup(page).getByRole(BUTTON_ROLE, { name: LANGUAGE_BUTTON_NAME });
export const languageList = (page: Page) => page.getByRole(LIST_ROLE);
/** The notice a first visit shows once the service worker is installed, in both languages. */
const OFFLINE_READY_NOTICE_TEXT =
  /^(The app is ready to work offline\.|Приложение готово к работе без сети\.)$/;
export const offlineReadyNotice = (page: Page) =>
  page.getByText(OFFLINE_READY_NOTICE_TEXT);
export const requireBox = async (locator: ReturnType<Page["locator"]>) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
};

/**
 * Waits until the first visit's service worker is installed and its offline-ready
 * notice is shown, so a screenshot never depends on whether the install won the race.
 */
export async function waitForOfflineReadyNotice(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect(offlineReadyNotice(page)).toBeVisible();
}
