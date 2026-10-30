import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { sliderOf } from "./timeSelectionE2eHelpers";
import { typeWallTime } from "./wallTimeE2eHelpers";

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

// Verifies FR12 of add-wall-time-input-with-hint: a typed time in any view.
When(
  "the user types {string} in the wall-time input of {string}",
  async ({ locationsWorld }, text: string, city: string) => {
    await typeWallTime(locationsWorld.page, city, text);
  },
);
