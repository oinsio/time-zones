import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { GNOMISH_FACTORY_LANDING_URL } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { readTokenStyle } from "../../time_selection/steps/timeSelectionE2eHelpers";
import {
  ACCENT_TOKEN,
  ANY_LANGUAGE_BACK_BUTTON_NAME,
  boxOf,
  CENTRE_TOLERANCE_PX,
  COLOR_PROPERTY,
  creditOf,
  creditPopups,
  ENTER_KEY,
  followCredit,
  LINK_ROLE,
  MUTED_FOREGROUND_TOKEN,
  NO_OUTLINE_STYLE,
  OUTLINE_COLOR_PROPERTY,
  readStyle,
  SHIFT_TAB_KEY,
  settingsUrlBeforeCredit,
  UNDERLINE,
} from "./settingsCreditE2eHelpers";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  MIN_OPTION_HEIGHT_PX,
  settingsHeading,
} from "./settingsE2eHelpers";

const { When, Then } = createBdd(test);

// Verifies FR1, FR2, NFR-A1, UX1 of add-gnomish-factory-credit: the first line of the page.
Then(
  "the first line of the settings page is the link {string} to the Gnomish Factory",
  async ({ locationsWorld }, creditText: string) => {
    const credit = locationsWorld.page.getByRole(LINK_ROLE, {
      name: creditText,
      exact: true,
    });
    await expect(credit).toHaveAttribute("href", GNOMISH_FACTORY_LANDING_URL);
  },
);

// Verifies FR1, UX1 of add-gnomish-factory-credit: above the back button and the heading.
Then(
  "the credit stands above the back button and the settings heading",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const credit = await boxOf(creditOf(page));
    const back = await boxOf(
      page.getByRole(BUTTON_ROLE, { name: ANY_LANGUAGE_BACK_BUTTON_NAME }),
    );
    const heading = await boxOf(settingsHeading(page));
    expect(credit.y + credit.height).toBeLessThanOrEqual(back.y);
    expect(credit.y + credit.height).toBeLessThanOrEqual(heading.y);
    expect(
      Math.abs(credit.x + credit.width / 2 - (heading.x + heading.width / 2)),
    ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);
  },
);

// Verifies FR3, UX3 of add-gnomish-factory-credit: a new tab, the app stays.
When(
  "the user follows the Gnomish Factory credit",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    settingsUrlBeforeCredit.set(page, page.url());
    creditPopups.set(
      page,
      await followCredit(page, () => creditOf(page).click()),
    );
  },
);

// Verifies FR3 of add-gnomish-factory-credit: the opened tab shows the landing page.
Then(
  "a new tab opens at the Gnomish Factory landing page",
  async ({ locationsWorld }) => {
    const popup = creditPopups.get(locationsWorld.page);
    if (popup === undefined) throw new Error("no tab was opened");
    await expect(popup).toHaveURL(GNOMISH_FACTORY_LANDING_URL);
  },
);

// Verifies FR3, UX3 of add-gnomish-factory-credit: the settings page stays.
Then("the settings page is still shown", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect(settingsHeading(page)).toBeVisible();
  expect(page.url()).toBe(settingsUrlBeforeCredit.get(page));
});

// Verifies FR3 of add-gnomish-factory-credit: the credit is there offline.
Then(
  "the Gnomish Factory credit is {string}",
  async ({ locationsWorld }, creditText: string) => {
    await expect(creditOf(locationsWorld.page)).toHaveText(creditText);
  },
);

// Verifies FR4, UX2 of add-gnomish-factory-credit: muted colour, underlined.
Then(
  "the credit text has the muted foreground colour and is underlined",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const expected = await readTokenStyle(
      page,
      COLOR_PROPERTY,
      MUTED_FOREGROUND_TOKEN,
    );
    await expect.poll(() => readStyle(page, COLOR_PROPERTY)).toBe(expected);
    expect(await readStyle(page, "text-decoration-line")).toContain(UNDERLINE);
  },
);

// Verifies NFR-A1 of add-gnomish-factory-credit: the credit is reachable by keyboard.
When("the credit gets the keyboard focus", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await page.keyboard.press(SHIFT_TAB_KEY);
  await page.keyboard.press(SHIFT_TAB_KEY);
  await expect(creditOf(page)).toBeFocused();
});

// Verifies FR4, UX2 of add-gnomish-factory-credit: accent colour and focus outline.
Then(
  "the credit text has the accent colour with an accent focus outline",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const expected = await readTokenStyle(page, COLOR_PROPERTY, ACCENT_TOKEN);
    await expect.poll(() => readStyle(page, COLOR_PROPERTY)).toBe(expected);
    const expectedOutline = await readTokenStyle(
      page,
      OUTLINE_COLOR_PROPERTY,
      ACCENT_TOKEN,
    );
    expect(await readStyle(page, OUTLINE_COLOR_PROPERTY)).toBe(expectedOutline);
    expect(await readStyle(page, "outline-style")).not.toBe(NO_OUTLINE_STYLE);
  },
);

// Verifies NFR-A1 of add-gnomish-factory-credit: focus is moved back to the heading before the next keyboard step.
When(
  "the focus returns to the settings heading",
  async ({ locationsWorld }) => {
    await settingsHeading(locationsWorld.page).focus();
  },
);

// Verifies FR4, UX2 of add-gnomish-factory-credit: hover uses the accent colour.
When("the pointer rests on the credit", async ({ locationsWorld }) => {
  await creditOf(locationsWorld.page).hover();
});

// Verifies FR4, UX2 of add-gnomish-factory-credit: the hovered text is in the accent colour.
Then("the credit text has the accent colour", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const expected = await readTokenStyle(page, COLOR_PROPERTY, ACCENT_TOKEN);
  await expect.poll(() => readStyle(page, COLOR_PROPERTY)).toBe(expected);
});

// Verifies NFR-A1, NFR-A2 of add-gnomish-factory-credit: keyboard order.
When("the user presses Shift+Tab", async ({ locationsWorld }) => {
  await locationsWorld.page.keyboard.press(SHIFT_TAB_KEY);
});

// Verifies NFR-A1 of add-gnomish-factory-credit: Shift+Tab from the credit reaches the back button.
Then("the focus is on the back button", async ({ locationsWorld }) => {
  await expect(
    locationsWorld.page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME }),
  ).toBeFocused();
});

// Verifies NFR-A1 of add-gnomish-factory-credit: the credit is a keyboard stop.
Then("the credit has the focus", async ({ locationsWorld }) => {
  await expect(creditOf(locationsWorld.page)).toBeFocused();
});

// Verifies NFR-A1 of add-gnomish-factory-credit: the touch target is at least 44 px.
Then("the credit is at least 44 px high", async ({ locationsWorld }) => {
  const box = await boxOf(creditOf(locationsWorld.page));
  expect(box.height).toBeGreaterThanOrEqual(MIN_OPTION_HEIGHT_PX);
});

// Verifies NFR-A1, FR3 of add-gnomish-factory-credit: Enter follows the credit link.
When("the user presses Enter", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  creditPopups.set(
    page,
    await followCredit(page, () => page.keyboard.press(ENTER_KEY)),
  );
});

// Verifies NFR-R1 of add-gnomish-factory-credit: the text is not cut off.
Then("the credit text is shown in full", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const credit = creditOf(page);
  const { scrollWidth, clientWidth } = await credit.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  const box = await boxOf(credit);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
});
