// Verifies FR3, NFR-A1 of refine-meeting-range-entry-and-handles: the message of a refused pair in a real browser.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const INVALID_FIELD_SELECTOR = "input[aria-invalid='true']";
const FIELD_COUNT = 2;

Then(
  "the meeting range input of {string} shows the message {string}",
  async ({ locationsWorld }, city: string, message: string) => {
    const row = locationsWorld.page
      .getByRole("listitem")
      .filter({ hasText: city })
      .filter({ has: locationsWorld.page.locator(INVALID_FIELD_SELECTOR) });
    await expect(row.getByText(message)).toBeVisible();
    await expect(row.locator(INVALID_FIELD_SELECTOR)).toHaveCount(FIELD_COUNT);
  },
);
