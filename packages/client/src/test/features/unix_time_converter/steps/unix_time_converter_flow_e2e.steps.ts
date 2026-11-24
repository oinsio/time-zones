// Verifies FR5, FR8, FR12, FR14, FR16, NFR-A2 of add-unix-time-converter-tool: the converter in a real browser.
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { Temporal } from "@/lib/temporal";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow } from "../../locations/steps/locationsE2eHelpers";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
} from "../../settings/steps/settingsE2eHelpers";
import {
  COPIED_TEXT,
  COPY_SECONDS_NAME,
  converterInput,
  MOSCOW_CITY,
  moscowTime,
  notationsOf,
  nowButton,
  SHOW_ON_MAIN_PAGE_NAME,
  toolButton,
  toolHeading,
} from "./converterE2eHelpers";

const { When, Then } = createBdd(test);

const CLIPBOARD_PERMISSIONS = ["clipboard-read", "clipboard-write"];
const ESCAPE_KEY = "Escape";
const LIVE_TOLERANCE_SECONDS = 120;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_ONLY_TIME_PATTERN = /^\d{10}$/;

Then(
  "the Moscow row shows {string} in the browser",
  async ({ locationsWorld }, time: string) => {
    await expect(moscowTime(locationsWorld.page)).toHaveText(time);
  },
);

When(
  "the user chooses the copy action of Seconds in the browser",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.context().grantPermissions(CLIPBOARD_PERMISSIONS);
    await page.getByRole(BUTTON_ROLE, { name: COPY_SECONDS_NAME }).click();
  },
);

Then(
  "the clipboard holds {string} and the copy is announced",
  async ({ locationsWorld }, text: string) => {
    const { page } = locationsWorld;
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      text,
    );
    await expect(notationsOf(page).getByText(COPIED_TEXT)).toBeAttached();
  },
);

When(
  "the user goes back to the main page from the tool",
  async ({ locationsWorld }) => {
    await locationsWorld.page
      .getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME })
      .click();
  },
);

When("the user opens the converter tool again", async ({ locationsWorld }) => {
  await toolButton(locationsWorld.page).click();
  await expect(converterInput(locationsWorld.page)).toBeVisible();
});

Then(
  "the converter input shows {string} in the browser and the moment is pinned",
  async ({ locationsWorld }, text: string) => {
    await expect(converterInput(locationsWorld.page)).toHaveValue(text);
    await expect(nowButton(locationsWorld.page)).toBeEnabled();
  },
);

When(
  "the app is reloaded and the converter is opened",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.reload();
    await toolButton(page).click();
    await expect(converterInput(page)).toBeVisible();
  },
);

Then(
  "the converter input shows the current Unix time and the moment is live",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(nowButton(page)).toBeDisabled();
    const shownText = await converterInput(page).inputValue();
    expect(shownText).toMatch(SECONDS_ONLY_TIME_PATTERN);
    const currentSeconds =
      Temporal.Now.instant().epochMilliseconds / MILLISECONDS_PER_SECOND;
    expect(Math.abs(Number(shownText) - currentSeconds)).toBeLessThan(
      LIVE_TOLERANCE_SECONDS,
    );
  },
);

When("the user chooses Show on main page", async ({ locationsWorld }) => {
  await locationsWorld.page
    .getByRole(BUTTON_ROLE, { name: SHOW_ON_MAIN_PAGE_NAME })
    .click();
});

Then(
  "the main page shows the {word} card at {string} and the focus is on the tool button",
  async ({ locationsWorld }, city: string, time: string) => {
    const { page } = locationsWorld;
    expect(city).toBe(MOSCOW_CITY);
    await expect(toolHeading(page)).toBeHidden();
    await expect(listRow(page, city)).toContainText(time);
    await expect(toolButton(page)).toBeFocused();
  },
);

When(
  "the user starts a time in the Moscow row and presses Esc",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await moscowTime(page).click();
    const field = page.getByRole("textbox", {
      name: /^(Время|Time) — Moscow,/,
    });
    await field.fill("9");
    await page.keyboard.press(ESCAPE_KEY);
  },
);

Then(
  "the time field is closed and the converter page is still shown",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(
      page.getByRole("textbox", { name: /^(Время|Time) — Moscow,/ }),
    ).toHaveCount(0);
    await expect(toolHeading(page)).toBeVisible();
  },
);

When("the user presses Esc again", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press(ESCAPE_KEY);
});

Then(
  "the main page is shown without the converter",
  async ({ locationsWorld }) => {
    await expect(toolHeading(locationsWorld.page)).toBeHidden();
    await expect(toolButton(locationsWorld.page)).toBeVisible();
  },
);
