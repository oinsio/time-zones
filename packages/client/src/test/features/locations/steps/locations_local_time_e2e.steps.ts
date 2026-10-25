// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2, NFR-R3 of show-local-time-and-date-on-location-cards.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

const { Given, Then } = createBdd(test);

const LIST_ITEM_ROLE = "listitem";
const HALF = 2;
const ALIGNMENT_TOLERANCE_PX = 1;
const PLACE_COLUMN_XPATH =
  "xpath=ancestor::span[contains(@class,'flex-col')][1]";
const TIME_TEXT_XPATH = "xpath=preceding-sibling::span";
const LIVE_REGION_XPATH = "xpath=ancestor-or-self::*[@aria-live]";
const DATE_ELEMENT = "time";
const REMOVE_BUTTON = "button";

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
    place: await requireBox(cityElement.locator(PLACE_COLUMN_XPATH)),
    time: await requireBox(dateElement.locator(TIME_TEXT_XPATH)),
    date: await requireBox(dateElement),
    card: await requireBox(row),
    removeButton: await requireBox(row.locator(REMOVE_BUTTON).last()),
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

// Verifies NFR-R2, UX1, UX2 of show-local-time-and-date-on-location-cards.
Then(
  "the time of {string} is at the right end of its city line with the date right-aligned under it",
  async ({ locationsWorld }, city: string) => {
    const box = await parts(rowOf(locationsWorld.page, city), city);
    expect(box.time.x).toBeGreaterThanOrEqual(box.city.x + box.city.width);
    expect(box.time.y).toBeLessThan(box.city.y + box.city.height);
    expect(box.time.y + box.time.height).toBeGreaterThan(box.city.y);
    expect(box.time.x + box.time.width).toBeLessThanOrEqual(
      box.removeButton.x + ALIGNMENT_TOLERANCE_PX,
    );
    expect(box.date.y).toBeGreaterThanOrEqual(box.time.y + box.time.height);
    expect(
      Math.abs(box.date.x + box.date.width - (box.time.x + box.time.width)),
    ).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
  },
);

// Verifies NFR-R2, UX1, UX2 of show-local-time-and-date-on-location-cards.
Then(
  "the time of {string} follows its place column in the left half of the card with the date left-aligned under it",
  async ({ locationsWorld }, city: string) => {
    const box = await parts(rowOf(locationsWorld.page, city), city);
    expect(box.time.x).toBeGreaterThanOrEqual(box.place.x + box.place.width);
    expect(box.time.x).toBeLessThan(box.card.x + box.card.width / HALF);
    expect(box.date.y).toBeGreaterThanOrEqual(box.time.y + box.time.height);
    expect(Math.abs(box.date.x - box.time.x)).toBeLessThanOrEqual(
      ALIGNMENT_TOLERANCE_PX,
    );
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
