import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  boxOf,
  CENTRE_TOLERANCE_PX,
  creditOf,
  isCreditDirectlyAboveThemeGroup,
  MAX_CREDIT_FONT_SIZE_RATIO,
  MIN_CREDIT_FONT_SIZE_RATIO,
  readCreditFontSizeRatio,
  themeGroupOf,
} from "./settingsCreditE2eHelpers";
import { settingsHeading } from "./settingsE2eHelpers";

const { Then } = createBdd(test);

const ALERT_ROLE = "alert";
const FONT_SIZE_PROPERTY = "fontSize";

const readFontSizePx = (locator: ReturnType<typeof creditOf>) =>
  locator.evaluate(
    (element, property) =>
      Number.parseFloat(
        getComputedStyle(element)[property as "fontSize"] as string,
      ),
    FONT_SIZE_PROPERTY,
  );

// Verifies FR1, UX1 of move-and-restyle-gnomish-factory-credit: below the heading, right above the theme group.
Then(
  "the credit stands below the settings heading and directly above the theme group",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const credit = await boxOf(creditOf(page));
    const heading = await boxOf(settingsHeading(page));
    const themeGroup = await boxOf(themeGroupOf(page));
    expect(credit.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    expect(await isCreditDirectlyAboveThemeGroup(page)).toBe(true);
    expect(
      Math.abs(
        credit.x + credit.width / 2 - (themeGroup.x + themeGroup.width / 2),
      ),
    ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);
  },
);

// Verifies FR1 of move-and-restyle-gnomish-factory-credit: the credit stands directly above the theme group.
Then(
  "the credit stands directly above the theme group",
  async ({ locationsWorld }) => {
    expect(await isCreditDirectlyAboveThemeGroup(locationsWorld.page)).toBe(
      true,
    );
  },
);

// Verifies FR1 of move-and-restyle-gnomish-factory-credit: a note stays on top of the credit.
Then(
  "the unreadable note stands above the credit",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const note = await boxOf(page.getByRole(ALERT_ROLE));
    const credit = await boxOf(creditOf(page));
    expect(note.y + note.height).toBeLessThanOrEqual(credit.y);
  },
);

// Verifies FR3 of move-and-restyle-gnomish-factory-credit: 15 to 20 % larger than before.
Then(
  "the credit's font size is 15 to 20 % larger than before",
  async ({ locationsWorld }) => {
    const ratio = await readCreditFontSizeRatio(locationsWorld.page);
    expect(ratio).toBeGreaterThanOrEqual(MIN_CREDIT_FONT_SIZE_RATIO);
    expect(ratio).toBeLessThanOrEqual(MAX_CREDIT_FONT_SIZE_RATIO);
  },
);

// Verifies FR3, UX1 of move-and-restyle-gnomish-factory-credit: between the legends and the heading.
Then(
  "the credit is larger than the group legends and smaller than the settings heading",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const creditSize = await readFontSizePx(creditOf(page));
    const legendSize = await readFontSizePx(page.locator("legend").first());
    const headingSize = await readFontSizePx(settingsHeading(page));
    expect(creditSize).toBeGreaterThan(legendSize);
    expect(creditSize).toBeLessThan(headingSize);
  },
);
