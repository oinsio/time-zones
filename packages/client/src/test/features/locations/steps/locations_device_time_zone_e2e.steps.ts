import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const LIST_ITEM_ROLE = "listitem";
const HERE_MARK_LABEL = englishLocale.locations.hereMarkLabel;
const IMAGE_ROLE = "img";

// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list
// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2 of match-here-mark-to-design
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
  "the row of {string} shows the here mark",
  async ({ locationsWorld }, city: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(
      row.getByRole(IMAGE_ROLE, { name: HERE_MARK_LABEL, exact: true }),
    ).toBeVisible();
  },
);

Then(
  "the row of {string} shows no here mark",
  async ({ locationsWorld }, city: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(row).toBeVisible();
    await expect(
      row.getByRole(IMAGE_ROLE, { name: HERE_MARK_LABEL, exact: true }),
    ).toHaveCount(0);
  },
);

Then(
  "the row of {string} has a mark icon named {string}",
  async ({ locationsWorld }, city: string, accessibleName: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(
      row.getByRole(IMAGE_ROLE, { name: accessibleName, exact: true }),
    ).toBeVisible();
  },
);

Then(
  "the row of {string} shows no visible here caption",
  async ({ locationsWorld }, city: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(row.getByText("here", { exact: true })).toHaveCount(0);
  },
);
