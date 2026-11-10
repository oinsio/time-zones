import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  centreOf,
  isTopmostAt,
  noteOf,
  requireBox,
} from "../../grid_view/steps/hourGridE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";

const { Then } = createBdd(test);

const MENU_ROLE = "menu";
const MENU_ITEM_ROLE = "menuitem";
const ZONE_LINE_SELECTOR = "[data-zone-line]";

const verticallyOverlap = (
  first: { y: number; height: number },
  second: { y: number; height: number },
) => first.y < second.y + second.height && first.y + first.height > second.y;

// Verifies FR7 of add-grid-hour-cells-and-hour-frame: the row note follows the strip in the document and on the screen.
Then(
  "the clock change note of {string} comes after its hour strip, in the document and on the screen",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const note = noteOf(page, city);
    const strip = sliderOf(page, city);
    const stripBox = await requireBox(strip);
    const noteBox = await requireBox(note);
    expect(noteBox.y).toBeGreaterThanOrEqual(stripBox.y + stripBox.height);
    const isNoteAfterStrip = await note.evaluate(
      (noteElement, stripElement) =>
        Boolean(
          stripElement.compareDocumentPosition(noteElement) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      await strip.elementHandle(),
    );
    expect(isNoteAfterStrip).toBe(true);
  },
);

// Verifies NFR-R3 of add-grid-hour-cells-and-hour-frame: two header lines below 768 px.
Then(
  "the time of {string} is on the line of its city, right of it",
  async ({ locationsWorld }, city: string) => {
    const row = listRow(locationsWorld.page, city);
    const cityBox = await requireBox(row.getByText(city, { exact: true }));
    const timeBox = await requireBox(
      row.getByRole("button", { name: /^Enter time/ }),
    );
    expect(verticallyOverlap(cityBox, timeBox)).toBe(true);
    expect(timeBox.x).toBeGreaterThanOrEqual(cityBox.x + cityBox.width);
  },
);

Then(
  "the date of {string} is on the line of its zone line, under its time",
  async ({ locationsWorld }, city: string) => {
    const row = listRow(locationsWorld.page, city);
    const zoneLineBox = await requireBox(row.locator(ZONE_LINE_SELECTOR));
    const dateBox = await requireBox(row.locator("time"));
    const timeBox = await requireBox(
      row.getByRole("button", { name: /^Enter time/ }),
    );
    expect(verticallyOverlap(zoneLineBox, dateBox)).toBe(true);
    expect(dateBox.y).toBeGreaterThanOrEqual(timeBox.y + timeBox.height - 1);
  },
);

// Verifies FR1 of add-grid-hour-cells-and-hour-frame: an open menu is whole and above the other rows.
Then("the whole menu lies inside the viewport", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const menuBox = await requireBox(page.getByRole(MENU_ROLE));
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("The page has no viewport");
  expect(menuBox.x).toBeGreaterThanOrEqual(0);
  expect(menuBox.y).toBeGreaterThanOrEqual(0);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewport.width);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewport.height);
});

Then(
  "at the centre of every menu item the topmost element is that item",
  async ({ locationsWorld }) => {
    const items = locationsWorld.page.getByRole(MENU_ITEM_ROLE);
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
    for (let index = 0; index < itemCount; index++) {
      const item = items.nth(index);
      expect(await isTopmostAt(item, centreOf(await requireBox(item)))).toBe(
        true,
      );
    }
  },
);
