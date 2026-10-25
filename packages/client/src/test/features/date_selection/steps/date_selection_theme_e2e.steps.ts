// Verifies UX1, UX2, UX3, NFR-R1 of select-date-with-calendar-and-now.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  barOf,
  calendarOf,
  dateButton,
  MIN_TOUCH_TARGET_PX,
  nextDayButton,
  nowButton,
  previousDayButton,
  requireBox,
} from "./dateSelectionE2eHelpers";

const { When, Then } = createBdd(test);

const CALENDAR_DAY_SELECTOR = "table button";
const ACCENT_COLOUR_VARIABLE = "--color-accent";
const ACCENT_FOREGROUND_VARIABLE = "--color-accent-foreground";
const FOREGROUND_VARIABLE = "--color-foreground";

async function computedColourOfVariable(page: Page, variableName: string) {
  return page.evaluate((cssVariable) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${cssVariable})`;
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, variableName);
}

const eachBox = async (locator: Locator) =>
  Promise.all((await locator.all()).map((item) => requireBox(item)));
// Verifies UX2 of select-date-with-calendar-and-now.
Then(
  "Now shows a clock icon and the label {string} in the accent colours",
  async ({ locationsWorld }, label: string) => {
    const { page } = locationsWorld;
    const now = nowButton(page);
    await expect(now.locator("svg")).toHaveCount(1);
    await expect(now).toHaveText(label);
    await expect(now).toHaveCSS(
      "background-color",
      await computedColourOfVariable(page, ACCENT_COLOUR_VARIABLE),
    );
    await expect(now).toHaveCSS(
      "color",
      await computedColourOfVariable(page, ACCENT_FOREGROUND_VARIABLE),
    );
  },
);

Then(
  "the previous-day and next-day buttons show an icon and no visible text",
  async ({ locationsWorld }) => {
    for (const arrow of [
      previousDayButton(locationsWorld.page),
      nextDayButton(locationsWorld.page),
    ]) {
      await expect(arrow.locator("svg")).toHaveCount(1);
      expect(
        await arrow.evaluate((element) => (element as HTMLElement).innerText),
      ).toBe("");
    }
  },
);

// Verifies UX3 of select-date-with-calendar-and-now.
Then(
  "no other text in the bar is larger or heavier than the shown date",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const textStyles = await barOf(page).evaluate((bar) => {
      const styleOf = (element: Element) => {
        const { fontSize, fontWeight } = getComputedStyle(element);
        return {
          fontSize: Number.parseFloat(fontSize),
          fontWeight: Number(fontWeight),
        };
      };
      const visibleDate = [...bar.querySelectorAll("[data-date-label]")].find(
        (label) => (label as HTMLElement).offsetParent !== null,
      ) as Element;
      const walker = document.createTreeWalker(bar, NodeFilter.SHOW_TEXT);
      const others: { fontSize: number; fontWeight: number }[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        const isVisible =
          parent && parent.offsetParent !== null && node.textContent?.trim();
        if (isVisible && !visibleDate.contains(node))
          others.push(styleOf(parent));
      }
      return { date: styleOf(visibleDate), others };
    });
    expect(textStyles.others.length).toBeGreaterThan(0);
    for (const other of textStyles.others) {
      expect(other.fontSize).toBeLessThanOrEqual(textStyles.date.fontSize);
      expect(other.fontWeight).toBeLessThanOrEqual(textStyles.date.fontWeight);
    }
  },
);

Then(
  "the shown date uses the main foreground colour",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const visibleLabel = barOf(page).locator("[data-date-label]:visible");
    await expect(visibleLabel).toHaveCSS(
      "color",
      await computedColourOfVariable(page, FOREGROUND_VARIABLE),
    );
  },
);

// Verifies UX1 of select-date-with-calendar-and-now.
Then("each bar control is at least 44 by 44 px", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  for (const control of [
    previousDayButton(page),
    dateButton(page),
    nextDayButton(page),
    nowButton(page),
  ]) {
    const box = await requireBox(control);
    expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  }
});

Then(
  "each calendar day is at least 44 by 44 px",
  async ({ locationsWorld }) => {
    const boxes = await eachBox(
      calendarOf(locationsWorld.page).locator(CALENDAR_DAY_SELECTOR),
    );
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    }
  },
);

// Verifies NFR-R1 of select-date-with-calendar-and-now.
Then(
  "the calendar does not scroll horizontally",
  async ({ locationsWorld }) => {
    const widths = await calendarOf(locationsWorld.page).evaluate((dialog) => ({
      scrollWidth: dialog.scrollWidth,
      clientWidth: dialog.clientWidth,
    }));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
  },
);

When(
  "the user opens the calendar on the narrowest screen",
  async () => undefined,
);
