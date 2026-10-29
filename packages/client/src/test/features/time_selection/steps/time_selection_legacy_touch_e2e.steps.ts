import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  KeyboardKey,
  TRACK_STEP_MINUTES,
  TRACK_VALUE_MIN_MINUTES,
} from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { sliderOf } from "./timeSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const VALUE_ATTRIBUTE = "aria-valuenow";
const valueBeforeKeyPress = new WeakMap<object, number>();

// Verifies NFR-A2 of support-legacy-ios-12-safari: role, name and range after a tap.
Then(
  "the slider of {string} keeps its role, name and range",
  async ({ locationsWorld }, city: string) => {
    const slider = sliderOf(locationsWorld.page, city);
    await expect(slider).toHaveAttribute(
      "aria-valuemin",
      String(TRACK_VALUE_MIN_MINUTES),
    );
    await expect(slider).toHaveAttribute("aria-valuemax", /^\d+$/);
    await expect(slider).toHaveAttribute("aria-valuetext", /\S/);
  },
);

// Verifies NFR-A2 of support-legacy-ios-12-safari: keys still move the slider.
When(
  "the user presses ArrowRight on the slider of {string}",
  async ({ locationsWorld }, city: string) => {
    const slider = sliderOf(locationsWorld.page, city);
    valueBeforeKeyPress.set(
      locationsWorld,
      Number(await slider.getAttribute(VALUE_ATTRIBUTE)),
    );
    await slider.focus();
    await locationsWorld.page.keyboard.press(KeyboardKey.ARROW_RIGHT);
  },
);

// Verifies NFR-A2 of support-legacy-ios-12-safari: one track step per key press.
Then(
  "the slider of {string} moved one track step",
  async ({ locationsWorld }, city: string) => {
    const before = valueBeforeKeyPress.get(locationsWorld) ?? Number.NaN;
    await expect(sliderOf(locationsWorld.page, city)).toHaveAttribute(
      VALUE_ATTRIBUTE,
      String(before + TRACK_STEP_MINUTES),
    );
  },
);
