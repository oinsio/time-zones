// Verifies FR4, FR6, FR9, FR19 of move-meeting-range-and-extend-past-midnight: the strip tail and the range past midnight in a real browser.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { cellsOf, centreOf, requireBox } from "./hourGridE2eHelpers";
import { endHandleOf } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

type TailDragSample = { cells: number; end: number };
let tailDragSamples: TailDragSample[] = [];
const MINUTES_PER_DAY = 1440;
const DRAG_STEP_COUNT = 1;
const DRAG_OVERSHOOT_STEPS = 200;
const DRAG_STEP_PX = 1;
const TRACK_STEP_MINUTES = 15;
const SAMPLE_CITY = "Almaty";
const DATE_BAR_SELECTOR = "[data-date-bar]";
const MARCH_EIGHTH = /March 8/;

Then(
  "every row has {int} hour cells",
  async ({ locationsWorld }, count: number) => {
    for (const city of ["Almaty", "Moscow", "Kolkata", "New York"]) {
      await expect(cellsOf(locationsWorld.page, city)).toHaveCount(count);
    }
  },
);

Then("the date bar still shows 8 March", async ({ locationsWorld }) => {
  await expect(locationsWorld.page.locator(DATE_BAR_SELECTOR)).toContainText(
    MARCH_EIGHTH,
  );
});

When(
  "the user drags the end handle with the mouse to the right past the last cell of the reference day",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const samples: TailDragSample[] = [];
    const from = centreOf(await requireBox(endHandleOf(page)));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let step = 1; step <= DRAG_OVERSHOOT_STEPS; step += 1) {
      await page.mouse.move(from.x + step * DRAG_STEP_PX, from.y, {
        steps: DRAG_STEP_COUNT,
      });
      samples.push({
        cells: await cellsOf(page, SAMPLE_CITY).count(),
        end: Number(await endHandleOf(page).getAttribute("aria-valuenow")),
      });
    }
    await page.mouse.up();
    tailDragSamples = samples;
  },
);

Then(
  "each time the strip tail grew, the end of the meeting range changed by at most one track step",
  async () => {
    const samples = tailDragSamples;
    expect(samples.length).toBeGreaterThan(0);
    for (let index = 1; index < samples.length; index += 1) {
      if (samples[index].cells > samples[index - 1].cells) {
        expect(samples[index].end - samples[index - 1].end).toBeLessThanOrEqual(
          TRACK_STEP_MINUTES,
        );
      }
    }
  },
);

Then("the meeting range ends after midnight", async ({ locationsWorld }) => {
  const endValue = Number(
    await endHandleOf(locationsWorld.page).getAttribute("aria-valuenow"),
  );
  expect(endValue).toBeGreaterThan(MINUTES_PER_DAY);
});
