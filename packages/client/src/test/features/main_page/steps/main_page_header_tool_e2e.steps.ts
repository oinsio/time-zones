// Verifies FR4, NFR-R1 of add-unix-time-converter-tool: the header with a tool button.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { MEETING_BAR_SELECTOR } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { seedPreferenceFields } from "../../settings/steps/settingsE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { readThemeColours } from "./themeTokens";

const { Given, Then } = createBdd(test);

const BANNER_ROLE = "banner";
const HEADING_ROLE = "heading";
const BUTTON_ROLE = "button";
const MIN_TARGET_SIZE_PX = 44;
const HEADER_ICON_SIZE_PX = 27;
const HEADER_BUTTON_COUNT = 3;
const UNIX_TIME_CONVERTER_TOOL_ID = "unixTimeConverter";
const SINGLE_LINE_TOLERANCE_PX = 2;

const headerOf = (page: Page) => page.getByRole(BANNER_ROLE);
const headerButton = (page: Page, name: string) =>
  headerOf(page).getByRole(BUTTON_ROLE, { name, exact: true });
const leftEdgeOf = async (part: Locator) => (await requireBox(part)).x;

Given(
  /^the tool "([^"]+)" is enabled$/,
  async ({ locationsWorld }, toolName: string) => {
    expect(toolName).toBe("Конвертер Unix-времени");
    await seedPreferenceFields(
      locationsWorld.page,
      { enabledTools: [UNIX_TIME_CONVERTER_TOOL_ID] },
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

Then(
  /^the header lists the title "([^"]+)" and the three buttons "([^"]+)", "([^"]+)" and "([^"]+)" in this order$/,
  async (
    { locationsWorld },
    title: string,
    first: string,
    second: string,
    third: string,
  ) => {
    const { page } = locationsWorld;
    const parts = [
      headerOf(page).getByRole(HEADING_ROLE, { name: title }),
      ...[first, second, third].map((name) => headerButton(page, name)),
    ];
    await expect(parts[0]).toBeVisible();
    const edges = await Promise.all(parts.map(leftEdgeOf));
    expect(edges).toEqual([...edges].sort((left, right) => left - right));
    expect(new Set(edges).size).toBe(edges.length);
  },
);

Then(
  "the three header buttons show an icon in the accent colour and no visible text, each at least {int} by {int} px",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    expect([minWidth, minHeight]).toEqual([
      MIN_TARGET_SIZE_PX,
      MIN_TARGET_SIZE_PX,
    ]);
    const buttons = headerOf(locationsWorld.page).getByRole(BUTTON_ROLE);
    await expect(buttons).toHaveCount(HEADER_BUTTON_COUNT);
    for (const button of await buttons.all()) {
      expect(await button.innerText()).toBe("");
      await expect(button).toHaveCSS("color", readThemeColours("light").accent);
      const box = await requireBox(button);
      expect(box.width).toBeGreaterThanOrEqual(minWidth);
      expect(box.height).toBeGreaterThanOrEqual(minHeight);
      const iconBox = await requireBox(button.locator("svg"));
      expect(iconBox.width).toBe(HEADER_ICON_SIZE_PX);
    }
  },
);

Then("the title is on one line", async ({ locationsWorld }) => {
  const title = headerOf(locationsWorld.page).getByRole(HEADING_ROLE);
  const lineHeightPx = await title.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).lineHeight),
  );
  const box = await requireBox(title);
  expect(box.height).toBeLessThanOrEqual(
    lineHeightPx + SINGLE_LINE_TOLERANCE_PX,
  );
});

Then(
  "the meeting bar is shown and no header button is named {string}",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    await expect(page.locator(MEETING_BAR_SELECTOR)).toBeVisible();
    await expect(headerButton(page, name)).toHaveCount(0);
  },
);

Then(
  "the header lists the button {string} between {string} and {string}",
  async ({ locationsWorld }, name: string, before: string, after: string) => {
    const { page } = locationsWorld;
    const edges = await Promise.all(
      [before, name, after].map((buttonName) =>
        leftEdgeOf(headerButton(page, buttonName)),
      ),
    );
    expect(edges).toEqual([...edges].sort((left, right) => left - right));
  },
);
