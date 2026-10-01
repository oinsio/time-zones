import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

import { listRow } from "./locationsE2eHelpers";
import {
  centreOf,
  clearTransitionRuns,
  DOWNWARD_DRAG_PX,
  dragMouse,
  dragWithFinger,
  handleNamed,
  measure,
  measurementsByPage,
  moveHandle,
  readListOrder,
  releasePointFor,
  SIDEWAYS_DRAG_PX,
  startTouch,
  TOUCH_SWIPE_DISTANCE_PX,
} from "./locationsReorderE2eHelpers";
import { waitForTwoAnimationFrames } from "./locationsShortcutE2eHelpers";

const { Given, When } = createBdd(test);

const LIVE_REGION = "[aria-live]";
const SPACE_KEY = "Space";
const ESCAPE_KEY = "Escape";
const DOWN_KEY = "ArrowDown";
const UP_KEY = "ArrowUp";
const MOVE_ABOVE = "above";
const MOVE_DOWN = "down";

const POSITION_IN_ANNOUNCEMENT = /position (\d+) of/;
const NEXT_POSITION_STEP: Record<string, number> = {
  [DOWN_KEY]: 1,
  [UP_KEY]: -1,
};

const readAnnouncedPosition = async (page: Page) => {
  const announcement = await page
    .locator(LIVE_REGION, { hasText: POSITION_IN_ANNOUNCEMENT })
    .textContent();
  return Number(announcement?.match(POSITION_IN_ANNOUNCEMENT)?.[1]);
};

/** Presses the key and waits for the announced position to follow, so a press never lands mid-move. */
const pressTimes = async (page: Page, key: string, times: number) => {
  for (let press = 0; press < times; press++) {
    const positionBefore = await readAnnouncedPosition(page);
    await page.keyboard.press(key);
    await expect
      .poll(() => readAnnouncedPosition(page))
      .toBe(positionBefore + NEXT_POSITION_STEP[key]);
  }
};

// Verifies FR1, NFR-R2 of reorder-locations-by-drag-and-drop: mouse drag.
When(
  /^the user drags "([^"]+)" (above|below) "([^"]+)" with the mouse$/,
  async (
    { locationsWorld },
    cityName: string,
    direction: string,
    targetName: string,
  ) => {
    const { page } = locationsWorld;
    const from = await centreOf(moveHandle(page, cityName));
    const to = await releasePointFor(
      page,
      targetName,
      direction === MOVE_ABOVE,
    );
    await dragMouse(page, from, to);
    await clearTransitionRuns(page);
    await page.mouse.up();
  },
);

// Verifies FR1, NFR-R2 of reorder-locations-by-drag-and-drop: touch drag.
When(
  "the user drags {string} below {string} with a finger",
  async ({ locationsWorld }, cityName: string, targetName: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const from = await centreOf(moveHandle(page, cityName));
    const to = await releasePointFor(page, targetName, false);
    await dragWithFinger(session, from, to);
  },
);

// Verifies FR3 of reorder-locations-by-drag-and-drop: Escape cancels a pointer drag.
When(
  "the user drags {string} below {string} with the mouse and presses Escape before dropping",
  async ({ locationsWorld }, cityName: string, targetName: string) => {
    const { page } = locationsWorld;
    const from = await centreOf(moveHandle(page, cityName));
    const to = await releasePointFor(page, targetName, false);
    await dragMouse(page, from, to);
    await page.keyboard.press(ESCAPE_KEY);
    await page.mouse.up();
  },
);

// Verifies UX2 of reorder-locations-by-drag-and-drop: the card is held, not released.
When(
  "the user starts dragging {string} with the mouse to the right and down",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await expect(moveHandle(page, cityName)).toBeVisible();
    const neighbour = (await readListOrder(page)).find(
      (name) => name !== cityName,
    );
    if (!neighbour) throw new Error("The list has no other card");
    measurementsByPage.set(page, await measure(page, cityName, neighbour));
    const from = await centreOf(moveHandle(page, cityName));
    await dragMouse(page, from, {
      x: from.x + SIDEWAYS_DRAG_PX,
      y: from.y + DOWNWARD_DRAG_PX,
    });
  },
);

// Verifies FR7 of reorder-locations-by-drag-and-drop: keyboard pick-up.
When(
  "the user picks up {string} with the keyboard",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    await moveHandle(page, cityName).focus();
    await page.keyboard.press(SPACE_KEY);
    await expect(
      page.locator(LIVE_REGION, { hasText: "picked up" }),
    ).toHaveCount(1);
    // The keyboard sensor starts listening for arrow keys one task later.
    await waitForTwoAnimationFrames(page);
  },
);

When(
  /^the user moves the picked-up card (down|up) (\d+) times?$/,
  async ({ locationsWorld }, direction: string, times: string) => {
    const key = direction === MOVE_DOWN ? DOWN_KEY : UP_KEY;
    await pressTimes(locationsWorld.page, key, Number(times));
  },
);

When(
  "the user drops the picked-up card with the keyboard",
  async ({ locationsWorld }) => {
    await locationsWorld.page.keyboard.press(SPACE_KEY);
  },
);

When("the user presses Escape", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press(ESCAPE_KEY);
});

// Verifies UX3 of reorder-locations-by-drag-and-drop: a click is not a drag.
When(
  "the user clicks the move handle {string}",
  async ({ locationsWorld }, handleName: string) => {
    await handleNamed(locationsWorld.page, handleName).click();
    await waitForTwoAnimationFrames(locationsWorld.page);
  },
);

// Verifies UX3 of reorder-locations-by-drag-and-drop: scrolling over a card.
When(
  "the user swipes up over the city name of {string} with a finger",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const start = await centreOf(
      listRow(page, cityName).getByText(cityName, { exact: true }),
    );
    await dragWithFinger(session, start, {
      x: start.x,
      y: start.y + TOUCH_SWIPE_DISTANCE_PX,
    });
  },
);

Given(
  "the screen is {int} by {int} px for the locations",
  async ({ locationsWorld }, width: number, height: number) => {
    await locationsWorld.page.setViewportSize({ width, height });
  },
);
