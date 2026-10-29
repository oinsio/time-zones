import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  BAR_SELECTOR,
  centreOfBox,
  requireBox,
} from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  hereEntryOf,
  hereEntrySliderOf,
  hereEntryTimeOf,
  measureHereEntry,
  measureLocationCard,
} from "./hereEntryE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import {
  listRow,
  parseCityNames,
  SCREEN_HEIGHT_PX,
} from "./locationsE2eHelpers";
import {
  dispatchTouch,
  readListOrder,
  startTouch,
} from "./locationsReorderE2eHelpers";

const { When, Then } = createBdd(test);

const MAX_TAB_PRESSES = 12;
const TAP_FRACTION_PERCENT = 75;
const PERCENT = 100;
const MOSCOW = "Moscow";
const TAB_KEY = "Tab";
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
const tabStopCounts = new WeakMap<Page, { inside: number; hasLeft: boolean }>();

const isFocusInsideHereEntry = (page: Page) =>
  page.evaluate(
    () => document.activeElement?.closest("section[aria-label]") !== null,
  );

// Verifies FR4 of show-here-entry-for-device-time: the Here entry is apart from the list.
Then(
  /^the rows are the Here entry, (.+)$/,
  async ({ locationsWorld }, quotedNames: string) => {
    const { page } = locationsWorld;
    const hereEntryBox = await requireBox(hereEntryOf(page));
    const firstCardBox = await requireBox(page.getByRole("listitem").first());
    expect(hereEntryBox.y).toBeLessThan(firstCardBox.y);
    expect(await readListOrder(page)).toEqual(parseCityNames(quotedNames));
  },
);

// Verifies FR11 of show-here-entry-for-device-time: the view contract.
Then(
  "the first row is the Here entry showing {string}",
  async ({ locationsWorld }, time: string) => {
    const { page } = locationsWorld;
    await expect(hereEntryTimeOf(page)).toHaveText(time);
    const hereEntryBox = await requireBox(hereEntryOf(page));
    const firstCardBox = await requireBox(page.getByRole("listitem").first());
    expect(hereEntryBox.y).toBeLessThan(firstCardBox.y);
  },
);

// Verifies FR5 of show-here-entry-for-device-time.
Then(
  "the Here entry shows the time {string}",
  async ({ locationsWorld }, time: string) => {
    await expect(hereEntryTimeOf(locationsWorld.page)).toHaveText(time);
  },
);

// Verifies FR12 of show-here-entry-for-device-time: a finger tap without Pointer Events.
When(
  "the user taps three quarters of the Here entry's day track",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const session = await startTouch(page);
    const barBox = await requireBox(
      hereEntrySliderOf(page).locator(BAR_SELECTOR),
    );
    const point = {
      x: barBox.x + (barBox.width * TAP_FRACTION_PERCENT) / PERCENT,
      y: centreOfBox(barBox).y,
    };
    await dispatchTouch(session, "touchStart", point);
    await dispatchTouch(session, "touchEnd");
  },
);

// Verifies NFR-A2 of show-here-entry-for-device-time.
Then(
  "the Here entry is named {string}",
  async ({ locationsWorld }, accessibleName: string) => {
    await expect(
      locationsWorld.page.getByRole("region", { name: accessibleName }),
    ).toBeVisible();
  },
);

Then(
  "the location list has {int} items",
  async ({ locationsWorld }, itemCount: number) => {
    await expect(locationsWorld.page.getByRole("listitem")).toHaveCount(
      itemCount,
    );
  },
);

Then(
  "the Here entry's slider is named {string}",
  async ({ locationsWorld }, sliderName: string) => {
    await expect(
      hereEntryOf(locationsWorld.page).getByRole("slider", {
        name: sliderName,
      }),
    ).toBeVisible();
  },
);

Then("the Here entry is shown", async ({ locationsWorld }) => {
  await expect(hereEntryOf(locationsWorld.page)).toBeVisible();
});

// Verifies NFR-A2 of show-here-entry-for-device-time: the Tab stops inside the Here entry.
When(
  "the user moves the focus through the page with Tab",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(hereEntryOf(page)).toBeVisible();
    const counts = { inside: 0, hasLeft: false };
    for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount++) {
      await page.keyboard.press(TAB_KEY);
      const isInside = await isFocusInsideHereEntry(page);
      if (isInside) counts.inside += 1;
      else if (counts.inside > 0) {
        counts.hasLeft = true;
        break;
      }
    }
    tabStopCounts.set(page, counts);
  },
);

Then(
  "exactly one element of the Here entry takes the focus: the slider named {string}",
  async ({ locationsWorld }, sliderName: string) => {
    const { page } = locationsWorld;
    expect(tabStopCounts.get(page)?.inside).toBe(1);
    await hereEntrySliderOf(page).focus();
    await expect(
      hereEntryOf(page).getByRole("slider", { name: sliderName }),
    ).toBeFocused();
  },
);

Then(
  "the next Tab moves the focus out of the Here entry",
  async ({ locationsWorld }) => {
    expect(tabStopCounts.get(locationsWorld.page)?.hasLeft).toBe(true);
  },
);

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
