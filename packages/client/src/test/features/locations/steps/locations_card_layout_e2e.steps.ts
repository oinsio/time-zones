// Verifies FR7, FR8, FR10, FR11, NFR-R1, UX1 of redesign-cards-grid-and-day-palettes: the card layout.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import {
  barOf,
  requireBox,
} from "../../time_selection/steps/timeSelectionE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import {
  buildStoredLocations,
  listRow,
  menuButton,
  parseCityNames,
} from "./locationsE2eHelpers";

const { Given, Then } = createBdd(test);

import {
  CARD_BORDER_WIDTH_PX,
  CARD_GAP_PX,
  CARD_PADDING_CLASS_TOLERANCE_PX,
  CARD_RADIUS_PX,
  cityOf,
  dateOf,
  LAYOUT_TOLERANCE_PX,
  onOneLine,
  timeOf,
  zoneLineOf,
} from "./locationsCardLayoutHelpers";

Given(
  /^the stored locations ((?:"[^"]+"(?:, )?)+) have home "([^"]+)"$/,
  async ({ locationsWorld }, quotedNames: string, homeName: string) => {
    const [homeLocation] = buildStoredLocations([homeName]);
    await locationsWorld.seedList(
      buildStoredLocations(parseCityNames(quotedNames)),
      homeLocation,
    );
    await locationsWorld.reloadIfOpen();
  },
);

Then(
  "each card has a 14 px radius and a 1 px border in the card border colour",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const cards = page.getByRole("listitem");
    await expect(cards.first()).toBeVisible();
    expect(CARD_RADIUS_PX + CARD_BORDER_WIDTH_PX).toBe(15);
    for (const card of await cards.all()) {
      await expect(card).toHaveCSS("border-top-left-radius", "14px");
      await expect(card).toHaveCSS("border-top-width", "1px");
      await expect(card).toHaveCSS(
        "border-top-color",
        readThemeColours("light").cardBorder,
      );
    }
  },
);

Then(
  "the city is {int} px, the time {int} px and the zone line and the date {int} px",
  async (
    { locationsWorld },
    citySize: number,
    timeSize: number,
    metaSize: number,
  ) => {
    const { page } = locationsWorld;
    await expect(cityOf(page, "Moscow")).toHaveCSS(
      "font-size",
      `${citySize}px`,
    );
    await expect(timeOf(page, "Moscow")).toHaveCSS(
      "font-size",
      `${timeSize}px`,
    );
    await expect(zoneLineOf(page, "Moscow")).toHaveCSS(
      "font-size",
      `${metaSize}px`,
    );
    await expect(dateOf(page, "Moscow")).toHaveCSS(
      "font-size",
      `${metaSize}px`,
    );
  },
);

Then("neighbouring cards are 12 px apart", async ({ locationsWorld }) => {
  const cards = await locationsWorld.page.getByRole("listitem").all();
  for (let index = 1; index < cards.length; index += 1) {
    const upper = await requireBox(cards[index - 1]);
    const lower = await requireBox(cards[index]);
    expect(
      Math.abs(lower.y - (upper.y + upper.height) - CARD_GAP_PX),
    ).toBeLessThanOrEqual(LAYOUT_TOLERANCE_PX);
  }
});

Then(
  "the city, time and menu button of {string} are on one line, the button right of the time",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await onOneLine([
      cityOf(page, city),
      timeOf(page, city),
      menuButton(page, city),
    ]);
    const timeBox = await requireBox(timeOf(page, city));
    const buttonBox = await requireBox(menuButton(page, city));
    expect(buttonBox.x).toBeGreaterThanOrEqual(timeBox.x + timeBox.width - 1);
  },
);

Then(
  "the zone line and the date of {string} are on the next line, the date at the right edge",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await onOneLine([zoneLineOf(page, city), dateOf(page, city)]);
    const cityBox = await requireBox(cityOf(page, city));
    const zoneBox = await requireBox(zoneLineOf(page, city));
    expect(zoneBox.y).toBeGreaterThanOrEqual(cityBox.y + cityBox.height - 1);
    const dateBox = await requireBox(dateOf(page, city));
    const cardBox = await requireBox(listRow(page, city));
    expect(
      cardBox.x + cardBox.width - (dateBox.x + dateBox.width),
    ).toBeLessThanOrEqual(CARD_PADDING_CLASS_TOLERANCE_PX);
  },
);

Then(
  "the day track of {string} is under that line",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const trackBox = await requireBox(barOf(page, city));
    const zoneBox = await requireBox(zoneLineOf(page, city));
    expect(trackBox.y).toBeGreaterThanOrEqual(zoneBox.y + zoneBox.height - 1);
  },
);

Then(
  "the city, zone line, date, time and menu button of {string} are on one line",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await onOneLine([
      cityOf(page, city),
      zoneLineOf(page, city),
      dateOf(page, city),
      timeOf(page, city),
      menuButton(page, city),
    ]);
  },
);

Then(
  "the day track of {string} is under that line and spans the content width of the card",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const trackBox = await requireBox(barOf(page, city));
    const timeBox = await requireBox(timeOf(page, city));
    expect(trackBox.y).toBeGreaterThanOrEqual(timeBox.y + timeBox.height - 1);
    const cityBox = await requireBox(cityOf(page, city));
    const buttonBox = await requireBox(menuButton(page, city));
    expect(Math.abs(trackBox.x - cityBox.x)).toBeLessThanOrEqual(
      CARD_PADDING_CLASS_TOLERANCE_PX,
    );
    expect(
      Math.abs(trackBox.x + trackBox.width - (buttonBox.x + buttonBox.width)),
    ).toBeLessThanOrEqual(CARD_PADDING_CLASS_TOLERANCE_PX);
  },
);
