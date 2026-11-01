import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { BUTTON_ROLE, RADIOGROUP_ROLE } from "./settingsE2eHelpers";
import {
  languageButton,
  languageGroup,
  languageList,
  requireBox,
  THEME_GROUP_NAME,
} from "./settingsLanguageE2eHelpers";

const { Then } = createBdd(test);

const MIN_ROW_HEIGHT_PX = 44;
const WIDTH_TOLERANCE_PX = 1;

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
