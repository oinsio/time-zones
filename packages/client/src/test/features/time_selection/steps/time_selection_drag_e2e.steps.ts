// Verifies FR1, FR2, FR3, FR4, NFR-A1, NFR-R1, UX1, UX2, UX3 of fix-day-track-drag-continuity-and-smoothness.
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { emulateEngineWithoutPointerEvents } from "@/test/e2e/withoutPointerEvents";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  dispatchTouch,
  type Point,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import {
  barOf,
  centreOfBox,
  DRAG_STEPS,
  HALF,
  pointOnBar,
  requireBox,
  sliderOf,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";

const { Given, When, Then } = createBdd(test);

enum DragPointer {
  MOUSE = "mouse",
  FINGER = "finger",
  FINGER_WITHOUT_POINTER_EVENTS = "finger on an engine without Pointer Events",
}

const FIRST_MOVE_PX = 20;
const HANDLE_TOLERANCE_PX = 1;
const PERCENT = 100;
const heldMouseX = new WeakMap<object, number>();
const pointerKinds = new WeakMap<object, DragPointer>();

async function requireInViewport(page: Page, point: Point) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("The page has no viewport");
  expect(point.x).toBeGreaterThanOrEqual(0);
  expect(point.y).toBeGreaterThanOrEqual(0);
  expect(point.x).toBeLessThanOrEqual(viewport.width);
  expect(point.y).toBeLessThanOrEqual(viewport.height);
}

async function dragMouse(page: Page, from: Point, to: Point) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + FIRST_MOVE_PX, from.y);
  await page.mouse.move(to.x, to.y, { steps: DRAG_STEPS });
  await page.mouse.up();
}

async function dragFinger(page: Page, from: Point, to: Point) {
  const session = await startTouch(page);
  await dispatchTouch(session, "touchStart", from);
  await dispatchTouch(session, "touchMove", {
    x: from.x + FIRST_MOVE_PX,
    y: from.y,
  });
  for (let step = 1; step <= DRAG_STEPS; step++) {
    const progress = step / DRAG_STEPS;
    await dispatchTouch(session, "touchMove", {
      x: from.x + FIRST_MOVE_PX + (to.x - from.x - FIRST_MOVE_PX) * progress,
      y: from.y + (to.y - from.y) * progress,
    });
  }
  await dispatchTouch(session, "touchEnd");
}

// Verifies FR4, UX3: a finger on an engine without Pointer Events needs the emulation before the page loads.
Given("the pointer is {string}", async ({ locationsWorld }, kind: string) => {
  pointerKinds.set(locationsWorld, kind as DragPointer);
  if (kind === DragPointer.FINGER_WITHOUT_POINTER_EVENTS) {
    await emulateEngineWithoutPointerEvents(locationsWorld.page);
  }
});

async function performDrag(
  world: { page: Page },
  fromPercent: number,
  toPercent: number,
  city: string,
  offsetBelowPx: number,
) {
  const { page } = world;
  const kind = pointerKinds.get(world) ?? DragPointer.MOUSE;
  const bar = await requireBox(barOf(page, city));
  const from = await pointOnBar(page, city, fromPercent);
  const onBar = await pointOnBar(page, city, toPercent);
  const to = { x: onBar.x, y: bar.y + bar.height + offsetBelowPx };
  await requireInViewport(page, from);
  await requireInViewport(page, to);
  if (kind === DragPointer.MOUSE) await dragMouse(page, from, to);
  else await dragFinger(page, from, to);
}

// Verifies FR1, FR2, FR4, UX1, UX3, NFR-R1: the drag goes on while the pointer is away from the track.
When(
  "the user drags from {int} percent to {int} percent of the {string} track, {int} px below it, and releases",
  async (
    { locationsWorld },
    fromPercent: number,
    toPercent: number,
    city: string,
    offsetPx: number,
  ) => performDrag(locationsWorld, fromPercent, toPercent, city, offsetPx),
);

// Verifies FR1, FR2: a drag past the end, with the pointer above the track.
When(
  "the user drags from {int} percent to {int} percent of the {string} track, {int} px above it, and releases",
  async (
    { locationsWorld },
    fromPercent: number,
    toPercent: number,
    city: string,
    offsetPx: number,
  ) => {
    const bar = await requireBox(barOf(locationsWorld.page, city));
    await performDrag(
      locationsWorld,
      fromPercent,
      toPercent,
      city,
      -(offsetPx + bar.height),
    );
  },
);

// Verifies FR3, UX2: the mouse is held at a position of the track.
When(
  "the user holds the mouse on the {string} track at {float} percent",
  async ({ locationsWorld }, city: string, percent: number) => {
    const { page } = locationsWorld;
    const target = await pointOnBar(page, city, percent);
    if (!heldMouseX.has(locationsWorld)) {
      const start = await pointOnBar(page, city, percent / HALF);
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
    }
    await page.mouse.move(target.x, target.y, { steps: DRAG_STEPS });
    heldMouseX.set(locationsWorld, target.x);
  },
);

// Verifies FR3, UX2, NFR-R1: the handle centre is within 1 px of the pointer.
Then(
  "the handle of {string} is under the pointer",
  async ({ locationsWorld }, city: string) => {
    const handle = centreOfBox(
      await requireBox(visibleHandleOf(locationsWorld.page, city)),
    );
    expect(
      Math.abs(handle.x - (heldMouseX.get(locationsWorld) ?? Number.NaN)),
    ).toBeLessThanOrEqual(HANDLE_TOLERANCE_PX);
  },
);

When("the user releases the mouse", async ({ locationsWorld }) => {
  await locationsWorld.page.mouse.up();
});

// Verifies FR3, UX2: after the release the handle stands at the selected step.
Then(
  "the handle of {string} is on the selected step of its track",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const slider = sliderOf(page, city);
    const value = Number(await slider.getAttribute("aria-valuenow"));
    const maxValue = Number(await slider.getAttribute("aria-valuemax"));
    const expected = await pointOnBar(page, city, (value / maxValue) * PERCENT);
    const handle = centreOfBox(await requireBox(visibleHandleOf(page, city)));
    expect(Math.abs(handle.x - expected.x)).toBeLessThanOrEqual(
      HANDLE_TOLERANCE_PX,
    );
  },
);

// Verifies NFR-A1: the slider reports the selected step, not the pointer position.
Then(
  "the slider of {string} reports the value {int} and the text {string}",
  async ({ locationsWorld }, city: string, value: number, text: string) => {
    const slider = sliderOf(locationsWorld.page, city);
    await expect(slider).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("aria-valuetext", text);
  },
);
