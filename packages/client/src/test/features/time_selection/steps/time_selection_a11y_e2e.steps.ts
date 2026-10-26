import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  readTokenStyle,
  sliderOf,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const ACCENT_TOKEN = "--color-accent";
const NO_OUTLINE_STYLE = "none";

// Verifies NFR-A2 of add-time-sliders-to-location-cards: keyboard focus shows the ring.
When(
  "the user focuses the slider of {string} with the keyboard",
  async ({ locationsWorld }, city: string) => {
    await sliderOf(locationsWorld.page, city).focus();
    await expect(sliderOf(locationsWorld.page, city)).toBeFocused();
  },
);

// Verifies NFR-A2 of add-time-sliders-to-location-cards: the ring is the accent colour.
Then(
  "the handle of {string} has an outline in the accent colour",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const accentColour = await readTokenStyle(page, "color", ACCENT_TOKEN);
    const handle = visibleHandleOf(page, city);
    await expect(handle).toHaveCSS("outline-color", accentColour);
    await expect(handle).not.toHaveCSS("outline-style", NO_OUTLINE_STYLE);
  },
);

// Verifies NFR-A3, FR9 of add-time-sliders-to-location-cards: name, range and value text.
Then(
  "the slider {string} has the value {int} within {int} to {int} and the value text {string}",
  async (
    { locationsWorld },
    name: string,
    value: number,
    minimum: number,
    maximum: number,
    valueText: string,
  ) => {
    const slider = locationsWorld.page.getByRole("slider", { name });
    await expect(slider).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("aria-valuemin", String(minimum));
    await expect(slider).toHaveAttribute("aria-valuemax", String(maximum));
    await expect(slider).toHaveAttribute("aria-valuetext", valueText);
  },
);
