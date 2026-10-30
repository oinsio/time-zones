// Verifies FR2, FR3, FR6 of select-date-with-calendar-and-now.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  barOf,
  dayButton,
  nowButton,
  openCalendarWithMouse,
} from "./dateSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const MAX_MONTHS_TO_BROWSE = 12;
const DATE_ELEMENT = "time";

// Verifies FR3 of keep-now-button-visible-when-live.
When("the user returns to now with the bar", async ({ locationsWorld }) => {
  await nowButton(locationsWorld.page).click();
  await expect(nowButton(locationsWorld.page)).toBeDisabled();
});

When(
  "the user picks {string} in the calendar",
  async ({ locationsWorld }, fullDate: string) => {
    const { page } = locationsWorld;
    await openCalendarWithMouse(page);
    const nextMonthButton = page.getByRole("button", {
      name: englishLocale.date.nextMonth,
    });
    for (let month = 0; month < MAX_MONTHS_TO_BROWSE; month++) {
      if (await dayButton(page, fullDate).isVisible()) break;
      await nextMonthButton.click();
    }
    await dayButton(page, fullDate).click();
    await expect(barOf(page)).toBeVisible();
  },
);

Then(
  "the row of {string} carries the ISO date {string}",
  async ({ locationsWorld }, city: string, isoDate: string) => {
    await expect(
      listRow(locationsWorld.page, city).locator(DATE_ELEMENT),
    ).toHaveAttribute("datetime", isoDate);
  },
);
