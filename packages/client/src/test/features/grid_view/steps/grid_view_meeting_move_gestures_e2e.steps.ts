// Verifies FR15, FR16, FR20, UX1-UX4 (the move gestures and the states of the screenshots) of move-meeting-range-and-extend-past-midnight in a real browser.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  dispatchTouch,
  dragWithFinger,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import { cellOf, centreOf, panelOf, requireBox } from "./hourGridE2eHelpers";
import { meetingFrameOf } from "./meetingE2eHelpers";

import {
  centreOfLocator,
  DRAG_STEP_COUNT,
  dragWithMouse,
  EDGE_INSET_PX,
  FRAME_MARGIN_PX,
  gripOf,
  HOLD_MARGIN_MS,
  HOLD_MOVE_COUNT,
  HOLD_MOVE_INTERVAL_MS,
  HOLD_MS,
  MIN_HIT_AREA_PX,
  moveSliderOf,
  ONE_AND_A_HALF,
  pitchOf,
  SCROLLED_STRIPS,
  waitForTwoFrames,
} from "./meetingMoveE2eHelpers";

const { When, Then } = createBdd(test);

When(
  /^the user presses the mouse on column (\d+) of "([^"]+)", moves it one and a half cells to the right and releases it$/,
  async ({ locationsWorld }, column: string, city: string) => {
    const { page } = locationsWorld;
    const from = centreOf(await requireBox(cellOf(page, city, Number(column))));
    await dragWithMouse(page, from, {
      x: from.x + ONE_AND_A_HALF * (await pitchOf(page)),
      y: from.y,
    });
  },
);

When(
  /^the user drags the move handle one cell to the (left|right) with (the mouse|a finger)$/,
  async ({ locationsWorld }, direction: string, pointer: string) => {
    const { page } = locationsWorld;
    const from = await centreOfLocator(gripOf(page));
    const deltaPx = (direction === "left" ? -1 : 1) * (await pitchOf(page));
    const to = { x: from.x + deltaPx, y: from.y };
    if (pointer === "the mouse") {
      await dragWithMouse(page, from, to);
      return;
    }
    await dragWithFinger(await startTouch(page), from, to);
  },
);

When(
  /^the user holds a finger on column (\d+) of "([^"]+)" for 250 ms and then moves it (one|two) cells? to the right$/,
  async ({ locationsWorld }, column: string, city: string, count: string) => {
    const { page } = locationsWorld;
    const from = centreOf(await requireBox(cellOf(page, city, Number(column))));
    const cells = count === "one" ? 1 : 2;
    SCROLLED_STRIPS.set(
      page,
      await panelOf(page).evaluate((p) => p.scrollLeft),
    );
    await dragWithFinger(
      await startTouch(page),
      from,
      { x: from.x + cells * (await pitchOf(page)), y: from.y },
      HOLD_MS + HOLD_MARGIN_MS,
    );
  },
);

Then(
  "the strips did not scroll by the finger's travel",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const after = await panelOf(page).evaluate((panel) => panel.scrollLeft);
    expect(Math.abs(after - (SCROLLED_STRIPS.get(page) ?? 0))).toBeLessThan(
      await pitchOf(page),
    );
  },
);

When(
  /^the user drags a finger from column (\d+) to column (\d+) of "([^"]+)" without holding it first$/,
  async ({ locationsWorld }, from: string, to: string, city: string) => {
    const { page } = locationsWorld;
    await dragWithFinger(
      await startTouch(page),
      centreOf(await requireBox(cellOf(page, city, Number(from)))),
      centreOf(await requireBox(cellOf(page, city, Number(to)))),
    );
  },
);

When(
  /^the user swipes to the left from column (\d+) of "([^"]+)" without holding$/,
  async ({ locationsWorld }, column: string, city: string) => {
    const { page } = locationsWorld;
    const from = centreOf(await requireBox(cellOf(page, city, Number(column))));
    SCROLLED_STRIPS.set(
      page,
      await panelOf(page).evaluate((p) => p.scrollLeft),
    );
    await dragWithFinger(await startTouch(page), from, {
      x: from.x - 3 * (await pitchOf(page)),
      y: from.y,
    });
  },
);

Then("the strips scroll", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(() => panelOf(page).evaluate((panel) => panel.scrollLeft))
    .toBeGreaterThan(SCROLLED_STRIPS.get(page) ?? 0);
});

