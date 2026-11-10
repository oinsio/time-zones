import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  dispatchTouch,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import {
  cellOf,
  centreOf,
  frameOf,
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
const HOLD_MOVE_COUNT = 6;
const MOVE_STEP_PITCH_DIVISOR = 5;
const READINGS_KEY = "handleValueReadings";
const HOLD_MOVE_INTERVAL_MS = 100;
const PAGE_DOWN_COUNT_TO_NINE = 3;
const MIN_HANDLE_WIDTH_PX = 24;
const MIN_HANDLE_HEIGHT_PX = 44;
const MAX_STEP_MINUTES = 15;
const MINUTES_PER_HOUR = 60;
const ELEVEN_OCLOCK_MINUTES = 11 * MINUTES_PER_HOUR;
const NINE_OCLOCK_MINUTES = 9 * MINUTES_PER_HOUR;
const HALF = 2;

type FingerDrag = {
  handle: Locator;
  lastX: number;
  readings: number[];
  scrollBefore: number;
};
const fingerDrags = new WeakMap<Page, FingerDrag>();

const valueOf = async (handle: Locator) =>
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
    await expect(startHandleOf(page)).toHaveAttribute("aria-valuetext", "09:00");
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
  const from = centreOf(await requireBox(handle));
  const scrollBefore = await panelOf(page).evaluate((panel) => panel.scrollLeft);
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
  for (let x = from.x; direction * (edgeX - x) > 0; x += direction * moveStepPx) {
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
  fingerDrags.set(page, { handle, lastX: edgeX, readings, scrollBefore });
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
    const scrollAfter = await panelOf(page).evaluate((panel) => panel.scrollLeft);
    if (direction === "right") expect(scrollAfter).toBeGreaterThan(scrollBefore);
    else expect(scrollAfter).toBeLessThan(scrollBefore);
  },
);

Then(
  "the meeting range ends later than 11:00",
  async ({ locationsWorld }) => {
    expect(await valueOf(endHandleOf(locationsWorld.page))).toBeGreaterThan(
      ELEVEN_OCLOCK_MINUTES,
    );
  },
);

Then(
  "the meeting range starts earlier than 09:00",
  async ({ locationsWorld }) => {
    expect(await valueOf(startHandleOf(locationsWorld.page))).toBeLessThan(
      NINE_OCLOCK_MINUTES,
    );
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
  /^the (?:end|start) handle is within a quarter of a cell of the finger$/,
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const drag = fingerDrags.get(page);
    if (!drag) throw new Error("No finger drag was made");
    const handleCentre = centreOf(await requireBox(drag.handle));
    const pitch = (await requireBox(cellOf(page, SAMPLE_CITY, 1))).width;
    expect(Math.abs(handleCentre.x - drag.lastX)).toBeLessThanOrEqual(
      pitch / CELLS_PITCH_FRACTION + EDGE_INSET_PX,
    );
  },
);

When("the user scrolls the strips back to the start", async ({ locationsWorld }) => {
  await panelOf(locationsWorld.page).evaluate((panel) => {
    panel.scrollLeft = 0;
  });
});

Then(
  "the hour frame lies inside the strips' visible part",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const panelBox = await requireBox(panelOf(page));
    await expect
      .poll(async () => {
        const frameBox = await requireBox(frameOf(page));
        return (
          frameBox.x >= panelBox.x - EDGE_TOLERANCE_PX &&
          frameBox.x + frameBox.width <=
            panelBox.x + panelBox.width + EDGE_TOLERANCE_PX
        );
      })
      .toBe(true);
  },
);

// Verifies FR12, NFR-A1 of add-grid-meeting-range-and-share.
Then(
  /^the slider "([^"]+)" has the value (\d+), the minimum (\d+), the maximum (\d+) and the value text "([^"]+)"$/,
  async (
    { locationsWorld },
    name: string,
    value: string,
    minimum: string,
    maximum: string,
    valueText: string,
  ) => {
    const slider = locationsWorld.page.getByRole("slider", { name });
    await expect(slider).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("aria-valuemin", String(minimum));
    await expect(slider).toHaveAttribute("aria-valuemax", String(maximum));
    await expect(slider).toHaveAttribute("aria-valuetext", valueText);
  },
);

When(
  /^the user presses "([^"]+)" on the (start|end) handle$/,
  async ({ locationsWorld }, key: string, which: string) => {
    const { page } = locationsWorld;
    await (which === "start" ? startHandleOf(page) : endHandleOf(page)).press(
      key,
    );
  },
);

Then(
  "each handle is at least {int} by {int} px",
  async ({ locationsWorld }, width: number, height: number) => {
    expect([width, height]).toEqual([
      MIN_HANDLE_WIDTH_PX,
      MIN_HANDLE_HEIGHT_PX,
    ]);
    const { page } = locationsWorld;
    for (const handle of [startHandleOf(page), endHandleOf(page)]) {
      const box = await requireBox(handle);
      expect(box.width).toBeGreaterThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(height);
    }
  },
);

Then(
  "a focused handle has a focus ring in the accent colour",
  async ({ locationsWorld }) => {
    const handle = startHandleOf(locationsWorld.page);
    await handle.focus();
    await expect(handle).toHaveCSS(
      "outline-color",
      readThemeColours("light").accent,
    );
  },
);
