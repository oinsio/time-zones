// Verifies FR6, FR7, FR8, UX3 of fix-grid-meeting-range-lock-and-layering: layers of the grid under bars and dialogs in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  dateButton,
  nowButton,
  openCalendarWithMouse,
} from "../../date_selection/steps/dateSelectionE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  menuButton,
  openSearch,
} from "../../locations/steps/locationsE2eHelpers";
import { measureBorderCoverage } from "./frameBorderCoverage";
import {
  centreOf,
  HOUR_FRAME_SELECTOR,
  isTopmostAt,
  requireBox,
} from "./hourGridE2eHelpers";
import { MEETING_FRAME_SELECTOR, setSampleMeeting } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const MEETING_STATE = "the meeting range 09:00–11:00";
const SEARCH_DIALOG = "the search";
const DIALOG_LAYER_SELECTOR = '[role="dialog"], .z-dialog';
const GRID_ELEMENT_SELECTORS = [
  "[data-hour-cell]",
  "[data-meeting-handle]",
  "[data-zone-line]",
  "time",
  "li .sticky span",
];
const DATE_BAR_SELECTOR = "footer";
const GAP_ABOVE_DATE_BAR_PX = 4;
const DATE_BAR_SAMPLE_STEP_PX = 8;
const SCROLL_UNDER_DATE_BAR_PX = 400;
const MENU_ITEM_ROLE = "menuitem";
const GRID_PANEL_SELECTOR = 'ul[data-row-variant="grid-row"]';

When(
  /^the grid shows (the hour frame|the meeting range 09:00–11:00)$/,
  async ({ locationsWorld }, state: string) => {
    if (state === MEETING_STATE) await setSampleMeeting(locationsWorld.page);
  },
);

When(
  /^the user brings up (the search|the calendar)$/,
  async ({ locationsWorld }, dialog: string) => {
    if (dialog === SEARCH_DIALOG) await openSearch(locationsWorld.page);
    else await openCalendarWithMouse(locationsWorld.page);
  },
);

Then(
  "every row header text, hour cell and meeting handle under the backdrop has the dialog or its backdrop on top",
  async ({ locationsWorld }) => {
    const uncovered = await locationsWorld.page.evaluate(
      ({ selectors, layerSelector }) => {
        const found: string[] = [];
        let checked = 0;
        for (const element of document.querySelectorAll(
          `${selectors.join(", ")}`,
        )) {
          if (element.closest(layerSelector)) continue;
          const rect = element.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          checked += 1;
          if (!document.elementFromPoint(x, y)?.closest(layerSelector))
            found.push(`${element.tagName} at ${x},${y}`);
        }
        return { found, checked };
      },
      {
        selectors: GRID_ELEMENT_SELECTORS,
        layerSelector: DIALOG_LAYER_SELECTOR,
      },
    );
    expect(uncovered.checked).toBeGreaterThan(0);
    expect(uncovered.found).toEqual([]);
  },
);

When(
  "the page is scrolled so that rows pass under the date bar",
  async ({ locationsWorld }) => {
    await locationsWorld.page.evaluate(
      (distance) => window.scrollBy(0, distance),
      SCROLL_UNDER_DATE_BAR_PX,
    );
  },
);

Then(
  "the topmost element at the centre of the calendar button and of the Now button is that button",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const button of [dateButton(page), nowButton(page)]) {
      expect(
        await isTopmostAt(button, centreOf(await requireBox(button))),
      ).toBe(true);
    }
  },
);

Then(
  "no point of the date bar has a grid element on top",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const barBox = await requireBox(page.locator(DATE_BAR_SELECTOR));
    const gridElementsOnTop = await page.evaluate(
      ({ box, step, panelSelector }) => {
        const found: string[] = [];
        for (let x = box.x; x < box.x + box.width; x += step) {
          for (let y = box.y; y < box.y + box.height; y += step) {
            const topmost = document.elementFromPoint(x, y);
            if (topmost?.closest(panelSelector)) found.push(`${x},${y}`);
          }
        }
        return found;
      },
      {
        box: barBox,
        step: DATE_BAR_SAMPLE_STEP_PX,
        panelSelector: GRID_PANEL_SELECTOR,
      },
    );
    expect(gridElementsOnTop).toEqual([]);
  },
);

When(
  "the page is scrolled so that the menu button of {string} lies just above the date bar",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const buttonBox = await requireBox(menuButton(page, city));
    const barBox = await requireBox(page.locator(DATE_BAR_SELECTOR));
    await page.evaluate(
      (distance) => window.scrollBy(0, distance),
      buttonBox.y + buttonBox.height - (barBox.y - GAP_ABOVE_DATE_BAR_PX),
    );
  },
);

const menuItemsOverDateBar = async (page: Page) => {
  const barBox = await requireBox(page.locator(DATE_BAR_SELECTOR));
  const items = await page.getByRole(MENU_ITEM_ROLE).all();
  const overBar = [];
  for (const item of items) {
    const centre = centreOf(await requireBox(item));
    if (centre.y >= barBox.y && centre.y <= barBox.y + barBox.height)
      overBar.push({ item, centre });
  }
  return overBar;
};

Then(
  "every menu item over the date bar has that menu item on top",
  async ({ locationsWorld }) => {
    for (const { item, centre } of await menuItemsOverDateBar(
      locationsWorld.page,
    ))
      expect(await isTopmostAt(item, centre)).toBe(true);
  },
);

Then(
  "at least one menu item lies over the date bar",
  async ({ locationsWorld }) => {
    expect(
      (await menuItemsOverDateBar(locationsWorld.page)).length,
    ).toBeGreaterThan(0);
  },
);

/** Measures the border of the frame the page shows: the meeting frame while a meeting range is set, else the hour frame. */
const measureShownFrame = async (page: Page) => {
  await page
    .locator(`${HOUR_FRAME_SELECTOR}, ${MEETING_FRAME_SELECTOR}`)
    .first()
    .waitFor();
  const hasMeetingFrame = (await page.locator(MEETING_FRAME_SELECTOR).count()) > 0;
  return measureBorderCoverage(
    page,
    hasMeetingFrame ? MEETING_FRAME_SELECTOR : HOUR_FRAME_SELECTOR,
  );
};

Then(
  "no border point of the frame in a row header is covered by a background beside a glyph, a row note or an input",
  async ({ locationsWorld }) => {
    const coverage = await measureShownFrame(locationsWorld.page);
    expect(coverage.coveredPoints).toEqual([]);
  },
);

Then(
  "every row has a border point in an empty part of its header",
  async ({ locationsWorld }) => {
    const coverage = await measureShownFrame(locationsWorld.page);
    expect(coverage.emptyPointsPerRow.length).toBeGreaterThan(0);
    for (const emptyPoints of coverage.emptyPointsPerRow)
      expect(emptyPoints).toBeGreaterThan(0);
  },
);
