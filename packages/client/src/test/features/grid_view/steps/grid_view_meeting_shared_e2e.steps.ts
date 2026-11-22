import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  menuButtonOf,
  rowsOf,
} from "../../locations/steps/locationsMenuButtonHelpers";

const { Then } = createBdd(test);

// Verifies UX3 of keep-location-menu-in-view-and-clear-range-after-share: the Grid view is back to normal.
Then("every location menu button is enabled", async ({ locationsWorld }) => {
  const rows = await rowsOf(locationsWorld.page);
  expect(rows.length).toBeGreaterThan(0);
  for (const row of rows) await expect(menuButtonOf(row)).toBeEnabled();
});
