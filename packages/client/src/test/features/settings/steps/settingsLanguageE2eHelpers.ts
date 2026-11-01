import type { Page } from "@playwright/test";
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
export const requireBox = async (locator: ReturnType<Page["locator"]>) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
};
