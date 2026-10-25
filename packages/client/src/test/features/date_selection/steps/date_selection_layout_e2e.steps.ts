// Verifies NFR-R2 of select-date-with-calendar-and-now.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  buildManyLocations,
  calendarOf,
  dateButton,
  nextDayButton,
  nowButton,
  previousDayButton,
  requireBox,
} from "./dateSelectionE2eHelpers";

const { Given, When, Then } = createBdd(test);

const EDGE_PADDING_PX = 24;
const CENTER_TOLERANCE_PX = 2;
const FOOTER_SELECTOR = "footer";
const HALF = 2;
const LOCATION_COUNT = 12;
const FULL_SCREEN_TEXT = "full screen";

const footerBox = (page: Page) => requireBox(page.locator(FOOTER_SELECTOR));

// Verifies NFR-R2 of select-date-with-calendar-and-now.
Given("the list has 12 locations", async ({ locationsWorld }) => {
  await locationsWorld.seedList(buildManyLocations());
});

Then(
  "the arrows and the date are at the left of the bar and Now is at the right",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const previous = await requireBox(previousDayButton(page));
    const next = await requireBox(nextDayButton(page));
    const date = await requireBox(dateButton(page));
    const now = await requireBox(nowButton(page));
    expect(previous.x).toBeLessThanOrEqual(EDGE_PADDING_PX);
    expect(previous.x).toBeLessThan(date.x);
    expect(date.x).toBeLessThan(next.x);
    expect(next.x + next.width).toBeLessThan(now.x);
    expect(now.x + now.width).toBeGreaterThanOrEqual(
      viewportWidth - EDGE_PADDING_PX,
    );
  },
);

Then(
  "the bar touches the bottom of the viewport",
  async ({ locationsWorld }) => {
    const viewportHeight = locationsWorld.page.viewportSize()?.height ?? 0;
    const bar = await footerBox(locationsWorld.page);
    expect(bar.y + bar.height).toBeCloseTo(viewportHeight, 0);
  },
);

Then(
  "the arrows, the date and Now form one group centred in the bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const first = await requireBox(previousDayButton(page));
    const last = await requireBox(nowButton(page));
    const bar = await footerBox(page);
    const groupCentre = (first.x + last.x + last.width) / HALF;
    expect(
      Math.abs(groupCentre - (bar.x + bar.width / HALF)),
    ).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
  },
);

When("the user scrolls to the end", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect(page.getByRole("listitem")).toHaveCount(LOCATION_COUNT);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

Then("the last card is fully above the bar", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(async () => {
      const lastCard = await requireBox(page.getByRole("listitem").last());
      const bar = await footerBox(page);
      return lastCard.y + lastCard.height - bar.y;
    })
    .toBeLessThanOrEqual(1);
});

Then(
  /^the calendar is laid out as (.+)$/,
  async ({ locationsWorld }, layout: string) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    const dialog = await requireBox(calendarOf(page));
    if (layout === FULL_SCREEN_TEXT) {
      expect(dialog).toMatchObject({
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
      return;
    }
    expect(dialog.width).toBeLessThan(viewport.width);
    expect(
      Math.abs(dialog.x + dialog.width / HALF - viewport.width / HALF),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(dialog.y + dialog.height / HALF - viewport.height / HALF),
    ).toBeLessThanOrEqual(1);
  },
);
