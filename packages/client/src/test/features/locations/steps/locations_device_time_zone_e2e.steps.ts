import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const LIST_ITEM_ROLE = "listitem";
const BADGE_TEXT = englishLocale.locations.deviceTimeZoneBadge;

// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list
Then(
  "the row of {string} is named {string}",
  async ({ locationsWorld }, city: string, accessibleName: string) => {
    expect(accessibleName).toContain(city);
    await expect(
      locationsWorld.page.getByRole(LIST_ITEM_ROLE, {
        name: accessibleName,
        exact: true,
      }),
    ).toBeVisible();
  },
);

Then(
  "the row of {string} shows the device time zone badge",
  async ({ locationsWorld }, city: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(row).toContainText(BADGE_TEXT);
  },
);

Then(
  "the row of {string} shows no device time zone badge",
  async ({ locationsWorld }, city: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(row).toBeVisible();
    await expect(row).not.toContainText(BADGE_TEXT);
  },
);