When(
  "the user drags the move handle with a finger to the right edge of the strips and holds it there",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    SCROLLED_STRIPS.set(
      page,
      await panelOf(page).evaluate((p) => p.scrollLeft),
    );
    const from = await centreOfLocator(gripOf(page));
    const edgeX = panelBox.x + panelBox.width - EDGE_INSET_PX;
    const finger = await startTouch(page);
    await dispatchTouch(finger, "touchStart", from);
    await dispatchTouch(finger, "touchMove", { x: edgeX, y: from.y });
    for (let hold = 0; hold < HOLD_MOVE_COUNT; hold += 1) {
      await page.waitForTimeout(HOLD_MOVE_INTERVAL_MS);
      await dispatchTouch(finger, "touchMove", { x: edgeX, y: from.y });
    }
    await dispatchTouch(finger, "touchEnd");
  },
);

Then(
  "the meeting range is 2 hours long and ends after midnight",
  async ({ locationsWorld }) => {
    const slider = moveSliderOf(locationsWorld.page);
    const startMinutes = Number(await slider.getAttribute("aria-valuenow"));
    const text = (await slider.getAttribute("aria-valuetext")) ?? "";
    const [startText, endText] = text.split("–");
    const toMinutes = (clock: string) => {
      const [hour, minute] = clock.split(":").map(Number);
      return hour * 60 + minute;
    };
    const lengthMinutes =
      (toMinutes(endText) - toMinutes(startText) + 24 * 60) % (24 * 60);
    expect(lengthMinutes).toBe(2 * 60);
    expect(startMinutes + lengthMinutes).toBeGreaterThan(24 * 60);
  },
);

Then(
  /^the box of the slider "([^"]+)" is at least 44 px wide and 44 px high and centred on its grip$/,
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    const box = await requireBox(page.getByRole("slider", { name }));
    expect(box.width).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
    const grip = centreOf(await requireBox(gripOf(page)));
    expect(grip.x).toBeCloseTo(centreOf(box).x, 0);
    expect(grip.y).toBeCloseTo(centreOf(box).y, 0);
  },
);

Then(
  "it does not overlap a location menu button",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const handle = await requireBox(moveSliderOf(page));
    const buttons = await page
      .getByRole("button", { name: /^Actions for/ })
      .evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
    for (const button of buttons) {
      const isOverlapping =
        handle.x < button.x + button.width &&
        handle.x + handle.width > button.x &&
        handle.y < button.y + button.height &&
        handle.y + handle.height > button.y;
      expect(isOverlapping).toBe(false);
    }
  },
);

When(
  "the user scrolls the strips to the meeting frame",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const frame = await requireBox(meetingFrameOf(page));
    const panelBox = await requireBox(panelOf(page));
    await panelOf(page).evaluate(
      (panel, deltaPx) => {
        panel.scrollLeft += deltaPx;
      },
      frame.x - panelBox.x - FRAME_MARGIN_PX,
    );
    await waitForTwoFrames(page);
  },
);

// Verifies UX1-UX4 of move-meeting-range-and-extend-past-midnight: the states of the approved screenshots.
const PAST_MIDNIGHT_STATES = [
  "with its strip tail",
  "with its strip tail wide",
];
const PAGE_FRACTIONS: Record<string, number> = {
  "list at the top": 0,
  "list in the middle": 0.5,
  "list at the bottom": 1,
};

When(
  /^the meeting is shown in the state "([^"]+)"$/,
  async ({ locationsWorld }, state: string) => {
    const { page } = locationsWorld;
    if (PAST_MIDNIGHT_STATES.includes(state)) {
      await page
        .getByRole("button", {
          name: /^(Enter meeting time|Ввести время встречи)/,
        })
        .first()
        .click();
      await page.keyboard.type("23");
      await page.keyboard.press("Tab");
      await page.keyboard.type("2");
      await page.keyboard.press("Enter");
      await waitForTwoFrames(page);
      return;
    }
    if (state === "the range being moved") {
      const grip = centreOf(await requireBox(gripOf(page)));
      await page.mouse.move(grip.x, grip.y);
      await page.mouse.down();
      await page.mouse.move(grip.x + (await pitchOf(page)), grip.y, {
        steps: DRAG_STEP_COUNT,
      });
      await waitForTwoFrames(page);
      return;
    }
    await page.evaluate((fraction) => {
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollRange * fraction);
    }, PAGE_FRACTIONS[state]);
    await waitForTwoFrames(page);
  },
);
