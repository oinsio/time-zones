// Verifies FR1, FR2, FR3 of colour-locations-without-day-periods-in-accent.
// Verifies FR9, FR11, FR12, NFR-A3, NFR-R2 of add-day-colouring-setting.
// Verifies FR8, UX4, NFR-A1 of bind-day-periods-to-sun.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  cellOf,
  cellsOf,
  frameColumnOf,
  frameOf,
  requireBox,
  rowsOf,
} from "../../grid_view/steps/hourGridE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { getContrastRatio } from "./colourContrast";
import { dayTrackBarOf } from "./dayColouringE2eHelpers";

const { Given, Then } = createBdd(test);

const EDGE_TOLERANCE_PX = 2;
const ROW_INSET_TOLERANCE_PX = 8;
const NON_WORKING_GREY = "non-working grey";
const MIN_DIGIT_CONTRAST = 4.5;

const colourOf = (theme: Theme, colourName: string) => {
  const colours = readThemeColours(theme);
  return colourName === NON_WORKING_GREY
    ? colours.dayNonWorking
    : colours.accent;
};

const visibleCellsOf = async (page: Page, city: string) => {
  const cells = cellsOf(page, city);
  await expect(cells.first()).toBeVisible();
  const cellCount = await cells.count();
  expect(cellCount).toBeGreaterThan(0);
  return Array.from({ length: cellCount }, (_, column) => cells.nth(column));
};

const expectDigitContrast = async (cell: Locator) => {
  const [background, digits] = await cell.evaluate((element) => [
    getComputedStyle(element).backgroundColor,
    getComputedStyle(element).color,
  ]);
  expect(getContrastRatio(background, digits)).toBeGreaterThanOrEqual(
    MIN_DIGIT_CONTRAST,
  );
};

// Implements the default Cards view: no stored view mode.
Given("the view mode is Cards", () => undefined);

Then(
  /^the cell of "([^"]+)" in column (\d+) has the (light|dark) accent colour and the cell in column (\d+) the (?:light|dark) non-working grey$/,
  async (
    { locationsWorld },
    city: string,
    accentColumn: string,
    theme: Theme,
    greyColumn: string,
  ) => {
    const colours = readThemeColours(theme);
    await expect(
      cellOf(locationsWorld.page, city, Number(accentColumn)),
    ).toHaveCSS("background-color", colours.accent);
    await expect(
      cellOf(locationsWorld.page, city, Number(greyColumn)),
    ).toHaveCSS("background-color", colours.dayNonWorking);
  },
);

Then(
  /^the track of "([^"]+)" is a gradient with the (light|dark) (accent colour|non-working grey) at its left end and at its right end$/,
  async (
    { locationsWorld },
    city: string,
    theme: Theme,
    colourName: string,
  ) => {
    const backgroundImage = await dayTrackBarOf(
      locationsWorld.page,
      city,
    ).evaluate((element) => getComputedStyle(element).backgroundImage);
    const colour = colourOf(theme, colourName);
    expect(backgroundImage).toContain("linear-gradient");
    expect(backgroundImage).toContain(`${colour} 0%`);
    expect(backgroundImage).toContain(`${colour} 100%`);
  },
);

// Verifies FR2 of colour-locations-without-day-periods-in-accent
Then(
  /^every cell of "([^"]+)" is the (light|dark) (non-working grey|accent colour) with digits of a contrast of at least 4\.5:1$/,
  async (
    { locationsWorld },
    city: string,
    theme: Theme,
    colourName: string,
  ) => {
    const cells = await visibleCellsOf(locationsWorld.page, city);
    for (const cell of cells) {
      await expect(cell).toHaveCSS(
        "background-color",
        colourOf(theme, colourName),
      );
      await expectDigitContrast(cell);
    }
  },
);

// Verifies FR3 of colour-locations-without-day-periods-in-accent
Then(
  /^the digits of every cell of "([^"]+)" have a contrast of at least 4\.5:1$/,
  async ({ locationsWorld }, city: string) => {
    const cells = await visibleCellsOf(locationsWorld.page, city);
    for (const cell of cells) await expectDigitContrast(cell);
  },
);

Then(
  /^one hour frame in the (light|dark) foreground colour reaches from the first row to the last$/,
  async ({ locationsWorld }, theme: Theme) => {
    const { page } = locationsWorld;
    await expect(frameOf(page)).toHaveCount(1);
    await expect(frameOf(page)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).foreground,
    );
    const frameBox = await requireBox(frameOf(page));
    const firstBox = await requireBox(rowsOf(page).first());
    const lastBox = await requireBox(rowsOf(page).last());
    expect(Math.abs(frameBox.y - firstBox.y)).toBeLessThanOrEqual(
      ROW_INSET_TOLERANCE_PX,
    );
    expect(
      Math.abs(frameBox.y + frameBox.height - (lastBox.y + lastBox.height)),
    ).toBeLessThanOrEqual(ROW_INSET_TOLERANCE_PX);
  },
);

Then(
  "the frame encloses column {int} of every row",
  async ({ locationsWorld }, column: number) => {
    const { page } = locationsWorld;
    const frameBox = await requireBox(frameOf(page));
    for (const city of ["Almaty", "Moscow", "Kolkata", "New York"]) {
      const cellBox = await requireBox(cellOf(page, city, column));
      expect(frameBox.x).toBeLessThanOrEqual(cellBox.x + EDGE_TOLERANCE_PX);
      expect(frameBox.x + frameBox.width).toBeGreaterThanOrEqual(
        cellBox.x + cellBox.width - EDGE_TOLERANCE_PX,
      );
    }
  },
);

Then(
  /^the hour frame is on column (\d+) in the (light|dark) foreground colour$/,
  async ({ locationsWorld }, column: string, theme: Theme) => {
    expect(await frameColumnOf(locationsWorld.page)).toBe(Number(column));
    await expect(frameOf(locationsWorld.page)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).foreground,
    );
  },
);

Then(
  "the texts of column {int} are bold in the {string} row",
  async ({ locationsWorld }, column: number, city: string) => {
    await expect(
      cellOf(locationsWorld.page, city, column).locator("span").first(),
    ).toHaveCSS("font-weight", "700");
  },
);
