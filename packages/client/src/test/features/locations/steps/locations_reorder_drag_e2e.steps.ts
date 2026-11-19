import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { test } from "./locations_ui_e2e.fixtures";

import { listRow } from "./locationsE2eHelpers";
import {
  centreOf,
  clearTransitionRuns,
  DOWNWARD_DRAG_PX,
  dragMouse,
  dragWithFinger,
  grabArea,
  measure,
  measurementsByPage,
  menuButton,
  readListOrder,
  releasePointFor,
  SIDEWAYS_DRAG_PX,
  startTouch,
  TOUCH_HOLD_MS,
  TOUCH_SWIPE_DISTANCE_PX,
} from "./locationsReorderE2eHelpers";
import { waitForTwoAnimationFrames } from "./locationsShortcutE2eHelpers";

const { Given, When } = createBdd(test);

const ESCAPE_KEY = "Escape";
const MOVE_ABOVE = "above";
const MOVE_DOWN = "down";

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
    const from = await centreOf(grabArea(page, cityName));
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
    const from = await centreOf(grabArea(page, cityName));
    const to = await releasePointFor(page, targetName, false);
    await dragWithFinger(session, from, to, TOUCH_HOLD_MS);
  },
);

// Verifies UX1 of reorder-locations-by-drag-and-drop: the card stays held while the others slide.
When(
  "the user drags {string} below {string} with the mouse and holds it",
  async ({ locationsWorld }, cityName: string, targetName: string) => {
    const { page } = locationsWorld;
    const from = await centreOf(grabArea(page, cityName));
    const to = await releasePointFor(page, targetName, false);
    await dragMouse(page, from, to);
  },
);

When("the user drops the held card", async ({ locationsWorld }) => {
  await locationsWorld.page.mouse.up();
});

When("the user presses Escape", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press(ESCAPE_KEY);
});

// Verifies FR3 of reorder-locations-by-drag-and-drop: Escape cancels a pointer drag.
When(
  "the user drags {string} below {string} with the mouse and presses Escape before dropping",
  async ({ locationsWorld }, cityName: string, targetName: string) => {
    const { page } = locationsWorld;
    const from = await centreOf(grabArea(page, cityName));
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
    await expect(grabArea(page, cityName)).toBeVisible();
    const neighbour = (await readListOrder(page)).find(
      (name) => name !== cityName,
    );
    if (!neighbour) throw new Error("The list has no other card");
    measurementsByPage.set(page, await measure(page, cityName, neighbour));
    const from = await centreOf(grabArea(page, cityName));
    await dragMouse(page, from, {
      x: from.x + SIDEWAYS_DRAG_PX,
      y: from.y + DOWNWARD_DRAG_PX,
    });
  },
);

// Verifies FR16, NFR-A3 of redesign-cards-grid-and-day-palettes: the location menu moves a card.
When(
  /^the user moves "([^"]+)" (down|up) (\d+) times? with its location menu$/,
  async (
    { locationsWorld },
    cityName: string,
    direction: string,
    times: string,
  ) => {
    const { page } = locationsWorld;
    const itemName =
      direction === MOVE_DOWN
        ? englishLocale.locations.moveDown
        : englishLocale.locations.moveUp;
    for (let move = 0; move < Number(times); move++) {
      const orderBefore = await readListOrder(page);
      await menuButton(page, cityName).click();
      await page.getByRole("menuitem", { name: itemName }).click();
      await expect.poll(() => readListOrder(page)).not.toEqual(orderBefore);
    }
  },
);

// Verifies UX3 of reorder-locations-by-drag-and-drop: a click is not a drag.
When(
  "the user clicks the grab area of {string}",
  async ({ locationsWorld }, cityName: string) => {
    await grabArea(locationsWorld.page, cityName).click();
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
