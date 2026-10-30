// Implements FR4, FR5, NFR-A2, NFR-R1, UX3 of show-here-entry-for-device-time: locators and layout measures of the Here entry.
import type { Locator, Page } from "@playwright/test";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { listRow } from "./locationsE2eHelpers";

const HERE_ENTRY_NAME_PATTERN = /(Device time|Время устройства)$/;
const TIME_ELEMENT = "time";
const TIME_TEXT_XPATH = "xpath=preceding-sibling::button";
const SLIDER_ROLE = "slider";

export const hereEntryOf = (page: Page) =>
  page.getByRole("region", { name: HERE_ENTRY_NAME_PATTERN });

export const hereEntryTimeOf = (page: Page) =>
  hereEntryOf(page).locator(TIME_ELEMENT).locator(TIME_TEXT_XPATH);

export const hereEntrySliderOf = (page: Page) =>
  hereEntryOf(page).getByRole(SLIDER_ROLE);

/** Card, time and track of a card, relative to the card, for layout comparison. */
async function measureCard(card: Locator) {
  const cardBox = await requireBox(card);
  const relative = async (part: Locator) => {
    const box = await requireBox(part);
    return {
      x: Math.round(box.x - cardBox.x),
      width: Math.round(box.width),
      right: Math.round(box.x + box.width - cardBox.x),
    };
  };
  return {
    card: { x: Math.round(cardBox.x), width: Math.round(cardBox.width) },
    time: await relative(card.locator(TIME_ELEMENT)),
    track: await relative(card.getByRole(SLIDER_ROLE)),
  };
}

export const measureHereEntry = (page: Page) => measureCard(hereEntryOf(page));
export const measureLocationCard = (page: Page, city: string) =>
  measureCard(listRow(page, city));
