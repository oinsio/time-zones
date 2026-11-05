import { expect, type Locator } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const ZONE_LINE_ELEMENTS = "[data-zone-line] > span";
const ELLIPSIS_TEXT_OVERFLOW = "ellipsis";
const SINGLE_LINE_RECT_COUNT = 1;

const zoneLineElementsOf = (row: Locator) => row.locator(ZONE_LINE_ELEMENTS);

// Verifies NFR-R1, M5 of show-zone-abbreviations-and-zone-label-setting: nothing is cut.
Then(
  "no zone line element is clipped or ends in an ellipsis",
  async ({ locationsWorld }) => {
    await expect(
      locationsWorld.page.locator(ZONE_LINE_ELEMENTS).first(),
    ).toBeVisible();
    const elements = await locationsWorld.page
      .locator(ZONE_LINE_ELEMENTS)
      .all();
    expect(elements.length).toBeGreaterThan(0);
    for (const element of elements) {
      const { scrollWidth, clientWidth, textOverflow } = await element.evaluate(
        (node) => ({
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          textOverflow: getComputedStyle(node).textOverflow,
        }),
      );
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      expect(textOverflow).not.toBe(ELLIPSIS_TEXT_OVERFLOW);
    }
  },
);

// Verifies NFR-R1, M5, UX1 of show-zone-abbreviations-and-zone-label-setting: each is on one line.
Then(
  /^"([^"]+)" shows "([^"]+)" and "([^"]+)", each on one line$/,
  async (
    { locationsWorld },
    _city: string,
    abbreviation: string,
    offset: string,
  ) => {
    // The city label follows the interface language, so the row is found by its zone abbreviation.
    const row = locationsWorld.page.getByRole("listitem").filter({
      has: locationsWorld.page
        .locator(ZONE_LINE_ELEMENTS)
        .filter({ hasText: abbreviation }),
    });
    for (const text of [abbreviation, offset]) {
      const element = zoneLineElementsOf(row).filter({
        hasText: text,
      });
      await expect(element).toHaveCount(1);
      expect(
        await element.evaluate((node) => node.getClientRects().length),
      ).toBe(SINGLE_LINE_RECT_COUNT);
    }
  },
);
