import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { nowButton } from "../../date_selection/steps/dateSelectionE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  centreOf,
  dispatchTouch,
  dragWithFinger,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import {
  barOf,
  centreOfBox,
  DRAG_STEPS,
  handleOf,
  pointOnBar,
  requireBox,
  sliderOf,
  timeTextOf,
} from "./timeSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const MAX_TAB_PRESSES = 12;
const SWIPE_UP_DISTANCE_PX = -150;
const LIVE_TIME_OF_ALMATY = "12:30";

// Verifies FR3, NFR-R2 of add-time-sliders-to-location-cards: a mouse drag along the handle's track.
When(
  "the user drags the handle of {string} to {int} percent of its track",
  async ({ locationsWorld }, city: string, percent: number) => {
    const { page } = locationsWorld;
    const from = centreOfBox(await requireBox(handleOf(page, city)));
    const to = await pointOnBar(page, city, percent);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, from.y, { steps: DRAG_STEPS });
    await page.mouse.up();
  },
);

// Verifies FR4 of add-time-sliders-to-location-cards: a press that pins a quarter hour.
When(
  "the user clicks {int} percent of the track of {string}",
  async ({ locationsWorld }, percent: number, city: string) => {
    const { page } = locationsWorld;
    const point = await pointOnBar(page, city, percent);
    await page.mouse.click(point.x, point.y);
  },
);

// Verifies FR4, NFR-A2 of add-time-sliders-to-location-cards: one Tab stop per track.
When(
  "the user focuses the slider of {string} and presses Tab until the slider of {string} is focused",
  async ({ locationsWorld }, startCity: string, targetCity: string) => {
    const { page } = locationsWorld;
    await sliderOf(page, startCity).focus();
    const targetName = await sliderOf(page, targetCity).getAttribute(
      "aria-label",
    );
    for (let press = 0; press < MAX_TAB_PRESSES; press++) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          name: active?.getAttribute("aria-label") ?? "",
          isInsideSlider:
            active?.closest("[role=slider]") !== null &&
            active?.getAttribute("role") !== "slider",
        };
      });
      expect(focus.isInsideSlider).toBe(false);
      if (focus.name === targetName) return;
    }
    throw new Error(`Tab never reached the slider of ${targetCity}`);
  },
);

// Verifies FR4, NFR-A2 of add-time-sliders-to-location-cards.
When(
  "the user presses the key {string}",
  async ({ locationsWorld }, key: string) => {
    await locationsWorld.page.keyboard.press(key);
  },
);

// Verifies FR3, NFR-R2 of add-time-sliders-to-location-cards.
Then("the page has not scrolled", async ({ locationsWorld }) => {
  const scroll = await locationsWorld.page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  expect(scroll).toEqual({ x: 0, y: 0 });
});

// Verifies FR4 of add-time-sliders-to-location-cards: the value is read from aria-valuenow.
Then(
  "the slider of {string} reads {int}",
  async ({ locationsWorld }, city: string, value: number) => {
    await expect(sliderOf(locationsWorld.page, city)).toHaveAttribute(
      "aria-valuenow",
      String(value),
    );
  },
);

// Verifies FR3 of add-time-sliders-to-location-cards: a finger swipe that must scroll, not select.
When(
  "the user swipes up from the {string} track with a finger",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const start = await centreOf(barOf(page, city));
    await dragWithFinger(session, start, {
      x: start.x,
      y: start.y + SWIPE_UP_DISTANCE_PX,
    });
  },
);

// Verifies FR3, NFR-R2 of add-time-sliders-to-location-cards: a finger tap on a track.
When(
  "the user taps {int} percent of the {string} track with a finger",
  async ({ locationsWorld }, percent: number, city: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const point = await pointOnBar(page, city, percent);
    await dispatchTouch(session, "touchStart", point);
    await dispatchTouch(session, "touchEnd");
  },
);

// Verifies FR3, FR5 of add-time-sliders-to-location-cards.
Then("the Now button is shown", async ({ locationsWorld }) => {
  await expect(nowButton(locationsWorld.page)).toBeVisible();
});

// Verifies FR3 of add-time-sliders-to-location-cards.
Then("the Now button is not shown", async ({ locationsWorld }) => {
  await expect(nowButton(locationsWorld.page)).toHaveCount(0);
});

// Verifies FR3 of add-time-sliders-to-location-cards.
Then(
  "the time of {string} still equals the live time",
  async ({ locationsWorld }, city: string) => {
    await expect(timeTextOf(locationsWorld.page, city)).toHaveText(
      LIVE_TIME_OF_ALMATY,
    );
  },
);

// Verifies FR3 of add-time-sliders-to-location-cards: the time text of a card.
Then(
  "the card of {string} shows the time {string}",
  async ({ locationsWorld }, city: string, time: string) => {
    await expect(timeTextOf(locationsWorld.page, city)).toHaveText(time);
  },
);
