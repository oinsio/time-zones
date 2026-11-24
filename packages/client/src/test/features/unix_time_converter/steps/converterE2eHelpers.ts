// Implements NFR-A2, NFR-R1 of add-unix-time-converter-tool: the locators the converter E2E steps share.
import { expect, type Page } from "@playwright/test";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  openSettings,
  settingsHeading,
} from "../../settings/steps/settingsE2eHelpers";

export const TOOL_NAME = /^(Unix time converter|Конвертер Unix-времени)$/;
export const INPUT_NAME =
  /^(Unix time or ISO 8601 date|Unix-время или дата ISO 8601)$/;
export const NOTATIONS_NAME = /^(Notations|Форматы)$/;
export const NOW_BUTTON_NAME = /^(Now|Сейчас)$/;
export const SHOW_ON_MAIN_PAGE_NAME =
  /^(Show on main page|Показать на главной)$/;
export const SECONDS_NOTATION_NAME = /^(Seconds|Секунды)$/;
export const COPY_SECONDS_NAME = /^(Copy: Seconds|Копировать: Секунды)$/;
export const COPIED_TEXT = /^(Copied|Скопировано)$/;
export const MOSCOW_TIME_NAME = /^(Время|Time) — Moscow,/;
export const MOSCOW_CITY = "Moscow";
export const TOOL_ID = "unixTimeConverter";

export const toolButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: TOOL_NAME });
export const converterInput = (page: Page) =>
  page.getByRole("textbox", { name: INPUT_NAME });
export const toolHeading = (page: Page) =>
  page.getByRole("heading", { name: TOOL_NAME });
export const nowButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: NOW_BUTTON_NAME });
export const moscowTime = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: MOSCOW_TIME_NAME });
export const notationsOf = (page: Page) =>
  page.getByRole("region", { name: NOTATIONS_NAME });

/** Turns the tool on in the settings and returns to the main page, as a user does. */
export const enableToolInSettings = async (page: Page) => {
  await openSettings(page);
  await toolButton(page).click();
  await page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME }).click();
  await expect(settingsHeading(page)).toBeHidden();
};

/** Replaces the whole text of the converter input, as a paste of a text does. */
export const pasteIntoConverterInput = async (page: Page, text: string) => {
  await converterInput(page).evaluate((field: HTMLInputElement, pasted) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text", pasted);
    field.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, text);
};
