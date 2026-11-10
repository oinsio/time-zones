import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  addLocationButton,
  listRow,
} from "../../locations/steps/locationsE2eHelpers";
import {
  dragWithFinger,
  startTouch,
} from "../../locations/steps/locationsReorderE2eHelpers";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  cellOf,
  cellsOf,
  centreOf,
  frameOf,
  isTopmostAt,
  noteOf,
  panelOf,
  requireBox,
} from "./hourGridE2eHelpers";
import {
  clearButtonOf,
  dragAcrossCells,
  expectMeetingTimes,
  meetingFrameOf,
  meetingTitleOf,
  setSampleMeeting,
  shareButtonOf,
} from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const CELLS_PER_ROW = 24;
const SAMPLE_COLUMNS = [9, 10];
const EDGE_TOLERANCE_PX = 2;
const SWIPE_DISTANCE_PX = 200;
const BORDER_INSET_PX = 1;
const HALF = 2;
const MIN_BUTTON_SIZE_PX = 44;
const BOLD_FONT_WEIGHT = "700";
const DIMMED_OPACITY = "0.4";
const FULL_OPACITY = "1";
const ENABLE_POINTER_HIT_TEST = (element: HTMLElement) => {
  element.style.pointerEvents = "auto";
};
const SCROLL_POSITION_KEY = "scrollLeftBeforeSwipe";

// Verifies FR5 of add-grid-meeting-range-and-share.
When(
  "the user taps column {int} of {string}",
  async ({ locationsWorld }, column: number, city: string) => {
    await cellOf(locationsWorld.page, city, column).click();
  },
);

When(
  "the user focuses the hour strip of {string} and presses Enter",
  async ({ locationsWorld }, city: string) => {
    const strip = sliderOf(locationsWorld.page, city);
    await strip.focus();
    await strip.press("Enter");
  },
);

// Verifies FR6 of add-grid-meeting-range-and-share.
When(
  "the user drags with the mouse from column {int} to column {int} of {string}",
  async ({ locationsWorld }, fromColumn: number, toColumn: number, city) => {
    await dragAcrossCells(locationsWorld.page, city, fromColumn, toColumn);
  },
);

When("the user sets the sample meeting", async ({ locationsWorld }) => {
  await setSampleMeeting(locationsWorld.page);
});

When("the user clears the meeting", async ({ locationsWorld }) => {
  await clearButtonOf(locationsWorld.page).click();
});

Then(
  "the meeting range is from {string} to {string}",
  async ({ locationsWorld }, start: string, end: string) => {
    await expectMeetingTimes(locationsWorld.page, start, end);
  },
);

Then(
  "the meeting title reads {string}",
  async ({ locationsWorld }, title: string) => {
    await expect(meetingTitleOf(locationsWorld.page)).toHaveText(title);
  },
);

// Verifies FR6, NFR-R1 of add-grid-meeting-range-and-share: a real finger gesture, so the browser itself scrolls.
When(
  "the user swipes the strip of {string} to the left with a finger",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await page.evaluate(
      ([key, scrollLeft]) => Reflect.set(window, key, scrollLeft),
      [SCROLL_POSITION_KEY, await panelOf(page).evaluate((p) => p.scrollLeft)],
    );
    const from = await centreOf(await requireBox(sliderOf(page, city)));
    const session = await startTouch(page);
    await dragWithFinger(session, from, {
      x: from.x - SWIPE_DISTANCE_PX,
      y: from.y,
    });
  },
);

Then(
  "the strips have scrolled and no meeting range is set",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const before = await page.evaluate(
      (key) => Reflect.get(window, key) as number,
      SCROLL_POSITION_KEY,
    );
    await expect
      .poll(() => panelOf(page).evaluate((panel) => panel.scrollLeft))
      .not.toBe(before);
    await expect(meetingFrameOf(page)).toHaveCount(0);
  },
);

// Verifies FR7, UX1 of add-grid-meeting-range-and-share.
Then(
  /^the meeting frame has the (light|dark) meeting colour$/,
  async ({ locationsWorld }, theme: Theme) => {
    await expect(meetingFrameOf(locationsWorld.page)).toHaveCSS(
      "border-top-color",
      readThemeColours(theme).meeting,
    );
  },
);

Then(
  "where the meeting frame crosses the clock change note of {string}, the topmost element is the note",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const note = noteOf(page, city);
    await meetingFrameOf(page).evaluate(ENABLE_POINTER_HIT_TEST);
    const frameBox = await requireBox(meetingFrameOf(page));
    const noteBox = await requireBox(note);
    const noteMiddleY = noteBox.y + noteBox.height / HALF;
    let checkedCrossings = 0;
    for (const borderX of [
      frameBox.x + BORDER_INSET_PX,
      frameBox.x + frameBox.width - BORDER_INSET_PX,
    ]) {
      if (borderX < noteBox.x || borderX > noteBox.x + noteBox.width) continue;
      expect(await isTopmostAt(note, { x: borderX, y: noteMiddleY })).toBe(
        true,
      );
      checkedCrossings += 1;
    }
    expect(checkedCrossings).toBeGreaterThan(0);
  },
);

