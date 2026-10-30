// Implements FR8, FR9, NFR-A2, NFR-R1, UX3 of add-settings-page-and-device-time-location: locators and layout measures of the device time location.
import type { Locator, Page } from "@playwright/test";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { listRow } from "./locationsE2eHelpers";

export const DEVICE_TIME_NAME_PATTERN = /(Device time|Время устройства)$/;
const TIME_ELEMENT = "time";
const TIME_TEXT_XPATH = "xpath=preceding-sibling::button";
const SLIDER_ROLE = "slider";
const LIST_ITEM_ROLE = "listitem";

/** The device time location's row: the list item whose name ends with "Device time". */
export const deviceTimeRowOf = (page: Page) =>
  page.getByRole(LIST_ITEM_ROLE, { name: DEVICE_TIME_NAME_PATTERN });

export const deviceTimeTimeOf = (page: Page) =>
  deviceTimeRowOf(page).locator(TIME_ELEMENT).locator(TIME_TEXT_XPATH);

export const deviceTimeSliderOf = (page: Page) =>
  deviceTimeRowOf(page).getByRole(SLIDER_ROLE);

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

export const measureDeviceTime = (page: Page) =>
  measureCard(deviceTimeRowOf(page));
export const measureLocationCard = (page: Page, city: string) =>
  measureCard(listRow(page, city));
