import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  readMidnightShade,
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { cellOf, cellsOf, requireBox } from "./hourGridE2eHelpers";

const { Then } = createBdd(test);

const CITIES_OF_COLUMNS = ["Almaty", "Moscow", "Kolkata", "New York"];
const OFFSET_EDGE_WIDTH_PX = 3;
const NIGHT_COLUMN = 3;
const MORNING_COLUMN = 7;
const WORKING_COLUMN = 9;
const EVENING_COLUMN = 18;
const MIDNIGHT_COLUMN_OF_MOSCOW = 2;
const OFFSET_EDGE_COLUMN_OF_NEW_YORK = 12;
const POSITION_TOLERANCE_PX = 0.5;

// Verifies FR1, UX2 of add-grid-hour-cells-and-hour-frame.
Then(
  "the cells of column {int} of all rows have the same left edge and the same width",
  async ({ locationsWorld }, column: number) => {
    const boxes = [];
    for (const city of CITIES_OF_COLUMNS) {
      boxes.push(await requireBox(cellOf(locationsWorld.page, city, column)));
    }
    for (const box of boxes) {
      expect(box.x).toBeCloseTo(boxes[0].x, 1);
      expect(Math.abs(box.width - boxes[0].width)).toBeLessThan(
        POSITION_TOLERANCE_PX,
      );
    }
  },
);

// Verifies FR4, UX1 of add-grid-hour-cells-and-hour-frame: the day-period colours of the theme.
Then(
  /^the cells of "([^"]+)" in columns 3, 7, 9 and 18 have the (light|dark) night, morning, working hours and evening colours$/,
  async ({ locationsWorld }, city: string, theme: Theme) => {
    const colours = readThemeColours(theme);
    const expectedByColumn = [
      [NIGHT_COLUMN, colours.dayNight],
      [MORNING_COLUMN, colours.dayMorning],
      [WORKING_COLUMN, colours.dayWorking],
      [EVENING_COLUMN, colours.dayEvening],
    ] as const;
    for (const [column, colour] of expectedByColumn) {
      await expect(cellOf(locationsWorld.page, city, column)).toHaveCSS(
        "background-color",
        colour,
      );
    }
  },
);

// Verifies FR5, UX1 of add-grid-hour-cells-and-hour-frame.
Then(
  /^the midnight cell of "([^"]+)" in column 2 has the (light|dark) midnight shade$/,
  async ({ locationsWorld }, city: string, theme: Theme) => {
    expect(MIDNIGHT_COLUMN_OF_MOSCOW).toBe(2);
    await expect(
      cellOf(locationsWorld.page, city, MIDNIGHT_COLUMN_OF_MOSCOW),
    ).toHaveCSS(
      "box-shadow",
      new RegExp(readMidnightShade(theme).replace(/[().]/g, "\\$&")),
    );
  },
);

// Verifies FR6, UX1 of add-grid-hour-cells-and-hour-frame.
Then(
  /^the offset edge of "([^"]+)" in column 12 is a line in the (light|dark) foreground colour$/,
  async ({ locationsWorld }, city: string, theme: Theme) => {
    const { foreground } = readThemeColours(theme);
    await expect(
      cellOf(locationsWorld.page, city, OFFSET_EDGE_COLUMN_OF_NEW_YORK),
    ).toHaveCSS(
      "box-shadow",
      new RegExp(
        `${foreground.replace(/[().]/g, "\\$&")} ${OFFSET_EDGE_WIDTH_PX}px 0px 0px 0px inset`,
      ),
    );
    await expect(
      cellsOf(locationsWorld.page, city).nth(
        OFFSET_EDGE_COLUMN_OF_NEW_YORK + 1,
      ),
    ).toHaveCSS("box-shadow", "none");
  },
);

// Verifies FR4 of add-grid-hour-cells-and-hour-frame: digits on working hours cells.
Then(
  /^the digits of the working hours cell of "([^"]+)" in column 9 have the (light|dark) cell digit colour$/,
  async ({ locationsWorld }, city: string, theme: Theme) => {
    await expect(cellOf(locationsWorld.page, city, WORKING_COLUMN)).toHaveCSS(
      "color",
      readThemeColours(theme).hourCellForeground,
    );
  },
);
