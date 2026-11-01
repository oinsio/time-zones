import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { STORAGE_KEYS } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { BUTTON_ROLE, RADIOGROUP_ROLE } from "./settingsE2eHelpers";

const { When, Then } = createBdd(test);

const GROUP_ROLE = "group";
const LIST_ROLE = "list";
const LANGUAGE_GROUP_NAME = /^(Language|Язык)$/;
const LANGUAGE_BUTTON_NAME = /^(Language|Язык): /;
const HOUR_FORMAT_GROUP_NAME = /^(Hour format|Формат времени)$/;
const THEME_GROUP_NAME = /^(Theme|Тема)$/;
const MIN_ROW_HEIGHT_PX = 44;
const WIDTH_TOLERANCE_PX = 1;
const COLLAPSED = "collapsed";

const languageGroup = (page: Page) =>
  page.getByRole(GROUP_ROLE, { name: LANGUAGE_GROUP_NAME });
const languageButton = (page: Page) =>
  languageGroup(page).getByRole(BUTTON_ROLE, { name: LANGUAGE_BUTTON_NAME });
const languageList = (page: Page) => page.getByRole(LIST_ROLE);
const requireBox = async (locator: ReturnType<Page["locator"]>) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
};
/** Text without spacing: the gap between emoji and name comes from CSS, not from the text. */
const compactText = (text: string | null) => (text ?? "").replace(/\s+/g, "");
const visibleText = async (locator: ReturnType<Page["locator"]>) =>
  compactText(await locator.textContent());

// Verifies FR1, FR2 of add-interface-language-selection.
Then(
  "the language group follows the hour format group",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const hourFormatBox = await requireBox(
      page.getByRole(RADIOGROUP_ROLE, { name: HOUR_FORMAT_GROUP_NAME }),
    );
    const languageBox = await requireBox(languageGroup(page));
    expect(languageBox.y).toBeGreaterThanOrEqual(
      hourFormatBox.y + hourFormatBox.height,
    );
  },
);

// Verifies FR2, FR11 of add-interface-language-selection: the emoji is asserted as text.
Then(
  "the language button reads {string}",
  async ({ locationsWorld }, expectedText: string) => {
    const text = await visibleText(languageButton(locationsWorld.page));
    expect(text).toBe(compactText(expectedText));
  },
);

Then("no language list is shown", async ({ locationsWorld }) => {
  await expect(languageList(locationsWorld.page)).toHaveCount(0);
});

When("the user expands the language group", async ({ locationsWorld }) => {
  await languageButton(locationsWorld.page).click();
  await expect(languageList(locationsWorld.page)).toBeVisible();
});

When("the user activates the language button", async ({ locationsWorld }) => {
  await languageButton(locationsWorld.page).click();
});

When("the user focuses the language button", async ({ locationsWorld }) => {
  await languageButton(locationsWorld.page).focus();
});

When(
  "the language group is {word}",
  async ({ locationsWorld }, state: string) => {
    if (state !== COLLAPSED) {
      await languageButton(locationsWorld.page).click();
      await expect(languageList(locationsWorld.page)).toBeVisible();
    }
  },
);

// Verifies FR3 of add-interface-language-selection.
Then(
  "the language rows read {string} and {string}",
  async ({ locationsWorld }, firstRow: string, secondRow: string) => {
    const rows = languageList(locationsWorld.page).getByRole(BUTTON_ROLE);
    const rowTexts = await rows.allTextContents();
    expect(rowTexts.map(compactText)).toEqual(
      [firstRow, secondRow].map(compactText),
    );
  },
);

// Verifies FR4 of add-interface-language-selection.
Then(
  "{string} is marked as chosen",
  async ({ locationsWorld }, name: string) => {
    const row = languageList(locationsWorld.page).getByRole(BUTTON_ROLE, {
      name,
    });
    await expect(row).toHaveAttribute("aria-current", "true");
    await expect(row).toHaveClass(/border-accent/);
  },
);

// Verifies UX2 of add-interface-language-selection: the list sits in the page flow under the button.
Then(
  "the language list sits right under the language button",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const buttonBox = await requireBox(languageButton(page));
    const listBox = await requireBox(languageList(page));
    expect(listBox.y).toBeGreaterThanOrEqual(buttonBox.y + buttonBox.height);
  },
);

// Verifies FR5, M2, UX3 of add-interface-language-selection: no reload, no scroll jump.
When(
  "the user chooses the language {string} and counts the page navigations",
  async ({ locationsWorld }, name: string) => {
    const { page } = locationsWorld;
    await languageButton(page).click();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    let navigationCount = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigationCount += 1;
    });
    // A DOM click: Playwright's own scroll-into-view would move the page, not the app.
    await languageList(page)
      .getByRole(BUTTON_ROLE, { name })
      .evaluate((row) => (row as HTMLElement).click());
    await expect(languageList(page)).toHaveCount(0);
    locationsWorld.languageChoice = {
      navigationCount,
      scrollBefore,
      scrollAfter: await page.evaluate(() => window.scrollY),
    };
  },
);

Then(
  "the page did not navigate and did not scroll",
  async ({ locationsWorld }) => {
    expect(locationsWorld.languageChoice).toEqual({
      navigationCount: 0,
      scrollBefore: locationsWorld.languageChoice?.scrollBefore,
      scrollAfter: locationsWorld.languageChoice?.scrollBefore,
    });
  },
);

Then(
  "the locations document title reads {string}",
  async ({ locationsWorld }, title: string) => {
    await expect(locationsWorld.page).toHaveTitle(title);
  },
);

// Verifies FR8 of add-interface-language-selection: the legacy key is read without a write.
Then("no preferences document is stored", async ({ locationsWorld }) => {
  const storedDocument = await locationsWorld.page.evaluate(
    (key) => window.localStorage.getItem(key),
    STORAGE_KEYS.PREFERENCES,
  );
  expect(storedDocument).toBeNull();
});

// Verifies NFR-A1 of add-interface-language-selection.
Then(
  "the language button is named {string} and {word}",
  async ({ locationsWorld }, name: string, state: string) => {
    const button = locationsWorld.page.getByRole(BUTTON_ROLE, {
      name,
      exact: true,
    });
    await expect(button).toHaveAttribute(
      "aria-expanded",
      state === COLLAPSED ? "false" : "true",
    );
  },
);

// Verifies NFR-A2 of add-interface-language-selection.
Then("the focus is on the language button", async ({ locationsWorld }) => {
  await expect(languageButton(locationsWorld.page)).toBeFocused();
});

// Verifies NFR-A3 of add-interface-language-selection: touch targets.
Then(
  "the language button and every row are at least {int} px high",
  async ({ locationsWorld }, minHeight: number) => {
    expect(minHeight).toBe(MIN_ROW_HEIGHT_PX);
    const { page } = locationsWorld;
    const targets = [
      languageButton(page),
      ...(await languageList(page).getByRole(BUTTON_ROLE).all()),
    ];
    for (const target of targets) {
      expect((await requireBox(target)).height).toBeGreaterThanOrEqual(
        minHeight,
      );
    }
  },
);

// Verifies NFR-R1 of add-interface-language-selection.
Then(
  "the language group is as wide as the theme group",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const themeBox = await requireBox(
      page.getByRole(RADIOGROUP_ROLE, { name: THEME_GROUP_NAME }),
    );
    const languageBox = await requireBox(languageGroup(page));
    expect(Math.abs(languageBox.width - themeBox.width)).toBeLessThanOrEqual(
      WIDTH_TOLERANCE_PX,
    );
  },
);
