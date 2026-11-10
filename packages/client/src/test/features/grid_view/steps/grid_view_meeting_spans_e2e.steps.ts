import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  addLocationButton,
  listRow,
} from "../../locations/steps/locationsE2eHelpers";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import { requireBox } from "./hourGridE2eHelpers";
import {
  clearButtonOf,
  meetingFrameOf,
  meetingTitleOf,
  shareButtonOf,
} from "./meetingE2eHelpers";

const { Then } = createBdd(test);

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const BORDER_INSET_PX = 1;
const MIN_BUTTON_SIZE_PX = 44;
const BOLD_FONT_WEIGHT = "700";

// Verifies FR8, UX1 of add-grid-meeting-range-and-share.
Then(
  /^"([^"]+)" shows the span "([^"]+)"( in the meeting time colour)?$/,
  async ({ locationsWorld }, city: string, span: string, isColoured) => {
    const timeButton = listRow(locationsWorld.page, city).getByRole("button", {
      name: /^Enter meeting time/,
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
    await expect(meetingTitleOf(locationsWorld.page)).toHaveText("Time Zones");
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
    expect(share.x).toBeGreaterThanOrEqual(
      title.x + title.width - BORDER_INSET_PX,
    );
    for (const button of [share, clear]) {
      expect(button.width).toBeGreaterThanOrEqual(MIN_BUTTON_SIZE_PX);
      expect(button.height).toBeGreaterThanOrEqual(MIN_BUTTON_SIZE_PX);
    }
  },
);
