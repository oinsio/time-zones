// Verifies NFR-R1, NFR-R2, UX1, UX2, UX3 of select-date-with-calendar-and-now.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  barOf,
  buildManyLocations,
  calendarOf,
  dateButton,
  MIN_TOUCH_TARGET_PX,
  nextDayButton,
  nowButton,
  previousDayButton,
  requireBox,
} from "./dateSelectionE2eHelpers";

const { Given, When, Then } = createBdd(test);

const EDGE_PADDING_PX = 24;
const CENTER_TOLERANCE_PX = 2;
const FOOTER_SELECTOR = "footer";
const CALENDAR_DAY_SELECTOR = "table button";
const ACCENT_COLOUR_VARIABLE = "--color-accent";
const ACCENT_FOREGROUND_VARIABLE = "--color-accent-foreground";
const FOREGROUND_VARIABLE = "--color-foreground";
const HALF = 2;
const LOCATION_COUNT = 12;
const FULL_SCREEN_TEXT = "full screen";

const footerBox = (page: Page) => requireBox(page.locator(FOOTER_SELECTOR));

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

// Verifies NFR-R2 of select-date-with-calendar-and-now.
Given("the list has 12 locations", async ({ locationsWorld }) => {
  await locationsWorld.seedList(buildManyLocations());
});

Then(
  "the arrows and the date are at the left of the bar and Now is at the right",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const previous = await requireBox(previousDayButton(page));
    const next = await requireBox(nextDayButton(page));
    const date = await requireBox(dateButton(page));
    const now = await requireBox(nowButton(page));
    expect(previous.x).toBeLessThanOrEqual(EDGE_PADDING_PX);
    expect(previous.x).toBeLessThan(date.x);
    expect(date.x).toBeLessThan(next.x);
    expect(next.x + next.width).toBeLessThan(now.x);
    expect(now.x + now.width).toBeGreaterThanOrEqual(
      viewportWidth - EDGE_PADDING_PX,
    );
  },
);

Then(
  "the bar touches the bottom of the viewport",
  async ({ locationsWorld }) => {
    const viewportHeight = locationsWorld.page.viewportSize()?.height ?? 0;
    const bar = await footerBox(locationsWorld.page);
    expect(bar.y + bar.height).toBeCloseTo(viewportHeight, 0);
  },
);

Then(
  "the arrows, the date and Now form one group centred in the bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const first = await requireBox(previousDayButton(page));
    const last = await requireBox(nowButton(page));
    const bar = await footerBox(page);
    const groupCentre = (first.x + last.x + last.width) / HALF;
    expect(
      Math.abs(groupCentre - (bar.x + bar.width / HALF)),
    ).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
  },
);

When("the user scrolls to the end", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect(page.getByRole("listitem")).toHaveCount(LOCATION_COUNT);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

Then("the last card is fully above the bar", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(async () => {
      const lastCard = await requireBox(page.getByRole("listitem").last());
      const bar = await footerBox(page);
      return lastCard.y + lastCard.height - bar.y;
    })
    .toBeLessThanOrEqual(1);
});

Then(
  /^the calendar is laid out as (.+)$/,
  async ({ locationsWorld }, layout: string) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    const dialog = await requireBox(calendarOf(page));
    if (layout === FULL_SCREEN_TEXT) {
      expect(dialog).toMatchObject({
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
      return;
    }
    expect(dialog.width).toBeLessThan(viewport.width);
    expect(
      Math.abs(dialog.x + dialog.width / HALF - viewport.width / HALF),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(dialog.y + dialog.height / HALF - viewport.height / HALF),
    ).toBeLessThanOrEqual(1);
  },
);

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
