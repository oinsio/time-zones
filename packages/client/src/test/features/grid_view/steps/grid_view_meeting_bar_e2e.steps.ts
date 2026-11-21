// Verifies FR12, NFR-A3, NFR-R2 of move-meeting-range-and-extend-past-midnight: the sticky meeting bar in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { DATE_BAR_SELECTOR, MEETING_BAR_SELECTOR } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { requireBox, rowsOf } from "./hourGridE2eHelpers";
import { clearButtonOf, shareButtonOf } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const PIXEL_TOLERANCE = 1;
const LAST_ROW_CITY = "London";
const THIRD_ROW_CITY = "Kolkata";
const MAX_SHIFT_TAB_PRESSES = 40;
const MEETING_TIME_BUTTON = /^Enter meeting time/;

const isFullyBetween = (
  box: { y: number; height: number },
  topPx: number,
  bottomPx: number,
) =>
  box.y >= topPx - PIXEL_TOLERANCE &&
  box.y + box.height <= bottomPx + PIXEL_TOLERANCE;

const spanButtonOf = (page: Page, city: string) =>
  listRow(page, city).getByRole("button", { name: MEETING_TIME_BUTTON });

Then(
  "the meeting bar is fully visible at the top of the viewport with the share and clear buttons",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    await expect
      .poll(
        async () => (await requireBox(page.locator(MEETING_BAR_SELECTOR))).y,
      )
      .toBeLessThanOrEqual(PIXEL_TOLERANCE);
    const barBox = await requireBox(page.locator(MEETING_BAR_SELECTOR));
    expect(barBox.y).toBeGreaterThanOrEqual(-PIXEL_TOLERANCE);
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(viewport?.height ?? 0);
    for (const button of [shareButtonOf(page), clearButtonOf(page)]) {
      const box = await requireBox(button);
      expect(isFullyBetween(box, barBox.y, barBox.y + barBox.height)).toBe(
        true,
      );
    }
  },
);

Then(
  "at least one grid row is fully visible between the meeting bar and the date bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const barBox = await requireBox(page.locator(MEETING_BAR_SELECTOR));
    const dateBarBox = await requireBox(page.locator(DATE_BAR_SELECTOR));
    const rowBoxes = await rowsOf(page).evaluateAll((rows) =>
      rows.map((row) => {
        const { y, height } = row.getBoundingClientRect();
        return { y, height };
      }),
    );
    expect(
      rowBoxes.some((box) =>
        isFullyBetween(box, barBox.y + barBox.height, dateBarBox.y),
      ),
    ).toBe(true);
  },
);

Then("the header is not in the viewport", async ({ locationsWorld }) => {
  const box = await requireBox(locationsWorld.page.locator("header"));
  expect(box.y + box.height).toBeLessThanOrEqual(0);
});

When(
  "the user presses Shift+Tab until the focus is on the span of the third row",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await sliderOf(page, LAST_ROW_CITY).focus();
    const target = spanButtonOf(page, THIRD_ROW_CITY);
    for (let press = 0; press < MAX_SHIFT_TAB_PRESSES; press += 1) {
      await page.keyboard.press("Shift+Tab");
      if (
        await target.evaluate((button) => button === document.activeElement)
      ) {
        return;
      }
    }
    throw new Error("the span of the third row never took the focus");
  },
);

Then(
  "that span is fully visible below the meeting bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const barBox = await requireBox(page.locator(MEETING_BAR_SELECTOR));
    const spanBox = await requireBox(spanButtonOf(page, THIRD_ROW_CITY));
    expect(
      isFullyBetween(
        spanBox,
        barBox.y + barBox.height,
        page.viewportSize()?.height ?? 0,
      ),
    ).toBe(true);
  },
);
