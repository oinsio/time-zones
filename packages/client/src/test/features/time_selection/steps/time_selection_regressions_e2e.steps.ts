// Verifies FR22 of redesign-cards-grid-and-day-palettes: no two hour labels of a track touch.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { requireBox } from "./timeSelectionE2eHelpers";

const { Then } = createBdd(test);

const HOUR_LABEL_SELECTOR = "[data-hour-label]";
const MIN_LABEL_GAP_PX = 1;

Then(
  "no two neighbouring hour labels of a track touch",
  async ({ locationsWorld }) => {
    const rows = await locationsWorld.page.getByRole("listitem").all();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const labels = await row.locator(HOUR_LABEL_SELECTOR).all();
      expect(labels.length).toBeGreaterThan(1);
      for (let index = 1; index < labels.length; index += 1) {
        const previous = await requireBox(labels[index - 1]);
        const current = await requireBox(labels[index]);
        expect(
          current.x - (previous.x + previous.width),
        ).toBeGreaterThanOrEqual(MIN_LABEL_GAP_PX);
      }
    }
  },
);
