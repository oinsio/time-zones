import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { sliderOf } from "./timeSelectionE2eHelpers";

const { When } = createBdd(test);

// Verifies FR3, FR5 of add-time-sliders-to-location-cards: a key move through the slider of one card.
When(
  "the user moves the time of {string} one hour forward",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await sliderOf(page, city).focus();
    await page.keyboard.press("PageUp");
  },
);
