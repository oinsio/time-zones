// Verifies FR17, FR18, NFR-A1, NFR-A2, UX1, UX2 (the move handle: values, keys, place, hit area) of move-meeting-range-and-extend-past-midnight in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { MEETING_BAR_SELECTOR } from "@/constants";
import { emulateEngineWithoutPointerEvents } from "@/test/e2e/withoutPointerEvents";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  centreOf,
  isTopmostAt,
  panelOf,
  requireBox,
} from "./hourGridE2eHelpers";
import { meetingFrameOf } from "./meetingE2eHelpers";

import {
  AXIS_TOLERANCE_PX,
  BAR_LINE_PX,
  centreOfLocator,
  FRAME_BORDER_PX,
  GRIP_HEIGHT_PX,
  GRIP_WIDTH_PX,
  gripOf,
  HALF,
  moveHandleOf,
  moveSliderOf,
  pitchOf,
  SAMPLE_CITY,
  waitForTwoFrames,
} from "./meetingMoveE2eHelpers";

const { Given, When, Then } = createBdd(test);

Given("an engine without Pointer Events", async ({ locationsWorld }) => {
  await emulateEngineWithoutPointerEvents(locationsWorld.page);
});

When(
  /^the user presses "([^"]+)" on the move handle$/,
  async ({ locationsWorld }, key: string) => {
    await moveSliderOf(locationsWorld.page).press(key);
  },
);

When(
  /^the user focuses the hour strip of "([^"]+)" and presses Tab three times$/,
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await sliderOf(page, city).focus();
    const names: string[] = [];
    for (let press = 0; press < 3; press += 1) {
      await page.keyboard.press("Tab");
      names.push(
        await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? "",
        ),
      );
    }
    visitedNames.set(page, names);
  },
);
const visitedNames = new WeakMap<Page, string[]>();

Then(
  /^the focus visited "([^"]+)", "([^"]+)" and "([^"]+)" in that order$/,
  async ({ locationsWorld }, first: string, second: string, third: string) => {
    expect(visitedNames.get(locationsWorld.page)).toEqual([
      first,
      second,
      third,
    ]);
  },
);

Then(
  "the move handle is 36 px wide and 12 px high and its centre is the centre of the frame's top line",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const grip = await requireBox(gripOf(page));
    const frame = await requireBox(meetingFrameOf(page));
    expect(grip.width).toBeCloseTo(GRIP_WIDTH_PX, 0);
    expect(grip.height).toBeCloseTo(GRIP_HEIGHT_PX, 0);
    const centre = centreOf(grip);
    expect(centre.x).toBeCloseTo(frame.x + frame.width / HALF, 0);
    expect(centre.y).toBeCloseTo(frame.y + FRAME_BORDER_PX / HALF, 0);
  },
);

Then(
  "it does not overlap the text of the first row header",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const grip = await requireBox(gripOf(page));
    const cityBox = await requireBox(
      listRow(page, SAMPLE_CITY).getByText(SAMPLE_CITY, { exact: true }),
    );
    const isOverlapping =
      grip.x < cityBox.x + cityBox.width &&
      grip.x + grip.width > cityBox.x &&
      grip.y < cityBox.y + cityBox.height &&
      grip.y + grip.height > cityBox.y;
    expect(isOverlapping).toBe(false);
  },
);

When(
  "the page is scrolled down by {int} px",
  async ({ locationsWorld }, scrollPx: number) => {
    const { page } = locationsWorld;
    await page.evaluate((valuePx) => window.scrollTo(0, valuePx), scrollPx);
    await waitForTwoFrames(page);
  },
);

Then(
  /^the vertical centre of the move handle is on the axis of the (frame's top line|meeting bar's bottom line)$/,
  async ({ locationsWorld }, which: string) => {
    const { page } = locationsWorld;
    await expect
      .poll(async () => {
        const grip = centreOf(await requireBox(gripOf(page)));
        const frame = await requireBox(meetingFrameOf(page));
        const bar = await requireBox(page.locator(MEETING_BAR_SELECTOR));
        const frameAxis = frame.y + FRAME_BORDER_PX / HALF;
        const barAxis = bar.y + bar.height - BAR_LINE_PX / HALF;
        const expected = which.startsWith("frame") ? frameAxis : barAxis;
        return Math.abs(grip.y - expected) <= AXIS_TOLERANCE_PX;
      })
      .toBe(true);
  },
);

Then(
  "its horizontal centre is the horizontal centre of the meeting frame",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect
      .poll(async () => {
        const grip = centreOf(await requireBox(gripOf(page)));
        const frame = await requireBox(meetingFrameOf(page));
        return Math.abs(grip.x - (frame.x + frame.width / HALF));
      })
      .toBeLessThanOrEqual(AXIS_TOLERANCE_PX);
  },
);

Then(
  "the topmost element at the centre of the move handle is the move handle",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    expect(
      await isTopmostAt(
        moveHandleOf(page),
        await centreOfLocator(gripOf(page)),
      ),
    ).toBe(true);
  },
);

When("the user scrolls the strips by two cells", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const pitch = await pitchOf(page);
  await panelOf(page).evaluate((panel, deltaPx) => {
    panel.scrollLeft += deltaPx;
  }, 2 * pitch);
  await waitForTwoFrames(page);
});

Then(
  "the meeting bar and the move handle are fully inside the viewport",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    const bar = await requireBox(page.locator(MEETING_BAR_SELECTOR));
    expect(bar.y).toBeGreaterThanOrEqual(-AXIS_TOLERANCE_PX);
    await expect
      .poll(async () => {
        const box = await requireBox(moveSliderOf(page));
        return (
          box.y >= -AXIS_TOLERANCE_PX &&
          box.y + box.height <= (viewport?.height ?? 0) &&
          box.x >= 0 &&
          box.x + box.width <= (viewport?.width ?? 0)
        );
      })
      .toBe(true);
  },
);