Then(
  "where the meeting frame crosses a header text of {string}, the topmost element is that text",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const row = listRow(page, city);
    await meetingFrameOf(page).evaluate(ENABLE_POINTER_HIT_TEST);
    const frameBox = await requireBox(meetingFrameOf(page));
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
        if (borderX < textBox.x || borderX > textBox.x + textBox.width) continue;
        const point = { x: borderX, y: textBox.y + textBox.height / HALF };
        expect(await isTopmostAt(headerText, point)).toBe(true);
        checkedCrossings += 1;
      }
    }
    expect(checkedCrossings).toBeGreaterThan(0);
  },
);

Then(
  "the meeting frame encloses columns 9 and 10 of every row",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(meetingFrameOf(page)).toHaveAttribute(
      "data-meeting-frame-columns",
      "9-10",
    );
    const frameBox = await requireBox(meetingFrameOf(page));
    for (const city of ALL_CITIES) {
      const firstBox = await requireBox(cellOf(page, city, SAMPLE_COLUMNS[0]));
      const lastBox = await requireBox(cellOf(page, city, SAMPLE_COLUMNS[1]));
      expect(frameBox.x).toBeLessThanOrEqual(firstBox.x + EDGE_TOLERANCE_PX);
      expect(frameBox.x + frameBox.width).toBeGreaterThanOrEqual(
        lastBox.x + lastBox.width - EDGE_TOLERANCE_PX,
      );
    }
  },
);

Then(
  "22 cells of every row are dimmed and columns 9 and 10 are not",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const city of ALL_CITIES) {
      for (let column = 0; column < CELLS_PER_ROW; column += 1) {
        await expect(cellOf(page, city, column)).toHaveCSS(
          "opacity",
          SAMPLE_COLUMNS.includes(column) ? FULL_OPACITY : DIMMED_OPACITY,
        );
      }
      await expect(cellsOf(page, city)).toHaveCount(CELLS_PER_ROW);
    }
  },
);

Then("no hour frame is shown", async ({ locationsWorld }) => {
  await expect(frameOf(locationsWorld.page)).toHaveCount(0);
});

// Verifies FR8, UX1 of add-grid-meeting-range-and-share.
Then(
  /^"([^"]+)" shows the span "([^"]+)"( in the meeting time colour)?$/,
  async ({ locationsWorld }, city: string, span: string, isColoured) => {
    const timeButton = listRow(locationsWorld.page, city).getByRole("button", {
      name: /^Enter time/,
    });
    await expect(timeButton).toHaveText(span);
    if (isColoured) {
      await expect(timeButton).toHaveCSS(
        "color",
        readThemeColours("light").meetingText,
      );
    }
  },
);

Then(
  /^"([^"]+)" shows the day shift mark "([^"]+)" in the danger colour$/,
  async ({ locationsWorld }, city: string, mark: string) => {
    const dayShiftMark = listRow(locationsWorld.page, city).getByText(mark, {
      exact: true,
    });
    await expect(dayShiftMark).toHaveCSS(
      "color",
      readThemeColours("light").danger,
    );
    await expect(dayShiftMark).toHaveCSS("font-weight", BOLD_FONT_WEIGHT);
  },
);

Then(
  /^"([^"]+)" shows no day shift mark$/,
  async ({ locationsWorld }, city: string) => {
    await expect(
      listRow(locationsWorld.page, city).getByText(/a day (earlier|later)/),
    ).toHaveCount(0);
  },
);

// Verifies FR13 of add-grid-meeting-range-and-share.
Then("no meeting range is set", async ({ locationsWorld }) => {
  await expect(meetingFrameOf(locationsWorld.page)).toHaveCount(0);
  await expect(shareButtonOf(locationsWorld.page)).toHaveCount(0);
});

Then(
  "the page header shows the app title again",
  async ({ locationsWorld }) => {
    await expect(meetingTitleOf(locationsWorld.page)).toHaveText(
      "Time Zones",
    );
  },
);

Then("the Add location button has the focus", async ({ locationsWorld }) => {
  await expect(addLocationButton(locationsWorld.page)).toBeFocused();
});

Then(
  "every row shows its single time and no day shift mark",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (const city of ALL_CITIES) {
      await expect(
        listRow(page, city).getByRole("button", { name: /^Enter time/ }),
      ).not.toContainText("–");
    }
    await expect(page.getByText(/a day (earlier|later)/)).toHaveCount(0);
  },
);

Then(
  "the meeting title and both buttons are on one line",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const boxes = [
      await requireBox(meetingTitleOf(page)),
      await requireBox(shareButtonOf(page)),
      await requireBox(clearButtonOf(page)),
    ];
    const [title, share, clear] = boxes;
    expect(share.y).toBeLessThan(title.y + title.height);
    expect(clear.y).toBeLessThan(title.y + title.height);
    expect(share.x).toBeGreaterThanOrEqual(title.x + title.width - BORDER_INSET_PX);
    for (const button of [share, clear]) {
      expect(button.width).toBeGreaterThanOrEqual(MIN_BUTTON_SIZE_PX);
      expect(button.height).toBeGreaterThanOrEqual(MIN_BUTTON_SIZE_PX);
    }
  },
);
