import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow, menuButton } from "../../locations/steps/locationsE2eHelpers";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  cellOf,
  frameColumnOf,
  frameOf,
  isTopmostAt,
  noteOf,
  requireBox,
  rowsOf,
} from "./hourGridE2eHelpers";

const { When, Then } = createBdd(test);

const ENCLOSING_COLUMN = 12;
const EDGE_TOLERANCE_PX = 2;
const ROW_INSET_TOLERANCE_PX = 8;
const HALF = 2;
const BORDER_INSET_PX = 1;
const ENABLE_POINTER_HIT_TEST = (element: HTMLElement) => {
  element.style.pointerEvents = "auto";
};

// Verifies FR8, UX2 of add-grid-hour-cells-and-hour-frame.
Then(
  /^one hour frame in the (light|dark) accent colour reaches from the first row to the last$/,
  async ({ locationsWorld }, theme: Theme) => {
    const { page } = locationsWorld;
    await expect(frameOf(page)).toHaveCount(1);
    await expect(frameOf(page)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).accent,
    );
    const frameBox = await requireBox(frameOf(page));
    const rows = rowsOf(page);
    const firstBox = await requireBox(rows.first());
    const lastBox = await requireBox(rows.last());
    expect(Math.abs(frameBox.y - firstBox.y)).toBeLessThanOrEqual(
      ROW_INSET_TOLERANCE_PX,
    );
    expect(
      Math.abs(frameBox.y + frameBox.height - (lastBox.y + lastBox.height)),
    ).toBeLessThanOrEqual(ROW_INSET_TOLERANCE_PX);
  },
);

Then(
  "its left and right edges enclose column 12 of every row",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const frameBox = await requireBox(frameOf(page));
    const cities = await rowsOf(page).count();
    expect(cities).toBeGreaterThan(0);
    for (const city of ["Almaty", "Moscow", "Kolkata", "New York"]) {
      const cellBox = await requireBox(cellOf(page, city, ENCLOSING_COLUMN));
      expect(frameBox.x).toBeLessThanOrEqual(cellBox.x + EDGE_TOLERANCE_PX);
      expect(frameBox.x + frameBox.width).toBeGreaterThanOrEqual(
        cellBox.x + cellBox.width - EDGE_TOLERANCE_PX,
      );
    }
  },
);

// Verifies FR10 of add-grid-hour-cells-and-hour-frame: the frame takes pointer events here so that the hit test sees it.
Then(
  "where the hour frame crosses the clock change note of {string}, the topmost element is the note",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const note = noteOf(page, city);
    await frameOf(page).evaluate(ENABLE_POINTER_HIT_TEST);
    const frameBox = await requireBox(frameOf(page));
    const noteBox = await requireBox(note);
    const noteMiddleY = noteBox.y + noteBox.height / HALF;
    for (const borderX of [
      frameBox.x + BORDER_INSET_PX,
      frameBox.x + frameBox.width - BORDER_INSET_PX,
    ]) {
      expect(borderX).toBeGreaterThan(noteBox.x);
      expect(borderX).toBeLessThan(noteBox.x + noteBox.width);
      expect(await isTopmostAt(note, { x: borderX, y: noteMiddleY })).toBe(
        true,
      );
    }
  },
);

Then(
  "where the frame's border crosses a header text of {string}, the topmost element is that text",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const row = listRow(page, city);
    await frameOf(page).evaluate(ENABLE_POINTER_HIT_TEST);
    const frameBox = await requireBox(frameOf(page));
    const headerTexts = [
      row.getByText(city, { exact: true }),
      row.locator("[data-zone-line]"),
      row.locator("time"),
      row.getByRole("button", { name: /^Enter time/ }),
    ];
    let checkedCrossings = 0;
    for (const headerText of headerTexts) {
      const textBox = await requireBox(headerText);
      for (const borderX of [
        frameBox.x + BORDER_INSET_PX,
        frameBox.x + frameBox.width - BORDER_INSET_PX,
      ]) {
        if (borderX < textBox.x || borderX > textBox.x + textBox.width)
          continue;
        const point = { x: borderX, y: textBox.y + textBox.height / HALF };
        expect(await isTopmostAt(headerText, point)).toBe(true);
        checkedCrossings += 1;
      }
    }
    expect(checkedCrossings).toBeGreaterThan(0);
  },
);

// Verifies FR12 of add-grid-hour-cells-and-hour-frame.
Then(
  "the hour frame is on column {int}",
  async ({ locationsWorld }, column: number) => {
    await expect.poll(() => frameColumnOf(locationsWorld.page)).toBe(column);
  },
);

// Verifies NFR-A1, NFR-A2 of add-grid-hour-cells-and-hour-frame.
When(
  "the user tabs from the location menu button of {string}",
  async ({ locationsWorld }, city: string) => {
    await menuButton(locationsWorld.page, city).focus();
    await locationsWorld.page.keyboard.press("Tab");
  },
);

Then(
  "the hour strip of {string} has focus with a focus ring in the accent colour",
  async ({ locationsWorld }, city: string) => {
    const strip = sliderOf(locationsWorld.page, city);
    await expect(strip).toBeFocused();
    await expect(strip).toHaveCSS(
      "outline-color",
      readThemeColours("light").accent,
    );
  },
);

When("the user presses Tab", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press("Tab");
});

Then(
  "focus is in the row of {string}",
  async ({ locationsWorld }, city: string) => {
    await expect(
      listRow(locationsWorld.page, city).locator(":focus"),
    ).toHaveCount(1);
  },
);
