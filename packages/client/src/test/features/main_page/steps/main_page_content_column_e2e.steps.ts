// Verifies FR12, NFR-R1, UX4 of redesign-cards-grid-and-day-palettes: the content column.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { dateBarOf } from "../../settings/steps/settingsE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { englishLocale } from "./englishTexts";

const { Then } = createBdd(test);

const CONTENT_COLUMN_MAX_WIDTH_PX = 1120;
const WIDTH_TOLERANCE_PX = 1;
const HALF = 2;

const viewportWidthOf = (page: Page) =>
  page.evaluate(() => document.documentElement.clientWidth);

const headerColumnOf = (page: Page) =>
  page.getByRole("banner").locator(":scope > div").first();
const listOf = (page: Page) => page.locator("main ul").first();

const expectCentredColumn = async (part: Locator, viewportWidth: number) => {
  const box = await requireBox(part);
  expect(box.width).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH_PX);
  expect(
    Math.abs(box.x + box.width / HALF - viewportWidth / HALF),
  ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
};

Then(
  "the header, the list and the date bar group are at most 1120 px wide",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const part of [headerColumnOf(page), listOf(page), dateBarOf(page)]) {
      expect((await requireBox(part)).width).toBeLessThanOrEqual(
        CONTENT_COLUMN_MAX_WIDTH_PX,
      );
    }
  },
);

Then(
  "their centre is the centre of the page width",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewportWidth = await viewportWidthOf(page);
    for (const part of [headerColumnOf(page), listOf(page), dateBarOf(page)]) {
      await expectCentredColumn(part, viewportWidth);
    }
  },
);

Then(
  "the meeting bar is as wide as the viewport",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const box = await requireBox(page.getByRole("banner"));
    expect(
      Math.abs(box.width - (await viewportWidthOf(page))),
    ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
  },
);

Then("the date bar is as wide as the viewport", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const box = await requireBox(page.locator("[data-date-bar]"));
  expect(
    Math.abs(box.width - (await viewportWidthOf(page))),
  ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
});

Then(
  "the date bar group is at most 1120 px wide and centred",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expectCentredColumn(dateBarOf(page), await viewportWidthOf(page));
  },
);

Then(
  "the empty-state explanation lies inside a centred column at most 1120 px wide",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const explanation = page.getByText(englishLocale.views.emptyState);
    await expect(explanation).toBeVisible();
    const column = page.locator("main");
    const columnBox = await requireBox(column);
    const textBox = await requireBox(explanation);
    expect(columnBox.width).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH_PX);
    expect(textBox.x).toBeGreaterThanOrEqual(columnBox.x);
    expect(textBox.x + textBox.width).toBeLessThanOrEqual(
      columnBox.x + columnBox.width,
    );
    await expectCentredColumn(column, await viewportWidthOf(page));
  },
);
