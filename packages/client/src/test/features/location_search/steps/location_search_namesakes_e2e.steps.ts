import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const OPTION_ROLE = "option";

// Verifies NFR-A1, FR7 of add-geonames-city-source (D9): the region is part of the option's text, so of its accessible name.
Then(
  "the first result's accessible name contains {string}",
  async ({ locationsWorld }, regionName: string) => {
    await expect(
      locationsWorld.page.getByRole(OPTION_ROLE).first(),
    ).toContainText(regionName);
    const accessibleName = await locationsWorld.page
      .getByRole(OPTION_ROLE, { name: new RegExp(regionName) })
      .first()
      .textContent();
    expect(accessibleName).toContain(regionName);
  },
);
