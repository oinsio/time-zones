// Verifies FR8 of refine-meeting-range-entry-and-handles: a finger presses beside the grip and the handle keeps that distance.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  dispatchTouch,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import {
  cellOf,
  centreOf,
  isTopmostAt,
  panelOf,
  requireBox,
} from "./hourGridE2eHelpers";
import {
  dragHandleWithMouse,
  endHandleOf,
  leftEdgeOfCell,
  meetingFrameOf,
  startHandleOf,
  stripOfRow,
} from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const SAMPLE_CITY = "Almaty";
const HANDLE_ROW_INDEX = { start: 2, end: 1 };
const EDGE_TOLERANCE_PX = 3;
const CELLS_PITCH_FRACTION = 4;
const EDGE_INSET_PX = 6;
/** The finger presses this far right of the handle's centre: beside the grip, within the hit area. */
const FINGER_PRESS_OFFSET_PX = 16;
const HOLD_MOVE_COUNT = 6;
const MOVE_STEP_PITCH_DIVISOR = 5;
const READINGS_KEY = "handleValueReadings";
const HOLD_MOVE_INTERVAL_MS = 100;
const PAGE_DOWN_COUNT_TO_NINE = 3;
const MAX_STEP_MINUTES = 15;
const MINUTES_PER_HOUR = 60;
const ELEVEN_OCLOCK_MINUTES = 11 * MINUTES_PER_HOUR;
const NINE_OCLOCK_MINUTES = 9 * MINUTES_PER_HOUR;
const HALF = 2;

type FingerDrag = {
  handle: Locator;
  lastX: number;
  pressOffsetPx: number;
  readings: number[];
  scrollBefore: number;
};
const fingerDrags = new WeakMap<Page, FingerDrag>();

/** A handle stopped by the day's start or end cannot keep its distance from the finger. */
const isHandleAtItsLimit = async (handle: Locator) => {
  const value = await handle.getAttribute("aria-valuenow");
  return (
    value === (await handle.getAttribute("aria-valuemin")) ||
    value === (await handle.getAttribute("aria-valuemax"))
  );
};

const readHandleValue = async (handle: Locator) =>
  Number(await handle.getAttribute("aria-valuenow"));

// Verifies FR9 of add-grid-meeting-range-and-share.
Then(
  /^the (end|start) handle stands on the strip of "([^"]+)" at the (right|left) edge of the meeting frame$/,
  async ({ locationsWorld }, which: "end" | "start", _city, side: string) => {
    const { page } = locationsWorld;
    const handleBox = await requireBox(
      (which === "end" ? endHandleOf : startHandleOf)(page),
    );
    const stripBox = await requireBox(
      stripOfRow(page, HANDLE_ROW_INDEX[which]),
    );
    const frameBox = await requireBox(meetingFrameOf(page));
    const handleCentre = centreOf(handleBox);
    expect(handleCentre.y).toBeGreaterThan(stripBox.y);
    expect(handleCentre.y).toBeLessThan(stripBox.y + stripBox.height);
    const edgeX = side === "right" ? frameBox.x + frameBox.width : frameBox.x;
    expect(Math.abs(handleCentre.x - edgeX)).toBeLessThanOrEqual(
      EDGE_TOLERANCE_PX,
    );
  },
);

Then(
  "the topmost element at the centre of each handle is that handle",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const handle of [startHandleOf(page), endHandleOf(page)]) {
      const centre = centreOf(await requireBox(handle));
      expect(await isTopmostAt(handle, centre)).toBe(true);
    }
  },
);

// Verifies FR10 of add-grid-meeting-range-and-share.
When(
  /^the user drags the (end|start) handle with the mouse to the (left|right) edge of column (\d+) of "([^"]+)"$/,
  async (
    { locationsWorld },
    which: "end" | "start",
    side: string,
    column: string,
    city: string,
  ) => {
    const { page } = locationsWorld;
    const cellLeft = await leftEdgeOfCell(page, city, Number(column));
    const cellWidth = (await requireBox(cellOf(page, city, Number(column))))
      .width;
    await dragHandleWithMouse(
      page,
      (which === "end" ? endHandleOf : startHandleOf)(page),
      side === "left" ? cellLeft : cellLeft + cellWidth,
    );
  },
);

// Verifies FR10, FR11 of add-grid-meeting-range-and-share: the sample meeting reached by the keyboard, as its columns are scrolled out of view on a phone.
When(
  "the user sets the sample meeting with the strips scrolled to its frame",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const strip = page.getByRole("slider", { name: `Time in ${SAMPLE_CITY}` });
    await strip.focus();
    await strip.press("Enter");
    for (let press = 0; press < PAGE_DOWN_COUNT_TO_NINE; press += 1) {
      await startHandleOf(page).press("PageDown");
    }
    await endHandleOf(page).press("PageDown");
    await endHandleOf(page).press("PageDown");
    await expect(startHandleOf(page)).toHaveAttribute(
      "aria-valuetext",
      "09:00",
    );
    await expect(endHandleOf(page)).toHaveAttribute("aria-valuetext", "11:00");
    const frameBox = await requireBox(meetingFrameOf(page));
    const panelBox = await requireBox(panelOf(page));
    await panelOf(page).evaluate(
      (panel, shiftPx) => panel.scrollBy(shiftPx, 0),
      frameBox.x + frameBox.width / HALF - (panelBox.x + panelBox.width / HALF),
    );
  },
);

