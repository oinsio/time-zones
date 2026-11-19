// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2, NFR-R3 of show-local-time-and-date-on-location-cards.
// The time text is the wall-time button since add-wall-time-input-with-hint.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

const { Given, Then } = createBdd(test);

const LIST_ITEM_ROLE = "listitem";
const HALF = 2;
const TIME_TEXT_XPATH =
  'xpath=ancestor::li[1]//span[button[@aria-haspopup="menu"]]/preceding-sibling::button';
const LIVE_REGION_XPATH = "xpath=ancestor-or-self::*[@aria-live]";
const DATE_ELEMENT = "time";
const MENU_BUTTON = "button";

type Box = { x: number; y: number; width: number; height: number };

const requireBox = async (locator: Locator): Promise<Box> => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box");
  return box;
};

const parts = async (row: Locator, city: string) => {
  const cityElement = row.getByText(city, { exact: true }).first();
  const dateElement = row.locator(DATE_ELEMENT);
  return {
    city: await requireBox(cityElement),
    time: await requireBox(dateElement.locator(TIME_TEXT_XPATH)),
    date: await requireBox(dateElement),
    card: await requireBox(row),
    menuButton: await requireBox(row.locator(MENU_BUTTON).last()),
  };
};

const rowOf = (page: Page, city: string) =>
  page.getByRole(LIST_ITEM_ROLE).filter({ hasText: city });

// Verifies NFR-R3 of show-local-time-and-date-on-location-cards.
Given(
  "the current time is {string}",
  async ({ locationsWorld }, timestamp: string) => {
    await locationsWorld.page.clock.setFixedTime(timestamp);
  },
);

// Verifies FR1, FR2 of show-local-time-and-date-on-location-cards.
Then(
  "the time of {string} reads {string} with the ISO date {string}",
  async ({ locationsWorld }, city: string, time: string, isoDate: string) => {
    const dateElement = rowOf(locationsWorld.page, city).locator(DATE_ELEMENT);
    await expect(dateElement.locator(TIME_TEXT_XPATH)).toHaveText(time);
    await expect(dateElement).toHaveAttribute("datetime", isoDate);
  },
);

// Verifies FR7, FR8, NFR-R1 of redesign-cards-grid-and-day-palettes: the narrow card.
Then(
  "the time of {string} is on the first line at the right with the menu after it and the date right-aligned on the second line",
  async ({ locationsWorld }, city: string) => {
    const box = await parts(rowOf(locationsWorld.page, city), city);
    expect(box.time.y).toBeLessThan(box.city.y + box.city.height);
    expect(box.time.x).toBeGreaterThanOrEqual(box.city.x + box.city.width);
    expect(box.menuButton.x).toBeGreaterThanOrEqual(
      box.time.x + box.time.width,
    );
    expect(box.date.y).toBeGreaterThanOrEqual(box.time.y + box.time.height - 1);
    expect(
      box.card.x + box.card.width - (box.date.x + box.date.width),
    ).toBeLessThanOrEqual(box.card.width / HALF);
  },
);

// Verifies FR7, FR8, NFR-R1 of redesign-cards-grid-and-day-palettes: the wide card.
Then(
  "the date, the time and the menu of {string} stand on one line at the right of the card",
  async ({ locationsWorld }, city: string) => {
    const box = await parts(rowOf(locationsWorld.page, city), city);
    expect(box.date.x + box.date.width).toBeLessThanOrEqual(box.time.x + 1);
    expect(box.time.x + box.time.width).toBeLessThanOrEqual(
      box.menuButton.x + 1,
    );
    expect(Math.abs(box.date.y - box.time.y)).toBeLessThan(box.time.height);
    expect(box.time.x).toBeGreaterThan(box.card.x + box.card.width / HALF);
  },
);

// Verifies NFR-A2 of show-local-time-and-date-on-location-cards.
Then(
  "the time of {string} is not inside a live region",
  async ({ locationsWorld }, city: string) => {
    const dateElement = rowOf(locationsWorld.page, city).locator(DATE_ELEMENT);
    await expect(dateElement.locator(TIME_TEXT_XPATH)).toBeVisible();
    await expect(
      dateElement.locator(TIME_TEXT_XPATH).locator(LIVE_REGION_XPATH),
    ).toHaveCount(0);
  },
);
