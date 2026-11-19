// Verifies FR7, FR8, FR10, FR11, NFR-R1, UX1 of redesign-cards-grid-and-day-palettes: the card layout.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { listRow, parseCityNames } from "./locationsE2eHelpers";

const { Then } = createBdd(test);

import {
  BOLD_WEIGHT,
  CARD_PADDING_CLASS_TOLERANCE_PX,
  cityOf,
  DAY_PERIOD_MARKER_SELECTOR,
  DIFFERENCE_SIZE_PX,
  DIFFERENCE_WEIGHT,
  LAYOUT_TOLERANCE_PX,
  MARK_SIZE_PX,
  MARKER_GAP_PX,
  MARKER_SIZE_PX,
  TIME_BUTTON_NAME,
  timeOf,
} from "./locationsCardLayoutHelpers";

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
