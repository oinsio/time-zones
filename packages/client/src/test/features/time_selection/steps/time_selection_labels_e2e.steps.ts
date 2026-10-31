import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  allSliders,
  barOf,
  centreOfBox,
  HANDLE_SELECTOR,
  readTokenStyle,
  requireBox,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";

const { Then, When } = createBdd(test);

const TOLERANCE_PX = 1;
const MIN_TOUCH_TARGET_PX = 44;
const DAY_PERIOD_TOKENS = [
  "--color-day-night",
  "--color-day-morning",
  "--color-day-working",
  "--color-day-evening",
];
const WIDE_SCREEN_HEIGHT_PX = 800;

// Verifies FR7, NFR-R2 of add-time-sliders-to-location-cards: no labels below 768 px.
Then("no hour label is visible", async ({ locationsWorld }) => {
  const labels = locationsWorld.page.locator("[data-hour-label]");
  for (const label of await labels.all()) await expect(label).toBeHidden();
});

// Verifies FR7 of add-time-sliders-to-location-cards: the screen widens.
When(
  "the screen becomes {int} px wide",
  async ({ locationsWorld }, width: number) => {
    await locationsWorld.page.setViewportSize({
      width,
      height: WIDE_SCREEN_HEIGHT_PX,
    });
  },
);

// Verifies FR7 of add-time-sliders-to-location-cards: five labels under each bar.
Then(
  "every track shows {int} hour labels under its bar",
  async ({ locationsWorld }, labelCount: number) => {
    const { page } = locationsWorld;
    for (const row of await page.getByRole("listitem").all()) {
      const labels = row.locator("[data-hour-label]");
      await expect(labels).toHaveCount(labelCount);
      const bar = await requireBox(row.locator("[data-day-track-bar]"));
      const labelBoxes = [];
      for (const label of await labels.all()) {
        await expect(label).toBeVisible();
        const labelBox = await requireBox(label);
        expect(labelBox.y).toBeGreaterThanOrEqual(
          bar.y + bar.height - TOLERANCE_PX,
        );
        labelBoxes.push(labelBox);
      }
      const firstBox = labelBoxes[0];
      const lastBox = labelBoxes[labelBoxes.length - 1];
      expect(firstBox.x).toBeGreaterThanOrEqual(bar.x - TOLERANCE_PX);
      expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(
        bar.x + bar.width + TOLERANCE_PX,
      );
    }
  },
);

// Verifies UX2 of add-time-sliders-to-location-cards: the handle centre sits on the instant.
Then(
  "the centre of the handle of {string} is at {float} of its track within {int} px",
  async (
    { locationsWorld },
    city: string,
    fraction: number,
    tolerance: number,
  ) => {
    const { page } = locationsWorld;
    const bar = await requireBox(barOf(page, city));
    const handle = await requireBox(page.locator(HANDLE_SELECTOR).first());
    const expectedX = bar.x + bar.width * fraction;
    expect(Math.abs(centreOfBox(handle).x - expectedX)).toBeLessThanOrEqual(
      tolerance,
    );
  },
);

// Verifies UX1, NFR-R2 of add-time-sliders-to-location-cards: touch targets.
Then(
  "every slider is at least {int} px high and every handle at least {int} by {int} px",
  async (
    { locationsWorld },
    sliderHeight: number,
    handleWidth: number,
    handleHeight: number,
  ) => {
    const { page } = locationsWorld;
    expect(sliderHeight).toBe(MIN_TOUCH_TARGET_PX);
    for (const slider of await allSliders(page).all()) {
      expect((await requireBox(slider)).height).toBeGreaterThanOrEqual(
        sliderHeight,
      );
      const handle = await requireBox(slider.locator(HANDLE_SELECTOR));
      expect(handle.width).toBeGreaterThanOrEqual(handleWidth);
      expect(handle.height).toBeGreaterThanOrEqual(handleHeight);
    }
  },
);

// Verifies FR6 of add-time-sliders-to-location-cards: gradient colours are the theme tokens.
Then(
  "the colours of the track of {string} are the day-period token colours",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const backgroundImage = await barOf(page, city).evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    for (const token of DAY_PERIOD_TOKENS) {
      const tokenColour = await readTokenStyle(page, "color", token);
      expect(backgroundImage).toContain(tokenColour);
    }
  },
);

// Verifies UX1 of add-time-sliders-to-location-cards: outline comes from a token.
// Verifies FR2 of fix-location-card-and-header-layout: the fill is the card's.
Then(
  "the visible handle of {string} is filled with its card's fill and outlined with the foreground colour",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const handle = visibleHandleOf(page, city);
    const cardFill = await listRow(page, city).evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await expect(handle).toHaveCSS("background-color", cardFill);
    await expect(handle).toHaveCSS(
      "border-top-color",
      await readTokenStyle(page, "color", "--color-foreground"),
    );
  },
);
