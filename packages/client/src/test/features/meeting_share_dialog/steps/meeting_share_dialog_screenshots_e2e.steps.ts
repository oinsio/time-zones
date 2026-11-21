// Verifies UX1, UX2, UX3, UX4, UX5, NFR-R1 of add-meeting-share-dialog: approved screenshots of the share dialog.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  checkboxesOf,
  languageButtonOf,
  pinOf,
  shareDialogOf,
} from "../../grid_view/steps/meetingShareE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { When, Then } = createBdd(test);

const SCREENSHOT_NAME_SEPARATOR = "-";
const KOLKATA = /^(Калькутта|Kolkata)$/;
const ENGLISH_NAME = /English/;

When(
  "the share dialog is in the state {string}",
  async ({ locationsWorld }, state: string) => {
    const { page } = locationsWorld;
    if (state === "no location ticked") {
      const boxes = checkboxesOf(page);
      for (let index = 0; index < (await boxes.count()); index += 1) {
        await boxes.nth(index).uncheck();
      }
    }
    if (state === "Kolkata unticked, English pinned") {
      await shareDialogOf(page)
        .getByRole("checkbox", { name: KOLKATA })
        .uncheck();
      await languageButtonOf(page).click();
      await shareDialogOf(page)
        .getByRole("button", { name: ENGLISH_NAME })
        .click();
      await pinOf(page).click();
      await expect(pinOf(page)).toHaveAttribute("aria-pressed", "true");
    }
  },
);

Then(
  "the share dialog matches the approved screenshot",
  async ({ locationsWorld, $test }) => {
    const screenshotName = $test
      .info()
      .title.replace(/[^A-Za-z0-9]+/g, SCREENSHOT_NAME_SEPARATOR);
    await expect(shareDialogOf(locationsWorld.page)).toHaveScreenshot(
      `${screenshotName}.png`,
    );
  },
);

Then(
  "no row of the share dialog has a remove control",
  async ({ locationsWorld }) => {
    const rows = shareDialogOf(locationsWorld.page).getByRole("listitem");
    for (let index = 0; index < (await rows.count()); index += 1) {
      await expect(rows.nth(index).getByRole("button")).toHaveCount(0);
    }
  },
);
