// Verifies NFR-A2, NFR-A3, NFR-R1, NFR-R2 of add-unix-time-converter-tool.
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  converterInput,
  enableToolInSettings,
  NOTATIONS_NAME,
  toolButton,
} from "./converterE2eHelpers";

const { Given, When, Then } = createBdd(test);

Given("the converter tool is enabled", async ({ locationsWorld }) => {
  await enableToolInSettings(locationsWorld.page);
});

When("the user opens the converter tool", async ({ locationsWorld }) => {
  await toolButton(locationsWorld.page).click();
  await expect(converterInput(locationsWorld.page)).toBeVisible();
});

When(
  "the user types {string} into the converter input in the browser",
  async ({ locationsWorld }, text: string) => {
    await converterInput(locationsWorld.page).fill(text);
  },
);

Then(
  "the converter input is focused and its text is selected",
  async ({ locationsWorld }) => {
    const input = converterInput(locationsWorld.page);
    await expect(input).toBeFocused();
    const isSelected = await input.evaluate(
      (node: HTMLInputElement) =>
        node.selectionStart === 0 && node.selectionEnd === node.value.length,
    );
    expect(isSelected).toBe(true);
  },
);

Then(
  "the notation {string} shows {string} in the browser",
  async ({ locationsWorld }, label: string, text: string) => {
    const notations = locationsWorld.page.getByRole("region", {
      name: NOTATIONS_NAME,
    });
    await expect(notations).toContainText(label);
    await expect(notations).toContainText(text);
  },
);

Then(
  "the converter page has no accessibility violations",
  async ({ locationsWorld }) => {
    const scan = await new AxeBuilder({ page: locationsWorld.page }).analyze();
    expect(scan.violations.map(({ id }) => id)).toEqual([]);
  },
);

Then(
  "the converter page does not scroll horizontally",
  async ({ locationsWorld }) => {
    const widths = await locationsWorld.page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
  },
);
