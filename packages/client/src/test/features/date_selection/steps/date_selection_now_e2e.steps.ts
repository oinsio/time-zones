// Verifies FR2, FR4, NFR-A1, NFR-A2, NFR-R1 of keep-now-button-visible-when-live.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  type Box,
  computedColourOfVariable,
  MIN_TOUCH_TARGET_PX,
  nextDayButton,
  nowButton,
  requireBox,
  showNextDay,
} from "./dateSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const TAB_KEY = "Tab";
const MUTED_FILL_VARIABLE = "--color-muted";
const MUTED_FOREGROUND_VARIABLE = "--color-muted-foreground";
const MAX_POSITION_SHIFT_PX = 1;
const INACTIVE = "inactive";

// Verifies NFR-A2 of keep-now-button-visible-when-live.
When(
  "the user focuses the next-day button and presses Tab",
  async ({ locationsWorld }) => {
    await nextDayButton(locationsWorld.page).focus();
    await locationsWorld.page.keyboard.press(TAB_KEY);
  },
);

// Verifies NFR-A2 of keep-now-button-visible-when-live.
Then(
  "neither the next-day button nor Now has the focus",
  async ({ locationsWorld }) => {
    await expect(nextDayButton(locationsWorld.page)).not.toBeFocused();
    await expect(nowButton(locationsWorld.page)).not.toBeFocused();
  },
);

// Verifies NFR-A1 of keep-now-button-visible-when-live.
Then(
  "the bar has a Now button named {string} that is {word}",
  async ({ locationsWorld }, name: string, availability: string) => {
    const button = locationsWorld.page.getByRole("button", {
      name,
      exact: true,
    });
    if (availability === INACTIVE) await expect(button).toBeDisabled();
    else await expect(button).toBeEnabled();
  },
);

// Verifies FR2, M5 of keep-now-button-visible-when-live.
When(
  "the user forces a click on the inactive Now button",
  async ({ locationsWorld }) => {
    await nowButton(locationsWorld.page).click({ force: true });
  },
);

// Verifies FR4, UX1, M1 of keep-now-button-visible-when-live.
Then(
  "the inactive Now shows a clock icon and the label {string} in the muted colours",
  async ({ locationsWorld }, label: string) => {
    const { page } = locationsWorld;
    const now = nowButton(page);
    await expect(now).toBeDisabled();
    await expect(now.locator("svg")).toHaveCount(1);
    await expect(now).toHaveText(label);
    await expect(now).toHaveCSS(
      "background-color",
      await computedColourOfVariable(page, MUTED_FILL_VARIABLE),
    );
    await expect(now).toHaveCSS(
      "color",
      await computedColourOfVariable(page, MUTED_FOREGROUND_VARIABLE),
    );
  },
);

// Verifies NFR-R1, UX2, M3 of keep-now-button-visible-when-live.
Then(
  "Now keeps its place and size when the user moves to the next day",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const liveBox = await requireBox(nowButton(page));
    await showNextDay(page);
    const pinnedBox = await requireBox(nowButton(page));
    for (const side of ["x", "y", "width", "height"] as (keyof Box)[]) {
      expect(Math.abs(liveBox[side] - pinnedBox[side])).toBeLessThanOrEqual(
        MAX_POSITION_SHIFT_PX,
      );
    }
    expect(liveBox.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(liveBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  },
);
