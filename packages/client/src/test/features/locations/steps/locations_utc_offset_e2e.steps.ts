import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const LIST_ITEM_ROLE = "listitem";

// Verifies NFR-A1, NFR-R1, NFR-R2 of show-utc-offset-on-location-rows.
Then(
  "the row of {string} shows the offset {string}",
  async ({ locationsWorld }, city: string, offset: string) => {
    const row = locationsWorld.page
      .getByRole(LIST_ITEM_ROLE)
      .filter({ hasText: city });
    await expect(row).toContainText(offset);
  },
);
