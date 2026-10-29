import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  hereEntryOf,
  measureHereEntry,
  measureLocationCard,
} from "./hereEntryE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { listRow, SCREEN_HEIGHT_PX } from "./locationsE2eHelpers";

const { When, Then } = createBdd(test);

const MOSCOW = "Moscow";
/** The card layout switches at the md breakpoint. */
const WIDE_LAYOUT_MIN_WIDTH_PX = 768;

type LayoutRecord = {
  scrollWidth: number;
  clientWidth: number;
  hereEntry: Awaited<ReturnType<typeof measureHereEntry>>;
  locationCard: Awaited<ReturnType<typeof measureLocationCard>>;
};
type HeightRecord = { hereEntryHeight: number; locationCardY: number };

const layoutRecords = new WeakMap<Page, LayoutRecord[]>();
const heightRecords = new WeakMap<Page, HeightRecord>();

// Verifies NFR-R1, UX1 of show-here-entry-for-device-time.
When(
  "the viewport is {int} px and then {int} px wide",
  async ({ locationsWorld }, firstWidth: number, secondWidth: number) => {
    const { page } = locationsWorld;
    const records: LayoutRecord[] = [];
    for (const width of [firstWidth, secondWidth]) {
      await page.setViewportSize({ width, height: SCREEN_HEIGHT_PX });
      await expect(hereEntryOf(page)).toBeVisible();
      const widths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      records.push({
        ...widths,
        hereEntry: await measureHereEntry(page),
        locationCard: await measureLocationCard(page, MOSCOW),
      });
    }
    layoutRecords.set(page, records);
  },
);

Then("the page did not scroll horizontally", async ({ locationsWorld }) => {
  for (const record of layoutRecords.get(locationsWorld.page) ?? []) {
    expect(record.scrollWidth).toBeLessThanOrEqual(record.clientWidth);
  }
});

Then(
  "the Here entry's layout matches the Moscow card's layout",
  async ({ locationsWorld }) => {
    const records = layoutRecords.get(locationsWorld.page) ?? [];
    expect(records).toHaveLength(2);
    for (const { clientWidth, hereEntry, locationCard } of records) {
      expect(hereEntry.card).toEqual(locationCard.card);
      expect(hereEntry.track.x).toBe(locationCard.track.x);
      // A card has a menu at its end that the Here entry has not: below 768 px
      // the stacked track spans the same width; from 768 px the time and the
      // track start at the same place and the track may run to the card edge.
      if (clientWidth < WIDE_LAYOUT_MIN_WIDTH_PX) {
        expect(hereEntry.track.width).toBe(locationCard.track.width);
      } else {
        expect(hereEntry.time.x).toBe(locationCard.time.x);
        expect(hereEntry.track.width).toBeGreaterThanOrEqual(
          locationCard.track.width,
        );
      }
    }
  },
);

// Verifies UX3, NFR-P2 of show-here-entry-for-device-time: the exemplar city keeps the height.
Then(
  "the Here entry shows the city {string}",
  async ({ locationsWorld }, city: string) => {
    await expect(
      hereEntryOf(locationsWorld.page).getByText(city, { exact: true }),
    ).toBeVisible();
  },
);

When("the zone cities data finishes loading", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  heightRecords.set(page, {
    hereEntryHeight: (await requireBox(hereEntryOf(page))).height,
    locationCardY: (await requireBox(listRow(page, MOSCOW))).y,
  });
  await locationsWorld.releaseHeldRequests();
});

Then(
  "the Here entry's height is the same as before the load",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const before = heightRecords.get(page);
    expect((await requireBox(hereEntryOf(page))).height).toBe(
      before?.hereEntryHeight,
    );
  },
);

Then("the Moscow card has not moved", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const before = heightRecords.get(page);
  expect((await requireBox(listRow(page, MOSCOW))).y).toBe(
    before?.locationCardY,
  );
});
