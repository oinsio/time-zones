import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { SAME_LINE_TOLERANCE_PX } from "./locationsCardLayoutHelpers";
import { listRow } from "./locationsE2eHelpers";
import {
  bottomOf,
  centreOfBoxX,
  centreOfBoxY,
  containerBoxOf,
  contentRightEdge,
  MAX_DOTS_CENTRE_OFFSET_PX,
  MAX_MENU_FOOTPRINT_PX,
  MAX_SPACING_DIFFERENCE_PX,
  MIN_HIT_AREA_PX,
  meetingTimeOf,
  menuButtonOf,
  menuDotsOf,
  neighboursOf,
  overlapsBy,
  rightBorderEdge,
  rightOf,
  rowsOf,
  timeButtonOf,
} from "./locationsMenuButtonHelpers";

const { Then } = createBdd(test);

const CITY_ATTRIBUTE_PATTERN = /^(Actions for|Действия:)\s*/;
const DOTS_COUNT = 3;
const MENU_ROLE = "menu";

const cityOfRow = async (row: ReturnType<typeof listRow>) => {
  const name = (await menuButtonOf(row).getAttribute("aria-label")) ?? "";
  return name.replace(CITY_ATTRIBUTE_PATTERN, "");
};

// Verifies FR1, NFR-A1 of make-location-menu-button-vertical
Then(
  "each location menu button shows three dots one above the other and no text",
  async ({ locationsWorld }) => {
    const rows = await rowsOf(locationsWorld.page);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      await expect(menuButtonOf(row)).toHaveText("");
      const dots = menuDotsOf(row).locator("circle");
      await expect(dots).toHaveCount(DOTS_COUNT);
      const centresX = new Set<number>();
      const centresY = new Set<number>();
      for (const dot of await dots.all()) {
        const box = await requireBox(dot);
        centresX.add(Math.round(centreOfBoxX(box)));
        centresY.add(Math.round(centreOfBoxY(box)));
      }
      expect(centresX.size).toBe(1);
      expect(centresY.size).toBe(DOTS_COUNT);
    }
  },
);

// Verifies FR1 of make-location-menu-button-vertical
Then(
  /^the dots of "([^"]+)" and "([^"]+)" are vertically centred on the time$/,
  async ({ locationsWorld }, firstCity: string, secondCity: string) => {
    for (const city of [firstCity, secondCity]) {
      const row = listRow(locationsWorld.page, city);
      const dotsBox = await requireBox(menuDotsOf(row));
      const timeBox = await requireBox(timeButtonOf(row));
      expect(
        Math.abs(centreOfBoxY(dotsBox) - centreOfBoxY(timeBox)),
      ).toBeLessThanOrEqual(MAX_DOTS_CENTRE_OFFSET_PX);
    }
  },
);

// Verifies FR2 of make-location-menu-button-vertical
Then(
  "in every row the time is at most 32 px from the right content edge",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const row of await rowsOf(page)) {
      const timeBox = await requireBox(timeButtonOf(row));
      expect(
        (await contentRightEdge(page, row)) - rightOf(timeBox),
      ).toBeLessThanOrEqual(MAX_MENU_FOOTPRINT_PX);
    }
  },
);

// Verifies FR2 of make-location-menu-button-vertical
Then(
  "in every row the meeting time is at most 32 px from the right content edge",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const row of await rowsOf(page)) {
      const meetingBox = await requireBox(meetingTimeOf(row));
      expect(
        (await contentRightEdge(page, row)) - rightOf(meetingBox),
      ).toBeLessThanOrEqual(MAX_MENU_FOOTPRINT_PX);
    }
  },
);

// Verifies FR3 of make-location-menu-button-vertical
Then(
  "every location menu button is at least 44 px square and inside its row",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const row of await rowsOf(page)) {
      const buttonBox = await requireBox(menuButtonOf(row));
      const containerBox = await containerBoxOf(page, row);
      expect(buttonBox.width).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
      expect(buttonBox.height).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
      expect(buttonBox.x).toBeGreaterThanOrEqual(containerBox.x);
      expect(rightOf(buttonBox)).toBeLessThanOrEqual(rightOf(containerBox));
      expect(buttonBox.y).toBeGreaterThanOrEqual(containerBox.y);
      expect(bottomOf(buttonBox)).toBeLessThanOrEqual(bottomOf(containerBox));
    }
  },
);

// Verifies FR3 of make-location-menu-button-vertical
Then(
  "no location menu button overlaps the time, the date, the city, the offset difference or the zone line",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const row of await rowsOf(page)) {
      const buttonBox = await requireBox(menuButtonOf(row));
      for (const neighbour of neighboursOf(page, await cityOfRow(row))) {
        if ((await neighbour.count()) === 0) continue;
        expect(overlapsBy(buttonBox, await requireBox(neighbour))).toBe(false);
      }
    }
  },
);

// Verifies UX1 of make-location-menu-button-vertical
Then(
  "in every row the dots are about as far from the time as from the right border",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const row of await rowsOf(page)) {
      const dotsCentre = centreOfBoxX(await requireBox(menuDotsOf(row)));
      const timeRight = rightOf(await requireBox(timeButtonOf(row)));
      const borderRight = await rightBorderEdge(page, row);
      expect(
        Math.abs(dotsCentre - timeRight - (borderRight - dotsCentre)),
      ).toBeLessThanOrEqual(MAX_SPACING_DIFFERENCE_PX);
    }
  },
);

// Verifies FR3 of make-location-menu-button-vertical
Then(
  "the time and the location menu button are on a line of their own at the right edge",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const [row] = await rowsOf(page);
    const timeBox = await requireBox(timeButtonOf(row));
    const buttonBox = await requireBox(menuButtonOf(row));
    const cityBox = await requireBox(
      neighboursOf(page, await cityOfRow(row))[2],
    );
    expect(timeBox.y).toBeGreaterThanOrEqual(
      bottomOf(cityBox) - SAME_LINE_TOLERANCE_PX,
    );
    expect(rightOf(timeBox)).toBeLessThanOrEqual(
      buttonBox.x + SAME_LINE_TOLERANCE_PX,
    );
    expect(
      (await contentRightEdge(page, row)) - rightOf(buttonBox),
    ).toBeLessThanOrEqual(MAX_MENU_FOOTPRINT_PX);
  },
);

// Verifies FR3 of make-location-menu-button-vertical
Then("the open menu lies inside the screen", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const menuBox = await requireBox(page.getByRole(MENU_ROLE));
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("The page has no viewport");
  expect(menuBox.x).toBeGreaterThanOrEqual(0);
  expect(rightOf(menuBox)).toBeLessThanOrEqual(viewport.width);
  expect(menuBox.y).toBeGreaterThanOrEqual(0);
  expect(bottomOf(menuBox)).toBeLessThanOrEqual(viewport.height);
});
