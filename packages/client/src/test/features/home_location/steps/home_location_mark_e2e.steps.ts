import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { LOCATION_MARK_ICON_SIZE_PX } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { readTokenStyle } from "../../time_selection/steps/timeSelectionE2eHelpers";

const { Then } = createBdd(test);

const ACCENT_TOKEN = "--color-accent";
const NO_FILL = "none";

const houseGlyph = (page: Page, cityName: string) =>
  listRow(page, cityName)
    .getByRole("img", { name: englishLocale.locations.homeMarkLabel })
    .locator("svg");

// Verifies FR1, FR3, UX1, UX2 of match-home-mark-to-design
Then(
  /^the house of "([^"]+)" has no fill and an outline in the accent colour$/,
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    const glyph = houseGlyph(page, cityName);
    await expect(glyph).toHaveCSS("fill", NO_FILL);
    await expect(glyph).toHaveCSS(
      "stroke",
      await readTokenStyle(page, "stroke", ACCENT_TOKEN),
    );
  },
);

// Verifies FR1, FR3, UX1, UX2 of match-home-mark-to-design
Then(
  /^the house of "([^"]+)" is (\d+) px wide and tall$/,
  async ({ locationsWorld }, cityName: string, sizePx: string) => {
    const box = await houseGlyph(locationsWorld.page, cityName).boundingBox();
    expect(Number(sizePx)).toBe(LOCATION_MARK_ICON_SIZE_PX);
    expect(box?.width).toBe(LOCATION_MARK_ICON_SIZE_PX);
    expect(box?.height).toBe(LOCATION_MARK_ICON_SIZE_PX);
  },
);
