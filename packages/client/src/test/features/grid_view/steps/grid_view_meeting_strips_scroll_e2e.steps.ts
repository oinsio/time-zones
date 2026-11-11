// Verifies FR8 of refine-meeting-range-entry-and-handles: the strips scrolled back, the hour frame stays visible.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { frameOf, panelOf, requireBox } from "./hourGridE2eHelpers";

const { When, Then } = createBdd(test);

const EDGE_TOLERANCE_PX = 3;

When(
  "the user scrolls the strips back to the start",
  async ({ locationsWorld }) => {
    await panelOf(locationsWorld.page).evaluate((panel) => {
      panel.scrollLeft = 0;
    });
  },
);

Then(
  "the hour frame lies inside the strips' visible part",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    await expect
      .poll(async () => {
        const frameBox = await requireBox(frameOf(page));
        return (
          frameBox.x >= panelBox.x - EDGE_TOLERANCE_PX &&
          frameBox.x + frameBox.width <=
            panelBox.x + panelBox.width + EDGE_TOLERANCE_PX
        );
      })
      .toBe(true);
  },
);
