import { expect, type Page } from "@playwright/test";
import { STORAGE_KEYS } from "@/constants";
import { englishLocale } from "../../main_page/steps/englishTexts";

export const BUTTON_ROLE = "button";
export const HEADING_ROLE = "heading";
export const RADIO_ROLE = "radio";
export const RADIOGROUP_ROLE = "radiogroup";
export const BLANK_PAGE_URL = "about:blank";
export const APP_ROOT_URL = ".";
/** The settings button is named «Настройки» in Russian, so scenarios in both languages find it. */
export const SETTINGS_BUTTON_NAME = new RegExp(
  `^(${englishLocale.settings.open}|Настройки)$`,
);
export const BACK_BUTTON_NAME = englishLocale.settings.back;
export const MIN_OPTION_HEIGHT_PX = 44;
export const UNREADABLE_PREFERENCES_TEXT = "{not json";
export const THEME_VALUES: Record<string, string> = {
  Dark: "DARK",
  Light: "LIGHT",
  System: "SYSTEM",
};
export const HOUR_FORMAT_VALUES: Record<string, string> = {
  "12-hour": "H12",
  "24-hour": "H24",
};
export const THEME_RECORDER_KEY = "recordedThemeAtHeader";

export const settingsButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME });
export const settingsHeading = (page: Page) =>
  page.getByRole(HEADING_ROLE, { name: SETTINGS_BUTTON_NAME });
export const optionOf = (page: Page, name: string) =>
  page.getByRole(RADIO_ROLE, { name, exact: true });
export const dateBarOf = (page: Page) =>
  page.getByRole("group", { name: englishLocale.date.barLabel });

export async function openSettings(page: Page) {
  if (page.url() === BLANK_PAGE_URL) await page.goto(APP_ROOT_URL);
  await settingsButton(page).click();
  await expect(settingsHeading(page)).toBeVisible();
}

export const seedPreferences = async (page: Page, documentText: string) =>
  page.addInitScript(
    ({ key, text }) => {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, text);
      }
    },
    { key: STORAGE_KEYS.PREFERENCES, text: documentText },
  );
