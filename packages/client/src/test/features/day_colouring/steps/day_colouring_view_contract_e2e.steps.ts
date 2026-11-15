// Verifies FR12 of add-day-colouring-setting.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import { readRowDayColours } from "../../view_contract/steps/viewContractDayColours";

const { Then } = createBdd(test);

// Verifies FR12 of add-day-colouring-setting: the view contract reads the colours the view draws.
Then(
  /^every day colour of the "([^"]+)" row is the accent colour$/,
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim(),
    );
    const colours = await readRowDayColours(listRow(page, city));
    expect(colours.length).toBeGreaterThan(0);
    for (const colour of colours) expect(toRgb(accent)).toBe(colour);
  },
);

Then(
  /^the "([^"]+)" row shows the accent colour at 12:00 and the non-working grey at 20:00 of Almaty$/,
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        accent: styles.getPropertyValue("--color-accent").trim(),
        grey: styles.getPropertyValue("--color-day-non-working").trim(),
      };
    });
    const atTwelve = await readRowDayColours(listRow(page, city), 12);
    const atTwenty = await readRowDayColours(listRow(page, city), 20);
    expect(atTwelve).toEqual([toRgb(tokens.accent)]);
    expect(atTwenty).toEqual([toRgb(tokens.grey)]);
  },
);

const HEX_RADIX = 16;
const HEX_CHANNEL_DIGITS = 2;
const toRgb = (hex: string): string => {
  const [red, green, blue] = [1, 3, 5].map((start) =>
    Number.parseInt(hex.slice(start, start + HEX_CHANNEL_DIGITS), HEX_RADIX),
  );
  return `rgb(${red}, ${green}, ${blue})`;
};
