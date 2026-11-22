// Implements FR15-FR20 of move-meeting-range-and-extend-past-midnight: locators and gestures of the move handle in a real browser.
import type { Page } from "@playwright/test";
import { centreOf, HOUR_CELL_SELECTOR, requireBox } from "./hourGridE2eHelpers";
import { stripOfRow } from "./meetingE2eHelpers";

export const GRIP_WIDTH_PX = 36;
export const GRIP_HEIGHT_PX = 12;
export const MIN_HIT_AREA_PX = 44;
export const FRAME_BORDER_PX = 3;
export const BAR_LINE_PX = 1;
export const HALF = 2;
export const AXIS_TOLERANCE_PX = 1;
export const DRAG_STEP_COUNT = 8;
export const HOLD_MS = 250;
export const HOLD_MARGIN_MS = 60;
export const SAMPLE_CITY = "Almaty";
export const ONE_AND_A_HALF = 1.5;
export const EDGE_INSET_PX = 6;
export const FRAME_MARGIN_PX = 80;
export const HOLD_MOVE_COUNT = 12;
export const HOLD_MOVE_INTERVAL_MS = 40;
export const SCROLLED_STRIPS = new WeakMap<Page, number>();

export const moveHandleOf = (page: Page) =>
  page.locator('[data-meeting-handle="MOVE"]');
export const moveSliderOf = (page: Page) =>
  moveHandleOf(page).getByRole("slider");
export const gripOf = (page: Page) => moveSliderOf(page).locator("span");
/** The pitch of the cells of the first row, whatever language its city is written in. */
export const pitchOf = async (page: Page) => {
  const cells = stripOfRow(page, 0).locator(HOUR_CELL_SELECTOR);
  return (
    (await requireBox(cells.nth(1))).x - (await requireBox(cells.nth(0))).x
  );
};
export const centreOfLocator = async (locator: ReturnType<typeof gripOf>) =>
  centreOf(await requireBox(locator));
/** The placement of the fixed move handle follows a scroll one animation frame later. */
export const waitForTwoFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
export const dragWithMouse = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: DRAG_STEP_COUNT });
  await page.mouse.up();
};
