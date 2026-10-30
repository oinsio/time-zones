import { expect, type Locator, type Page } from "@playwright/test";
import type { StoredLocation } from "../../locations/steps/locations_ui_e2e.fixtures";
import { englishLocale } from "../../main_page/steps/englishTexts";

const DATE_TEXTS = englishLocale.date;

export const PREVIOUS_DAY_NAME = DATE_TEXTS.previousDay;
export const NEXT_DAY_NAME = DATE_TEXTS.nextDay;
export const NOW_NAME = DATE_TEXTS.now;
export const BAR_NAME = DATE_TEXTS.barLabel;
export const DATE_BUTTON_SELECTOR = 'button[aria-haspopup="dialog"]';
export const DIALOG_ROLE = "dialog";
export const POLITE_LIVE_REGION_SELECTOR = '[aria-live="polite"]';
export const MIN_TOUCH_TARGET_PX = 44;
export const GRID_CELL_ROLE = "gridcell";

export enum DateBarState {
  LIVE = "live",
  PINNED = "pinned",
  CALENDAR_OPEN = "calendar open",
}

export type Box = { x: number; y: number; width: number; height: number };

export const barOf = (page: Page) =>
  page.getByRole("group", { name: BAR_NAME });
export const previousDayButton = (page: Page) =>
  barOf(page).getByRole("button", { name: PREVIOUS_DAY_NAME });
export const nextDayButton = (page: Page) =>
  barOf(page).getByRole("button", { name: NEXT_DAY_NAME });
export const nowButton = (page: Page) =>
  barOf(page).getByRole("button", { name: NOW_NAME });
export const dateButton = (page: Page) =>
  barOf(page).locator(DATE_BUTTON_SELECTOR);
export const calendarOf = (page: Page) => page.getByRole(DIALOG_ROLE);
export const dayButton = (page: Page, fullDate: string) =>
  calendarOf(page).getByRole("button", { name: fullDate });

export async function requireBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box");
  return box;
}

export async function showNextDay(page: Page) {
  await nextDayButton(page).click();
  await expect(nowButton(page)).toBeEnabled();
}

export async function computedColourOfVariable(page: Page, variableName: string) {
  return page.evaluate((cssVariable) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${cssVariable})`;
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, variableName);
}

export async function openCalendarWithMouse(page: Page) {
  await dateButton(page).click();
  await expect(calendarOf(page)).toBeVisible();
}

/** Opens the calendar and moves the focus to a day with arrow keys from 8 March. */
export async function openCalendarOnDay(page: Page, fullDate: string) {
  await dateButton(page).press("Enter");
  await expect(dayButton(page, "Sunday, March 8, 2026")).toBeFocused();
  const keysToDay: Record<string, string[]> = {
    "Sunday, March 8, 2026": [],
    "Tuesday, March 31, 2026": [
      ...Array(3).fill("ArrowDown"),
      ...Array(2).fill("ArrowRight"),
    ],
  };
  for (const key of keysToDay[fullDate] ?? []) await page.keyboard.press(key);
  await expect(dayButton(page, fullDate)).toBeFocused();
}

export async function putBarInState(page: Page, state: DateBarState) {
  await expect(barOf(page)).toBeVisible();
  if (state !== DateBarState.LIVE) await showNextDay(page);
  if (state === DateBarState.CALENDAR_OPEN) await openCalendarWithMouse(page);
}

const LAYOUT_CITIES = [
  ["Asia/Almaty", "Almaty", "KZ"],
  ["Europe/Moscow", "Moscow", "RU"],
  ["Asia/Kolkata", "Kolkata", "IN"],
  ["Asia/Kathmandu", "Kathmandu", "NP"],
  ["Asia/Tokyo", "Tokyo", "JP"],
  ["America/New_York", "New York", "US"],
  ["Europe/London", "London", "GB"],
  ["Europe/Paris", "Paris", "FR"],
  ["Africa/Cairo", "Cairo", "EG"],
  ["Australia/Sydney", "Sydney", "AU"],
  ["America/Los_Angeles", "Los Angeles", "US"],
  ["America/Sao_Paulo", "Sao Paulo", "BR"],
] as const;

export const buildManyLocations = (): StoredLocation[] =>
  LAYOUT_CITIES.map(([timeZoneId, label, countryCode]) => ({
    timeZoneId,
    label,
    countryCode,
  }));
