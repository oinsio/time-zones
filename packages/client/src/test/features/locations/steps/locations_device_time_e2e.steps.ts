import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  DEVICE_TIME_NAME_PATTERN,
  deviceTimeRowOf,
  deviceTimeTimeOf,
  measureDeviceTime,
  measureLocationCard,
} from "./deviceTimeE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import {
  listRow,
  menuButton,
  removeThroughMenu,
  SCREEN_HEIGHT_PX,
} from "./locationsE2eHelpers";

const { When, Then } = createBdd(test);

const MOSCOW = "Moscow";
const MOSCOW_IN_RUSSIAN = "Москва";
const LIST_ITEM_ROLE = "listitem";
const OPTION_ROLE = "option";
const DEVICE_CITY = "Almaty";
const SECOND_ROW_INDEX = 1;
/** The card layout switches at the md breakpoint. */
const WIDE_LAYOUT_MIN_WIDTH_PX = 768;

type LayoutRecord = {
  scrollWidth: number;
  clientWidth: number;
  deviceTime: Awaited<ReturnType<typeof measureDeviceTime>>;
  locationCard: Awaited<ReturnType<typeof measureLocationCard>>;
};
type HeightRecord = { deviceTimeHeight: number; locationCardY: number };

const layoutRecords = new WeakMap<Page, LayoutRecord[]>();
const heightRecords = new WeakMap<Page, HeightRecord>();

// Verifies NFR-A2 of add-settings-page-and-device-time-location: the row is a list item with a name.
Then(
  "the first list item is named {string}",
  async ({ locationsWorld }, accessibleName: string) => {
    await expect(
      locationsWorld.page.getByRole(LIST_ITEM_ROLE).first(),
    ).toHaveAccessibleName(accessibleName);
  },
);

Then(
  "the location list has {int} items",
  async ({ locationsWorld }, itemCount: number) => {
    await expect(locationsWorld.page.getByRole(LIST_ITEM_ROLE)).toHaveCount(
      itemCount,
    );
  },
);

Then(
  "the location menu button of the device time location is named {string}",
  async ({ locationsWorld }, buttonName: string) => {
    await expect(
      deviceTimeRowOf(locationsWorld.page).getByRole("button", {
        name: buttonName,
      }),
    ).toBeVisible();
  },
);

Then("the device time location is shown", async ({ locationsWorld }) => {
  await expect(deviceTimeRowOf(locationsWorld.page)).toBeVisible();
});

// Verifies NFR-R1, UX3 of add-settings-page-and-device-time-location.
When(
  "the viewport is {int} px and then {int} px wide",
  async ({ locationsWorld }, firstWidth: number, secondWidth: number) => {
    const { page } = locationsWorld;
    const records: LayoutRecord[] = [];
    for (const width of [firstWidth, secondWidth]) {
      await page.setViewportSize({ width, height: SCREEN_HEIGHT_PX });
      await expect(deviceTimeRowOf(page)).toBeVisible();
      const widths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      records.push({
        ...widths,
        deviceTime: await measureDeviceTime(page),
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
  "the device time location's layout matches the Moscow card's layout",
  async ({ locationsWorld }) => {
    const records = layoutRecords.get(locationsWorld.page) ?? [];
    expect(records).toHaveLength(2);
    for (const { clientWidth, deviceTime, locationCard } of records) {
      expect(deviceTime.card).toEqual(locationCard.card);
      expect(deviceTime.track.x).toBe(locationCard.track.x);
      expect(deviceTime.track.width).toBe(locationCard.track.width);
      if (clientWidth >= WIDE_LAYOUT_MIN_WIDTH_PX) {
        expect(deviceTime.time.x).toBe(locationCard.time.x);
      }
    }
  },
);

// Verifies UX3, NFR-P2 of add-settings-page-and-device-time-location: the exemplar city keeps the height.
Then(
  "the device time location shows the city {string}",
  async ({ locationsWorld }, city: string) => {
    await expect(
      deviceTimeRowOf(locationsWorld.page).getByText(city, { exact: true }),
    ).toBeVisible();
  },
);

When("the zone cities data finishes loading", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  heightRecords.set(page, {
    deviceTimeHeight: (await requireBox(deviceTimeRowOf(page))).height,
    locationCardY: (await requireBox(listRow(page, MOSCOW_IN_RUSSIAN))).y,
  });
  await locationsWorld.releaseHeldRequests();
});

Then(
  "the device time location's height is the same as before the load",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    expect((await requireBox(deviceTimeRowOf(page))).height).toBe(
      heightRecords.get(page)?.deviceTimeHeight,
    );
  },
);

Then("the Moscow card has not moved", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  expect((await requireBox(listRow(page, MOSCOW_IN_RUSSIAN))).y).toBe(
    heightRecords.get(page)?.locationCardY,
  );
});

// Verifies FR13 of add-settings-page-and-device-time-location: an emptied list stays empty.
When("the user reloads the app", async ({ locationsWorld }) => {
  await locationsWorld.page.reload();
});

Then("the empty-state explanation is shown", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByText(englishLocale.views.cardsEmptyState),
  ).toBeVisible();
});

// Verifies FR11, FR12 of add-settings-page-and-device-time-location: the search option.
When(
  "the user chooses the {string} option",
  async ({ locationsWorld }, optionName: string) => {
    await locationsWorld.page
      .getByRole(OPTION_ROLE, { name: optionName })
      .click();
  },
);

// Verifies FR17 of add-settings-page-and-device-time-location: the view contract.
Then(
  "the second row is the device time location showing {string}",
  async ({ locationsWorld }, time: string) => {
    const { page } = locationsWorld;
    await expect(deviceTimeTimeOf(page)).toHaveText(time);
    await expect(
      page.getByRole(LIST_ITEM_ROLE).nth(SECOND_ROW_INDEX),
    ).toHaveAccessibleName(DEVICE_TIME_NAME_PATTERN);
  },
);

When(
  "the user makes the device time location home and then removes it",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByRole(LIST_ITEM_ROLE).first()).toHaveAccessibleName(
      DEVICE_TIME_NAME_PATTERN,
    );
    await menuButton(page, DEVICE_CITY).click();
    await page
      .getByRole("menuitem", { name: englishLocale.locations.makeHome })
      .click();
    await expect(
      page.getByRole("img", { name: englishLocale.locations.homeMarkLabel }),
    ).toBeVisible();
    await removeThroughMenu(page, DEVICE_CITY);
  },
);

Then("no location is home", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByRole("img", {
      name: englishLocale.locations.homeMarkLabel,
    }),
  ).toHaveCount(0);
});

// Verifies FR11 of add-settings-page-and-device-time-location: the polite region of the search.
Then(
  "the polite announcement says {string}",
  async ({ locationsWorld }, announcement: string) => {
    await expect(
      locationsWorld.page.locator('[aria-live="polite"]', {
        hasText: announcement,
      }),
    ).toHaveCount(1);
  },
);
