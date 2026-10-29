import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { REORDER_TOUCH_ACTIVATION_DELAY_MS } from "@/constants";
import { emulateEngineWithoutPointerEvents } from "@/test/e2e/withoutPointerEvents";
import { test } from "./locations_ui_e2e.fixtures";
import {
  centreOf,
  dispatchTouch,
  dragWithFinger,
  moveHandle,
  releasePointFor,
  startTouch,
  TOUCH_SWIPE_DISTANCE_PX,
} from "./locationsReorderE2eHelpers";

const { Given, When } = createBdd(test);

const HOLD_MARGIN_MS = 100;
const HOLD_DURATION_MS = REORDER_TOUCH_ACTIVATION_DELAY_MS + HOLD_MARGIN_MS;
const DRAG_STEP_COUNT = 10;
const DRAG_STEP_PAUSE_MS = 20;

// Verifies FR9, UX2 of support-legacy-ios-12-safari: the engine has no Pointer Events.
Given("the engine has no Pointer Events", async ({ locationsWorld }) => {
  await emulateEngineWithoutPointerEvents(locationsWorld.page);
});

// Verifies FR9, UX2 of support-legacy-ios-12-safari: drag after the hold.
When(
  "the user holds the handle of {string} and drags it below {string} with a finger",
  async ({ locationsWorld }, cityName: string, targetName: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const from = await centreOf(moveHandle(page, cityName));
    const to = await releasePointFor(page, targetName, false);
    await dispatchTouch(session, "touchStart", from);
    await page.waitForTimeout(HOLD_DURATION_MS);
    for (let step = 1; step <= DRAG_STEP_COUNT; step++) {
      const progress = step / DRAG_STEP_COUNT;
      await dispatchTouch(session, "touchMove", {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
      });
      await page.waitForTimeout(DRAG_STEP_PAUSE_MS);
    }
    await dispatchTouch(session, "touchEnd");
  },
);

// Verifies FR9, UX2 of support-legacy-ios-12-safari: a swipe without a hold scrolls.
When(
  "the user swipes up over the handle of {string} with a finger",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const start = await centreOf(moveHandle(page, cityName));
    await dragWithFinger(session, start, {
      x: start.x,
      y: start.y + TOUCH_SWIPE_DISTANCE_PX,
    });
  },
);

// Verifies FR9 of support-legacy-ios-12-safari: waits for the rows before checking the height.
Given(
  "the list makes the page taller than the screen",
  async ({ locationsWorld }) => {
    await expect
      .poll(() =>
        locationsWorld.page.evaluate(
          () => document.documentElement.scrollHeight > window.innerHeight,
        ),
      )
      .toBe(true);
  },
);