async function dragHandleWithFinger(
  page: Page,
  handle: Locator,
  edgeX: number,
) {
  const handleCentre = centreOf(await requireBox(handle));
  const from = {
    x: handleCentre.x + FINGER_PRESS_OFFSET_PX,
    y: handleCentre.y,
  };
  const scrollBefore = await panelOf(page).evaluate(
    (panel) => panel.scrollLeft,
  );
  const finger = await startTouch(page);
  const pitch = (await requireBox(cellOf(page, SAMPLE_CITY, 1))).width;
  const moveStepPx = pitch / MOVE_STEP_PITCH_DIVISOR;
  await handle.evaluate((slider, key) => {
    const values = [Number(slider.getAttribute("aria-valuenow"))];
    Reflect.set(window, key, values);
    new MutationObserver(() =>
      values.push(Number(slider.getAttribute("aria-valuenow"))),
    ).observe(slider, { attributeFilter: ["aria-valuenow"] });
  }, READINGS_KEY);
  await dispatchTouch(finger, "touchStart", from);
  const direction = Math.sign(edgeX - from.x);
  for (
    let x = from.x;
    direction * (edgeX - x) > 0;
    x += direction * moveStepPx
  ) {
    await dispatchTouch(finger, "touchMove", { x, y: from.y });
  }
  for (let reading = 0; reading < HOLD_MOVE_COUNT; reading += 1) {
    await page.waitForTimeout(HOLD_MOVE_INTERVAL_MS);
    await dispatchTouch(finger, "touchMove", { x: edgeX, y: from.y });
  }
  await dispatchTouch(finger, "touchEnd");
  const readings = await page.evaluate(
    (key) => Reflect.get(window, key) as number[],
    READINGS_KEY,
  );
  fingerDrags.set(page, {
    handle,
    lastX: edgeX,
    pressOffsetPx: FINGER_PRESS_OFFSET_PX,
    readings,
    scrollBefore,
  });
}

When(
  "the user drags the end handle with a finger to the right edge of the strips and holds it there",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    await dragHandleWithFinger(
      page,
      endHandleOf(page),
      panelBox.x + panelBox.width - EDGE_INSET_PX,
    );
  },
);

When(
  "the user drags the start handle with a finger to the left edge of the strips and holds it there",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    await dragHandleWithFinger(
      page,
      startHandleOf(page),
      panelBox.x + EDGE_INSET_PX,
    );
  },
);

Then(
  /^the strips have scrolled to the (right|left)$/,
  async ({ locationsWorld }, direction: string) => {
    const { page } = locationsWorld;
    const scrollBefore = fingerDrags.get(page)?.scrollBefore ?? 0;
    const scrollAfter = await panelOf(page).evaluate(
      (panel) => panel.scrollLeft,
    );
    if (direction === "right")
      expect(scrollAfter).toBeGreaterThan(scrollBefore);
    else expect(scrollAfter).toBeLessThan(scrollBefore);
  },
);

Then("the meeting range ends later than 11:00", async ({ locationsWorld }) => {
  expect(
    await readHandleValue(endHandleOf(locationsWorld.page)),
  ).toBeGreaterThan(ELEVEN_OCLOCK_MINUTES);
});

Then(
  "the meeting range starts earlier than 09:00",
  async ({ locationsWorld }) => {
    expect(
      await readHandleValue(startHandleOf(locationsWorld.page)),
    ).toBeLessThan(NINE_OCLOCK_MINUTES);
  },
);

Then(
  "the start handle never changed by more than 15 minutes at a time",
  async ({ locationsWorld }) => {
    const { readings } = fingerDrags.get(locationsWorld.page) ?? {
      readings: [],
    };
    expect(readings.length).toBeGreaterThan(1);
    for (let index = 1; index < readings.length; index += 1) {
      expect(
        Math.abs(readings[index] - readings[index - 1]),
      ).toBeLessThanOrEqual(MAX_STEP_MINUTES);
    }
  },
);

Then(
  /^the (?:end|start) handle keeps its distance from the finger at the press$/,
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const drag = fingerDrags.get(page);
    if (!drag) throw new Error("No finger drag was made");
    if (await isHandleAtItsLimit(drag.handle)) return;
    const handleCentre = centreOf(await requireBox(drag.handle));
    const pitch = (await requireBox(cellOf(page, SAMPLE_CITY, 1))).width;
    expect(
      Math.abs(handleCentre.x - (drag.lastX - drag.pressOffsetPx)),
    ).toBeLessThanOrEqual(pitch / CELLS_PITCH_FRACTION + EDGE_INSET_PX);
  },
);
