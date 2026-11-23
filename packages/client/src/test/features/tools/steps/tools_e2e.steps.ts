// Verifies FR2, FR3, FR5, NFR-A1, NFR-R1 of add-unix-time-converter-tool.
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  openSettings,
  SETTINGS_BUTTON_NAME,
  settingsHeading,
} from "../../settings/steps/settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const TOOL_NAME = /^(Unix time converter|Конвертер Unix-времени)$/;
const ADD_LOCATION_NAME = /^(Add location|Добавить место)$/;
const MIN_TARGET_PX = 44;
const MAX_TAB_PRESSES = 40;
const TAB_KEY = "Tab";
const ESCAPE_KEY = "Escape";
const DATE_BAR_NAME = /^(Date|Дата)$/;
const PRESSED_ATTRIBUTE = "aria-pressed";

const toolButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: TOOL_NAME });
const backButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME });
const goBack = async (page: Page) => {
  await backButton(page).click();
  await expect(settingsHeading(page)).toBeHidden();
};

Given("the tool is enabled", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await openSettings(page);
  await toolButton(page).click();
  await goBack(page);
});

Then("the tool toggle is not pressed", async ({ locationsWorld }) => {
  await expect(toolButton(locationsWorld.page)).toHaveAttribute(
    PRESSED_ATTRIBUTE,
    "false",
  );
});

When("the user turns on the tool toggle", async ({ locationsWorld }) => {
  await toolButton(locationsWorld.page).click();
});

Then("the tool toggle is pressed", async ({ locationsWorld }) => {
  await expect(toolButton(locationsWorld.page)).toHaveAttribute(
    PRESSED_ATTRIBUTE,
    "true",
  );
});

When("the user goes back to the main page", async ({ locationsWorld }) => {
  await goBack(locationsWorld.page);
});

Then("the header shows the tool button", async ({ locationsWorld }) => {
  await expect(toolButton(locationsWorld.page)).toBeVisible();
});

When(
  "the user opens the settings and turns the tool toggle off and goes back",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME }).click();
    await toolButton(page).click();
    await goBack(page);
  },
);

Then("the header shows no tool button", async ({ locationsWorld }) => {
  await expect(toolButton(locationsWorld.page)).toHaveCount(0);
});

When("the app is opened again", async ({ locationsWorld }) => {
  await locationsWorld.page.reload();
});

When("the user chooses the tool button", async ({ locationsWorld }) => {
  await toolButton(locationsWorld.page).click();
});

Then(
  "the tool page heading is shown and the date bar is not",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(page.getByRole("heading", { name: TOOL_NAME })).toBeVisible();
    await expect(page.getByRole("group", { name: DATE_BAR_NAME })).toHaveCount(
      0,
    );
  },
);

When(
  /^the user leaves the tool page with (the back button|Esc)$/,
  async ({ locationsWorld }, way: string) => {
    const { page } = locationsWorld;
    if (way === "Esc") await page.keyboard.press(ESCAPE_KEY);
    else await backButton(page).click();
  },
);

Then(
  "the main page is shown and the focus is on the tool button",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(
      page.getByRole("group", { name: DATE_BAR_NAME }),
    ).toBeVisible();
    await expect(toolButton(page)).toBeFocused();
  },
);

When(
  "the user presses Tab until the Add location button is focused",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const addButton = page.getByRole(BUTTON_ROLE, { name: ADD_LOCATION_NAME });
    for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount += 1) {
      await page.keyboard.press(TAB_KEY);
      if (await addButton.evaluate((node) => node === document.activeElement))
        return;
    }
    throw new Error("the Add location button never received the focus");
  },
);

Then(
  "the next three stops are the tool button and the settings button",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.keyboard.press(TAB_KEY);
    await expect(toolButton(page)).toBeFocused();
    await page.keyboard.press(TAB_KEY);
    await expect(
      page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME }),
    ).toBeFocused();
  },
);

Then(
  "the tool toggle and the tool button are at least 44 by 44 px",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const toggleBox = await toolButton(page).boundingBox();
    expect(toggleBox?.width ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    expect(toggleBox?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    await goBack(page);
    const buttonBox = await toolButton(page).boundingBox();
    expect(buttonBox?.width ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    await page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME }).click();
  },
);

Then(
  "the locations screen has no accessibility violations on the tools pages",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const settingsScan = await new AxeBuilder({ page }).analyze();
    await goBack(page);
    const mainScan = await new AxeBuilder({ page }).analyze();
    expect(
      [...settingsScan.violations, ...mainScan.violations].map(({ id }) => id),
    ).toEqual([]);
  },
);

Then(
  "the page does not scroll horizontally and the header buttons are fully visible",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
    for (const name of [ADD_LOCATION_NAME, TOOL_NAME, SETTINGS_BUTTON_NAME]) {
      const box = await page.getByRole(BUTTON_ROLE, { name }).boundingBox();
      expect(box).not.toBeNull();
      expect((box?.x ?? -1) + (box?.width ?? 0)).toBeLessThanOrEqual(
        widths.clientWidth,
      );
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    }
  },
);
