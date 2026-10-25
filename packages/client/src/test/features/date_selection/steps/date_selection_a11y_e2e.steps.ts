import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  barOf,
  DATE_BUTTON_SELECTOR,
  type DateBarState,
  dayButton,
  GRID_CELL_ROLE,
  openCalendarWithMouse,
  POLITE_LIVE_REGION_SELECTOR,
  putBarInState,
} from "./dateSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const CHOOSE_DATE_PATTERN = /^Choose date/;

// Verifies NFR-A3 of select-date-with-calendar-and-now.
When(
  "the user opens the calendar with the mouse",
  async ({ locationsWorld }) => {
    await openCalendarWithMouse(locationsWorld.page);
  },
);

Then(
  "the date button was named {string}",
  async ({ locationsWorld }, name: string) => {
    await expect(
      locationsWorld.page.locator(DATE_BUTTON_SELECTOR),
    ).toHaveAttribute("aria-label", name);
    expect(name).toMatch(CHOOSE_DATE_PATTERN);
  },
);

Then(
  "the day {string} is marked as today",
  async ({ locationsWorld }, fullDate: string) => {
    await expect(dayButton(locationsWorld.page, fullDate)).toHaveAttribute(
      "aria-current",
      "date",
    );
  },
);

Then(
  "the grid cell holding the day {string} is marked as selected",
  async ({ locationsWorld }, fullDate: string) => {
    const { page } = locationsWorld;
    const selectedCell = page
      .getByRole(GRID_CELL_ROLE)
      .filter({ has: page.getByRole("button", { name: fullDate }) });
    await expect(selectedCell).toHaveAttribute("aria-selected", "true");
  },
);

Then(
  "{string} is announced politely once",
  async ({ locationsWorld }, announcement: string) => {
    const announcements = barOf(locationsWorld.page)
      .locator(POLITE_LIVE_REGION_SELECTOR)
      .filter({ hasText: announcement });
    await expect(announcements).toHaveCount(1);
    await expect(announcements).toHaveText(announcement);
  },
);

// Verifies NFR-A1 of select-date-with-calendar-and-now.
When(
  /^the date bar is put in the (live|pinned|calendar open) state$/,
  async ({ locationsWorld }, state: string) => {
    await putBarInState(locationsWorld.page, state as DateBarState);
  },
);

// Verifies FR7 of select-date-with-calendar-and-now.
Then(
  /^the visible date text is the (short|long) one reading "(.+)"$/,
  async ({ locationsWorld }, label: string, text: string) => {
    const visibleLabel = barOf(locationsWorld.page).locator(
      `[data-date-label="${label}"]`,
    );
    await expect(visibleLabel).toBeVisible();
    await expect(visibleLabel).toHaveText(text);
  },
);
