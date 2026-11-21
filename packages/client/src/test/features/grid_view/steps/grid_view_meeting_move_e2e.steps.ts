// Verifies FR15-FR18, FR20, NFR-A1, NFR-A2, UX1, UX2 of move-meeting-range-and-extend-past-midnight: the move handle and the move gestures in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { MEETING_BAR_SELECTOR } from "@/constants";
import { emulateEngineWithoutPointerEvents } from "@/test/e2e/withoutPointerEvents";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  dispatchTouch,
  dragWithFinger,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  cellOf,
  centreOf,
  HOUR_CELL_SELECTOR,
  isTopmostAt,
  panelOf,
  requireBox,
} from "./hourGridE2eHelpers";
import { meetingFrameOf, stripOfRow } from "./meetingE2eHelpers";

const { Given, When, Then } = createBdd(test);

const GRIP_WIDTH_PX = 36;
const GRIP_HEIGHT_PX = 12;
const MIN_HIT_AREA_PX = 44;
const FRAME_BORDER_PX = 3;
const BAR_LINE_PX = 1;
const HALF = 2;
const AXIS_TOLERANCE_PX = 1;
const DRAG_STEP_COUNT = 8;
const HOLD_MS = 250;
const HOLD_MARGIN_MS = 60;
const SAMPLE_CITY = "Almaty";
const ONE_AND_A_HALF = 1.5;
const EDGE_INSET_PX = 6;
const FRAME_MARGIN_PX = 80;
const HOLD_MOVE_COUNT = 12;
const HOLD_MOVE_INTERVAL_MS = 40;
const SCROLLED_STRIPS = new WeakMap<Page, number>();

const moveHandleOf = (page: Page) =>
  page.locator('[data-meeting-handle="MOVE"]');
const moveSliderOf = (page: Page) => moveHandleOf(page).getByRole("slider");
const gripOf = (page: Page) => moveSliderOf(page).locator("span");
/** The pitch of the cells of the first row, whatever language its city is written in. */
const pitchOf = async (page: Page) => {
  const cells = stripOfRow(page, 0).locator(HOUR_CELL_SELECTOR);
  return (
    (await requireBox(cells.nth(1))).x - (await requireBox(cells.nth(0))).x
  );
};
const centreOfLocator = async (locator: ReturnType<typeof gripOf>) =>
  centreOf(await requireBox(locator));
/** The placement of the fixed move handle follows a scroll one animation frame later. */
const waitForTwoFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
const dragWithMouse = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: DRAG_STEP_COUNT });
  await page.mouse.up();
};

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
