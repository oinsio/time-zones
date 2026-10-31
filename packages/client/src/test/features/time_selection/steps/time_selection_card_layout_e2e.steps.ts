import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  boxesOfCard,
  expectHourLabelsOnOneLine,
  measureTimeButton,
  parseCities,
  TIME_COLUMN_XPATH,
  TOLERANCE_PX,
  TRACK_SELECTOR,
} from "./cardLayoutE2eHelpers";
import {
  type Box,
  requireBox,
  visibleHandleOf,
} from "./timeSelectionE2eHelpers";
import {
  GAP_HINT_PATTERN,
  HINT_CITY,
  typeWallTime,
  wallTimeButtonOf,
  wallTimeHintOf,
} from "./wallTimeE2eHelpers";

const { Given, When, Then } = createBdd(test);

const GAP_TYPED_TEXT_12_HOUR = "2:30 AM";
const noteBoxes = new WeakMap<object, Record<string, Box>>();

// Verifies FR1, UX1 of fix-location-card-and-header-layout: the line is the same before and after the hint.
Given(
  "the place, time, track and menu of {string} are noted",
  async ({ locationsWorld }, city: string) => {
    noteBoxes.set(locationsWorld, await boxesOfCard(locationsWorld.page, city));
  },
);

// Verifies FR1, NFR-A2 of fix-location-card-and-header-layout: the hint is a status below everything else.
Then(
  "the hint is the bottom line of the card of {string}",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const card = await requireBox(listRow(page, city));
    const hint = await requireBox(wallTimeHintOf(page));
    const { track, menu } = await boxesOfCard(page, city);
    await expect(wallTimeHintOf(page)).toHaveAttribute("role", "status");
    expect(hint.y).toBeGreaterThanOrEqual(
      Math.max(track.y + track.height, menu.y + menu.height) - TOLERANCE_PX,
    );
    expect(hint.y + hint.height).toBeLessThanOrEqual(
      card.y + card.height + TOLERANCE_PX,
    );
    expect(hint.x).toBeGreaterThanOrEqual(card.x - TOLERANCE_PX);
    expect(hint.x + hint.width).toBeLessThanOrEqual(
      card.x + card.width + TOLERANCE_PX,
    );
  },
);

// Verifies FR1, UX1 of fix-location-card-and-header-layout: the hint moves no other element.
Then(
  "the place, time, track and menu of {string} have not moved",
  async ({ locationsWorld }, city: string) => {
    const before = noteBoxes.get(locationsWorld) ?? {};
    const after = await boxesOfCard(locationsWorld.page, city);
    for (const [part, box] of Object.entries(after)) {
      for (const key of ["x", "y", "width", "height"] as const) {
        expect(
          Math.abs(box[key] - (before[part]?.[key] ?? Number.NaN)),
        ).toBeLessThanOrEqual(TOLERANCE_PX);
      }
    }
  },
);

// Verifies FR2, UX4 of fix-location-card-and-header-layout: the handle takes the fill of its card.
Then(
  "the visible handle of {string} is filled with the fill of its card",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const cardFill = await listRow(page, city).evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await expect(visibleHandleOf(page, city)).toHaveCSS(
      "background-color",
      cardFill,
    );
  },
);

// Verifies FR2, UX4 of fix-location-card-and-header-layout: in dark the fill is not the page's.
Then(
  "the visible handle of {string} is not filled with the page background colour",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const pageFill = await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect(visibleHandleOf(page, city)).not.toHaveCSS(
      "background-color",
      pageFill,
    );
  },
);

// Verifies FR5, UX3 of fix-location-card-and-header-layout: the 12-hour times of the cards.
Then(
  "the time buttons show:",
  async (
    { locationsWorld },
    table: { hashes: () => Record<string, string>[] },
  ) => {
    for (const { city, time } of table.hashes()) {
      const text = await wallTimeButtonOf(
        locationsWorld.page,
        city,
      ).innerText();
      expect(text.replace(/ /g, " ")).toBe(time);
    }
  },
);

// Verifies FR5, UX3 of fix-location-card-and-header-layout: equal track lengths.
Then("the tracks of the cards are equally long", async ({ locationsWorld }) => {
  const bars = await locationsWorld.page.locator(TRACK_SELECTOR).all();
  const widths = await Promise.all(
    bars.map(async (bar) => (await requireBox(bar)).width),
  );
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(
    TOLERANCE_PX,
  );
});

// Verifies FR5, UX3 of fix-location-card-and-header-layout: equal time columns.
Then(
  "the time columns of the cards are equally wide",
  async ({ locationsWorld }) => {
    const buttons = await locationsWorld.page
      .getByRole("button", { name: /^Enter time/ })
      .all();
    const widths = await Promise.all(
      buttons.map(
        async (button) =>
          (await requireBox(button.locator(TIME_COLUMN_XPATH))).width,
      ),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(
      TOLERANCE_PX,
    );
  },
);

// Verifies FR6, UX3 of fix-location-card-and-header-layout: hour labels never wrap.
Then(
  /^the hour labels of (.+) are on one line and end at the track's right edge$/,
  async ({ locationsWorld }, quotedNames: string) => {
    const { page } = locationsWorld;
    for (const city of parseCities(quotedNames)) {
      await expectHourLabelsOnOneLine(page, city);
    }
  },
);

// Verifies FR5, UX3 of fix-location-card-and-header-layout: a time is on one line and not clipped.
Then(
  /^the time buttons of (.+) show their time on one line in full$/,
  async ({ locationsWorld }, quotedNames: string) => {
    for (const city of parseCities(quotedNames)) {
      const shape = await measureTimeButton(locationsWorld.page, city);
      expect(shape.lineSpread).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(shape.isClipped).toBe(false);
    }
  },
);

// Verifies NFR-R1, NFR-A1 of fix-location-card-and-header-layout: a hint typed in the 12-hour format.
When(
  "the user types a time in the GAP and gets its hint in the 12-hour format",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await typeWallTime(page, HINT_CITY, GAP_TYPED_TEXT_12_HOUR);
    await expect(
      page.getByRole("status").filter({ hasText: GAP_HINT_PATTERN }),
    ).toBeVisible();
  },
);
