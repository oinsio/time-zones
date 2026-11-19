// Verifies FR7, FR8, FR10, FR11, NFR-R1, UX1 of redesign-cards-grid-and-day-palettes: the card layout.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
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

const ZONE_LINE_SELECTOR = "[data-zone-line]";
const DAY_PERIOD_MARKER_SELECTOR = ".text-card-marker";
const TIME_BUTTON_NAME = /^Enter time|^Ввести время/;
const CARD_RADIUS_PX = 14;
const CARD_BORDER_WIDTH_PX = 1;
const CARD_GAP_PX = 12;
const MARK_SIZE_PX = 23;
const MARKER_SIZE_PX = 14;
const MARKER_GAP_PX = 4;
const LAYOUT_TOLERANCE_PX = 1;
const SAME_LINE_TOLERANCE_PX = 4;
const BOLD_WEIGHT = "700";
const DIFFERENCE_WEIGHT = "600";
const DIFFERENCE_SIZE_PX = 16;
const CARD_PADDING_CLASS_TOLERANCE_PX = 24;

const cityOf = (page: Page, city: string) =>
  listRow(page, city).getByText(city, { exact: true }).first();
const timeOf = (page: Page, city: string) =>
  listRow(page, city).getByRole("button", { name: TIME_BUTTON_NAME });
const dateOf = (page: Page, city: string) =>
  listRow(page, city).locator("time").first();
const zoneLineOf = (page: Page, city: string) =>
  listRow(page, city).locator(ZONE_LINE_SELECTOR).first();

const centreY = async (locator: Locator) => {
  const box = await requireBox(locator);
  return box.y + box.height / 2;
};
const onOneLine = async (locators: Locator[]) => {
  const centres = await Promise.all(locators.map(centreY));
  expect(Math.max(...centres) - Math.min(...centres)).toBeLessThanOrEqual(
    SAME_LINE_TOLERANCE_PX * 2,
  );
};

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

Then(
  "the city {string} is shown whole without an ellipsis",
  async ({ locationsWorld }, city: string) => {
    const element = cityOf(locationsWorld.page, city);
    await expect(element).toBeVisible();
    const { scrollWidth, clientWidth, textOverflow } = await element.evaluate(
      (node) => ({
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        textOverflow: getComputedStyle(node).textOverflow,
      }),
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    expect(textOverflow).not.toBe("ellipsis");
  },
);

Then(
  "the time and the menu button are on a line of their own at the right edge of the card",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const row = page.getByRole("listitem").first();
    const timeBox = await requireBox(
      row.getByRole("button", { name: TIME_BUTTON_NAME }),
    );
    const cityBox = await requireBox(
      row.locator("span", { hasText: /^Петропавловск/ }).last(),
    );
    expect(timeBox.y).toBeGreaterThanOrEqual(cityBox.y + cityBox.height - 1);
    const cardBox = await requireBox(row);
    const buttonBox = await requireBox(
      row.getByRole("button", { name: /^Actions for|^Действия/ }),
    );
    expect(
      cardBox.x + cardBox.width - (buttonBox.x + buttonBox.width),
    ).toBeLessThanOrEqual(CARD_PADDING_CLASS_TOLERANCE_PX);
  },
);

Then(
  "the time of {string} reads {string} with a marker of 14 px and weight 700, 4 px after the digits",
  async ({ locationsWorld }, city: string, timeText: string) => {
    const { page } = locationsWorld;
    await expect(timeOf(page, city)).toHaveText(timeText.replace(" ", ""));
    const marker = timeOf(page, city).locator(DAY_PERIOD_MARKER_SELECTOR);
    await expect(marker).toHaveCSS("font-size", `${MARKER_SIZE_PX}px`);
    await expect(marker).toHaveCSS("font-weight", BOLD_WEIGHT);
    await expect(marker).toHaveCSS("margin-left", `${MARKER_GAP_PX}px`);
  },
);

Then(
  "the difference of {string} is 16 px, weight 600, in the muted foreground colour",
  async ({ locationsWorld }, city: string) => {
    const difference = listRow(locationsWorld.page, city)
      .locator("[data-offset-difference]:not(.sr-only)")
      .first();
    await expect(difference).toHaveCSS("font-size", `${DIFFERENCE_SIZE_PX}px`);
    await expect(difference).toHaveCSS("font-weight", DIFFERENCE_WEIGHT);
    await expect(difference).toHaveCSS(
      "color",
      readThemeColours("light").mutedForeground,
    );
  },
);

Then(
  /^the cards show ((?:"[^"]+"(?:, | and )?)+)$/,
  async ({ locationsWorld }, quotedTimes: string) => {
    const texts = parseCityNames(quotedTimes).map((text) =>
      text.replace(" ", ""),
    );
    for (const text of texts) {
      await expect(
        locationsWorld.page
          .getByRole("button", { name: TIME_BUTTON_NAME })
          .filter({ hasText: text.replace(/(AM|PM)$/, "") })
          .first(),
      ).toBeVisible();
    }
  },
);

Then(
  "the right edges of the four menu buttons line up",
  async ({ locationsWorld }) => {
    const buttons = await locationsWorld.page
      .getByRole("button", { name: /^Actions for/ })
      .all();
    expect(buttons).toHaveLength(4);
    const rights: number[] = [];
    for (const button of buttons) {
      const box = await requireBox(button);
      rights.push(box.x + box.width);
    }
    expect(Math.max(...rights) - Math.min(...rights)).toBeLessThanOrEqual(
      LAYOUT_TOLERANCE_PX,
    );
  },
);

Then(
  /^the house of "([^"]+)" has no fill, the (light|dark) accent outline and is 23 by 23 px$/,
  async ({ locationsWorld }, city: string, theme: Theme) => {
    const mark = listRow(locationsWorld.page, city).getByRole("img", {
      name: englishLocale.locations.homeMarkLabel,
    });
    const glyph = mark.locator("svg").first();
    await expect(glyph).toHaveCSS("fill", "none");
    await expect(glyph).toHaveCSS("stroke", readThemeColours(theme).accent);
    const box = await requireBox(glyph);
    expect([box.width, box.height]).toEqual([MARK_SIZE_PX, MARK_SIZE_PX]);
  },
);

Then(
  'the map pin of "Almaty" is 23 by 23 px, before its city and no row shows the text "here"',
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const mark = listRow(page, "Almaty").getByRole("img", {
      name: englishLocale.locations.hereMarkLabel,
    });
    const box = await requireBox(mark.locator("svg").first());
    expect([box.width, box.height]).toEqual([MARK_SIZE_PX, MARK_SIZE_PX]);
    expect(box.x).toBeLessThan((await requireBox(cityOf(page, "Almaty"))).x);
    await expect(page.getByText(/^here$/i)).toHaveCount(0);
  },
);
