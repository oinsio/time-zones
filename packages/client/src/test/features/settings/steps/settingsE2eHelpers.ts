import { expect, type Page } from "@playwright/test";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
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

export const ZONE_LABEL_GROUP_ROLE = "group";
export const ZONE_LABEL_PART_VALUES: Record<string, string[]> = {
  "the UTC offset and the zone abbreviation": [
    "UTC_OFFSET",
    "ZONE_ABBREVIATION",
  ],
  "only the UTC offset": ["UTC_OFFSET"],
  "the zone abbreviation only": ["ZONE_ABBREVIATION"],
  nothing: [],
};
export const MIN_TOGGLE_SIZE_PX = 44;
export const ZONE_LABEL_TAB_LIMIT = 30;
const SEEDED_THEME = "SYSTEM";
const SEEDED_HOUR_FORMAT = "H24";

/** Stores a preferences document whose zone label shows the given parts. */
export const seedZoneLabelParts = (
  page: Page,
  partsName: string,
  interfaceLanguage: string | null,
) =>
  seedPreferences(
    page,
    JSON.stringify({
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      payload: {
        theme: SEEDED_THEME,
        hourFormat: SEEDED_HOUR_FORMAT,
        interfaceLanguage,
        zoneLabelParts: ZONE_LABEL_PART_VALUES[partsName],
      },
    }),
  );

/** The zone label group in either language, unless a scenario names it. */
export const ANY_LANGUAGE_ZONE_LABEL_GROUP_NAME =
  /^(Zone label|Подпись пояса)$/;
export const zoneLabelGroupOf = (
  page: Page,
  name: string | RegExp = ANY_LANGUAGE_ZONE_LABEL_GROUP_NAME,
) => page.getByRole(ZONE_LABEL_GROUP_ROLE, { name });
export const zoneLabelToggleOf = (page: Page, name: string) =>
  zoneLabelGroupOf(page).getByRole(BUTTON_ROLE, { name, exact: true });
