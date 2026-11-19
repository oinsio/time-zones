// Verifies FR14, UX1 of redesign-cards-grid-and-day-palettes: the redesigned date bar.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { getContrastRatio } from "../../day_colouring/steps/colourContrast";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import {
  barOf,
  dateButton,
  nowButton,
  requireBox,
} from "./dateSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const FOOTER_SELECTOR = "[data-date-bar]";
const HEX_RADIX = 16;
const MIN_LABEL_CONTRAST = 4.5;
const POSITION_TOLERANCE_PX = 1;
const NOW_HEIGHT_PX = 44;
const NOW_RADIUS_PX = 13;
const NOW_BORDER_PX = 1;
const NOW_ICON_PX = 18;
const NOW_LABEL_SIZE_PX = 16;
const BOLD_WEIGHT = "700";
const SEMIBOLD_WEIGHT = "600";
const TRANSPARENT_FILLS = ["rgba(0, 0, 0, 0)", "transparent"];

const hexToRgb = (hex: string): string =>
  `rgb(${[1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), HEX_RADIX))
    .join(", ")})`;

const recordedNowBoxes = new WeakMap<
  Page,
  Awaited<ReturnType<typeof requireBox>>
>();

Then(
  /^the bar has the (light|dark) page background and no top border$/,
  async ({ locationsWorld }, theme: Theme) => {
    const footer = locationsWorld.page.locator(FOOTER_SELECTOR);
    await expect(footer).toHaveCSS(
      "background-color",
      readThemeColours(theme).background,
    );
    await expect(footer).toHaveCSS("border-top-width", "0px");
  },
);

Then(
  "Now is an outlined button 44 px high with a 13 px radius, a 1 px border, no fill, an 18 px icon and a label of 16 px and weight 600",
  async ({ locationsWorld }) => {
    const now = nowButton(locationsWorld.page);
    expect((await requireBox(now)).height).toBe(NOW_HEIGHT_PX);
    await expect(now).toHaveCSS("border-top-left-radius", `${NOW_RADIUS_PX}px`);
    await expect(now).toHaveCSS("border-top-width", `${NOW_BORDER_PX}px`);
    const fill = await now.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(TRANSPARENT_FILLS).toContain(fill);
    const icon = await requireBox(now.locator("svg"));
    expect([icon.width, icon.height]).toEqual([NOW_ICON_PX, NOW_ICON_PX]);
    await expect(now).toHaveCSS("font-size", `${NOW_LABEL_SIZE_PX}px`);
    await expect(now).toHaveCSS("font-weight", SEMIBOLD_WEIGHT);
  },
);

Then(
  "the inactive Now has the border {string} and the label {string} with a contrast of at least 4.5:1 against the page background",
  async ({ locationsWorld }, borderHex: string, labelHex: string) => {
    const now = nowButton(locationsWorld.page);
    await expect(now).toHaveCSS("border-top-color", hexToRgb(borderHex));
    await expect(now).toHaveCSS("color", hexToRgb(labelHex));
    const pageBackground = await locationsWorld.page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(
      getContrastRatio(pageBackground, hexToRgb(labelHex)),
    ).toBeGreaterThanOrEqual(MIN_LABEL_CONTRAST);
  },
);

When("the box of Now is recorded", async ({ locationsWorld }) => {
  recordedNowBoxes.set(
    locationsWorld.page,
    await requireBox(nowButton(locationsWorld.page)),
  );
});

Then(
  "the box of Now is the recorded box within 1 px",
  async ({ locationsWorld }) => {
    const recorded = recordedNowBoxes.get(locationsWorld.page);
    const current = await requireBox(nowButton(locationsWorld.page));
    for (const side of ["x", "y", "width", "height"] as const) {
      expect(
        Math.abs(current[side] - (recorded?.[side] ?? Number.NaN)),
      ).toBeLessThanOrEqual(POSITION_TOLERANCE_PX);
    }
  },
);

Then("the shown date is 16 px with weight 700", async ({ locationsWorld }) => {
  const label: Locator = barOf(locationsWorld.page).locator(
    "[data-date-label]:visible",
  );
  await expect(label).toHaveCSS("font-size", "16px");
  await expect(label).toHaveCSS("font-weight", BOLD_WEIGHT);
  await expect(dateButton(locationsWorld.page)).toBeVisible();
});
