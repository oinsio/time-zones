// Verifies NFR-A2 of select-date-with-calendar-and-now.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  calendarOf,
  dateButton,
  dayButton,
  nextDayButton,
  nowButton,
  openCalendarOnDay,
  previousDayButton,
  showNextDay,
} from "./dateSelectionE2eHelpers";

const { Given, When, Then } = createBdd(test);

const SPACE_KEY = "Space";
const TAB_KEY = "Tab";
const TAB_PRESS_COUNT = 3;
const MAX_TABS_TO_REACH = 4;

// Verifies NFR-A2 of select-date-with-calendar-and-now.
Given(
  "the user moved to the next day with the bar",
  async ({ locationsWorld }) => {
    await showNextDay(locationsWorld.page);
  },
);

When(
  "the user moves to the next day with the bar",
  async ({ locationsWorld }) => {
    await showNextDay(locationsWorld.page);
  },
);

When(
  "the user moves the focus to the previous-day button and presses Tab 3 times",
  async ({ locationsWorld }) => {
    await previousDayButton(locationsWorld.page).focus();
    for (let press = 0; press < TAB_PRESS_COUNT; press++) {
      await locationsWorld.page.keyboard.press(TAB_KEY);
      await expect(
        [
          dateButton(locationsWorld.page),
          nextDayButton(locationsWorld.page),
          nowButton(locationsWorld.page),
        ][press],
      ).toBeFocused();
    }
  },
);

Then(
  "the focus visits the date button, the next-day button and Now, in that order",
  async ({ locationsWorld }) => {
    await expect(nowButton(locationsWorld.page)).toBeFocused();
  },
);

When(
  "the user focuses the next-day button and presses Space",
  async ({ locationsWorld }) => {
    await nextDayButton(locationsWorld.page).focus();
    await locationsWorld.page.keyboard.press(SPACE_KEY);
  },
);

When(
  "the user focuses the previous-day button and presses Space",
  async ({ locationsWorld }) => {
    await previousDayButton(locationsWorld.page).focus();
    await locationsWorld.page.keyboard.press(SPACE_KEY);
  },
);

When(
  "the user opens the calendar with Space, presses ArrowRight and presses Space",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await dateButton(page).focus();
    await page.keyboard.press(SPACE_KEY);
    await expect(dayButton(page, "Sunday, March 8, 2026")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press(SPACE_KEY);
  },
);

async function tabTo(
  page: import("@playwright/test").Page,
  target: import("@playwright/test").Locator,
) {
  await previousDayButton(page).focus();
  for (let press = 0; press < MAX_TABS_TO_REACH; press++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press(TAB_KEY);
  }
}

When(
  "the user tabs to the next-day button and presses Enter",
  async ({ locationsWorld }) => {
    await tabTo(locationsWorld.page, nextDayButton(locationsWorld.page));
    await locationsWorld.page.keyboard.press("Enter");
  },
);

When("the user tabs to Now and presses Enter", async ({ locationsWorld }) => {
  await tabTo(locationsWorld.page, nowButton(locationsWorld.page));
  await locationsWorld.page.keyboard.press("Enter");
});

When("the user opens the calendar with Enter", async ({ locationsWorld }) => {
  await dateButton(locationsWorld.page).press("Enter");
});

Given(
  "the calendar is open on the day {string}",
  async ({ locationsWorld }, fullDate: string) => {
    await openCalendarOnDay(locationsWorld.page, fullDate);
  },
);

When(
  "the user presses ArrowDown, ArrowRight and Enter",
  async ({ locationsWorld }) => {
    for (const key of ["ArrowDown", "ArrowRight", "Enter"]) {
      await locationsWorld.page.keyboard.press(key);
    }
  },
);

When("the user presses ArrowRight", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press("ArrowRight");
});

When("the user presses PageDown, then End", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press("PageDown");
  await locationsWorld.page.keyboard.press("End");
});

When(
  "the user presses ArrowRight and then Escape",
  async ({ locationsWorld }) => {
    await locationsWorld.page.keyboard.press("ArrowRight");
    await locationsWorld.page.keyboard.press("Escape");
  },
);

Then(
  "the bar shows the date {string}",
  async ({ locationsWorld }, isoDate: string) => {
    await expect(
      dateButton(locationsWorld.page).locator("time"),
    ).toHaveAttribute("datetime", isoDate);
  },
);

Then("the calendar is closed", async ({ locationsWorld }) => {
  await expect(calendarOf(locationsWorld.page)).toBeHidden();
});

// Verifies FR1 of keep-now-button-visible-when-live.
Then("the bar is live", async ({ locationsWorld }) => {
  await expect(nowButton(locationsWorld.page)).toBeDisabled();
});

Then("the focus is on the date button", async ({ locationsWorld }) => {
  await expect(dateButton(locationsWorld.page)).toBeFocused();
});

Then(
  "the focus is on the day {string}",
  async ({ locationsWorld }, fullDate: string) => {
    await expect(dayButton(locationsWorld.page, fullDate)).toBeFocused();
  },
);

Then(
  "the calendar shows {string}",
  async ({ locationsWorld }, heading: string) => {
    await expect(
      calendarOf(locationsWorld.page).getByRole("heading", { name: heading }),
    ).toBeVisible();
  },
);
