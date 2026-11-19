// Verifies FR9 of redesign-cards-grid-and-day-palettes: the zone line joined by middle dots.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import { test } from "./locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const ZONE_LINE_SELECTOR = "[data-zone-line]";
const ZONE_LINE_DOT_SELECTOR = "[data-zone-line-dot]";
const ZONE_LINE_PART_SELECTOR = "[data-zone-line-part]";
const MIDDLE_DOT = "·";
const LINE_TOLERANCE_PX = 2;

const firstZoneLineOf = (page: import("@playwright/test").Page) =>
  page.locator(ZONE_LINE_SELECTOR).first();

Then(
  "the zone line reads {string} with the dots in the muted foreground colour",
  async ({ locationsWorld }, expectedText: string) => {
    const zoneLine = firstZoneLineOf(locationsWorld.page);
    await expect(zoneLine).toBeVisible();
    const text = await zoneLine.evaluate((element) =>
      (element.textContent ?? "").replace(/\s*·\s*/g, " · ").trim(),
    );
    expect(text).toBe(expectedText);
    const dots = zoneLine.locator(ZONE_LINE_DOT_SELECTOR);
    expect(await dots.count()).toBeGreaterThan(0);
    for (const dot of await dots.all()) {
      await expect(dot).toHaveCSS(
        "color",
        readThemeColours("light").mutedForeground,
      );
    }
  },
);

Then(
  "no line of the zone line starts or ends with a dot",
  async ({ locationsWorld }) => {
    const zoneLine = firstZoneLineOf(locationsWorld.page);
    await expect(zoneLine).toBeVisible();
    const lines = await zoneLine.evaluate(
      (element, selectors) => {
        const partTops = Array.from(
          element.querySelectorAll<HTMLElement>(selectors.part),
        ).map((part) => {
          const dot = part.querySelector<HTMLElement>(selectors.dot);
          return {
            top: part.getBoundingClientRect().top,
            hasVisibleDot:
              dot !== null && getComputedStyle(dot).display !== "none",
            isLast: false,
          };
        });
        return partTops;
      },
      { part: ZONE_LINE_PART_SELECTOR, dot: ZONE_LINE_DOT_SELECTOR },
    );
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((part, index) => {
      const startsLine =
        index === 0 || part.top - lines[index - 1].top > LINE_TOLERANCE_PX;
      // A part that starts a line carries no visible leading dot.
      if (startsLine) expect(part.hasVisibleDot).toBe(false);
    });
  },
);

Then(
  "the accessible text of the zone line contains no middle dot",
  async ({ locationsWorld }) => {
    const zoneLine = firstZoneLineOf(locationsWorld.page);
    await expect(zoneLine).toBeVisible();
    const accessibleText = await zoneLine.evaluate((element) => {
      const clone = element.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll('[aria-hidden="true"]')
        .forEach((hidden) => hidden.remove());
      return clone.textContent ?? "";
    });
    expect(accessibleText).not.toContain(MIDDLE_DOT);
    expect(accessibleText.length).toBeGreaterThan(0);
  },
);
