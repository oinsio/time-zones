import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { setSampleMeeting } from "../../grid_view/steps/meetingE2eHelpers";
import {
  checkboxesOf,
  dialogCloseButtonOf,
  dialogShareButtonOf,
  languageButtonOf,
  MAX_TAB_STOPS,
  shareDialogOf,
  shareMeetingButtonOf,
} from "../../grid_view/steps/meetingShareE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { buildStoredLocations } from "../../locations/steps/locationsE2eHelpers";

const { Given, When } = createBdd(test);

/** Twenty cities of the scenario table, each with its own id. */
const SCENARIO_CITIES = [
  "Almaty",
  "Moscow",
  "Kolkata",
  "New York",
  "Kathmandu",
  "Tokyo",
  "UTC",
  "Belgrade",
  "Lord Howe Island",
  "Chicago",
  "London",
  "Adelaide",
  "St. Vincent",
  "Алматы",
  "Москва",
  "Калькутта",
  "Катманду",
  "Токио",
  "Белград",
  "Лорд-Хау",
];
const APP_ROOT_URL = ".";
const SCROLL_AREA_SELECTOR = "div.overflow-y-auto";

const openDialog = async (page: Page) => {
  await shareMeetingButtonOf(page).click();
  await expect(shareDialogOf(page)).toBeVisible();
};

Given(
  "the user opened the locations app with the sample meeting",
  async ({ locationsWorld }) => {
    await locationsWorld.page.goto(APP_ROOT_URL);
    await setSampleMeeting(locationsWorld.page);
  },
);

Given(
  "the user opened the locations app with the sample meeting and the share dialog",
  async ({ locationsWorld }) => {
    await locationsWorld.page.goto(APP_ROOT_URL);
    await setSampleMeeting(locationsWorld.page);
    await openDialog(locationsWorld.page);
  },
);

Given(
  "the stored list holds {int} locations",
  async ({ locationsWorld }, count: number) => {
    await locationsWorld.seedList(
      buildStoredLocations(SCENARIO_CITIES.slice(0, count)),
    );
  },
);

Given("the list of share languages is open", async ({ locationsWorld }) => {
  const button = languageButtonOf(locationsWorld.page);
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
});

When(
  "the user opens the share dialog with the keyboard",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await shareMeetingButtonOf(page).focus();
    await page.keyboard.press("Enter");
    await expect(shareDialogOf(page)).toBeVisible();
  },
);

When(
  /^the user closes the share dialog with (the close button|Esc)$/,
  async ({ locationsWorld }, way: string) => {
    const { page } = locationsWorld;
    if (way === "Esc") await page.keyboard.press("Escape");
    else await dialogCloseButtonOf(page).click();
  },
);

When(
  "the user unticks every location in the share dialog",
  async ({ locationsWorld }) => {
    const boxes = checkboxesOf(locationsWorld.page);
    for (let index = 0; index < (await boxes.count()); index += 1) {
      await boxes.nth(index).uncheck();
    }
  },
);

When(
  "the user unticks {string} with Space",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await shareDialogOf(page).getByRole("checkbox", { name: city }).focus();
    await page.keyboard.press("Space");
  },
);

When(
  "the user moves to Share with Tab and presses Enter",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (let stop = 0; stop < MAX_TAB_STOPS; stop += 1) {
      if (
        await dialogShareButtonOf(page).evaluate(
          (el) => el === document.activeElement,
        )
      )
        break;
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");
  },
);

When(
  "the content of the share dialog is scrolled to the {word}",
  async ({ locationsWorld }, end: string) => {
    await shareDialogOf(locationsWorld.page)
      .locator(SCROLL_AREA_SELECTOR)
      .evaluate((area, isEnd) => {
        area.scrollTop = isEnd ? area.scrollHeight : 0;
      }, end === "end");
  },
);
