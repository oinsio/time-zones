import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  dateBarOf,
  HEADING_ROLE,
  MIN_OPTION_HEIGHT_PX,
  openSettings,
  optionOf,
  RADIO_ROLE,
  RADIOGROUP_ROLE,
  settingsButton,
  settingsHeading,
} from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const ENGLISH_LANGUAGE = "en";
// Verifies FR1 of add-settings-page-and-device-time-location: opening the settings.
Given("the user opens the settings", async ({ locationsWorld }) => {
  await openSettings(locationsWorld.page);
});

When(
  "the user opens the settings, chooses the option {string} and goes back",
  async ({ locationsWorld }, optionName: string) => {
    const { page } = locationsWorld;
    await openSettings(page);
    await optionOf(page, optionName).check({ force: true });
    await page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME }).click();
  },
);

When("the user goes back from the settings", async ({ locationsWorld }) => {
  await locationsWorld.page
    .getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME })
    .click();
});

Then("the date bar is not shown", async ({ locationsWorld }) => {
  await expect(dateBarOf(locationsWorld.page)).toHaveCount(0);
});

Then("the date bar is shown", async ({ locationsWorld }) => {
  await expect(dateBarOf(locationsWorld.page)).toBeVisible();
});

Then("the focus is on the settings heading", async ({ locationsWorld }) => {
  await expect(settingsHeading(locationsWorld.page)).toBeFocused();
});

Then("the focus is on the settings button", async ({ locationsWorld }) => {
  await expect(settingsButton(locationsWorld.page)).toBeFocused();
});

// Verifies FR3, NFR-A1 of add-settings-page-and-device-time-location: arrow keys move the choice.
When(
  "the user focuses the {string} option and presses {string}",
  async ({ locationsWorld }, optionName: string, key: string) => {
    await optionOf(locationsWorld.page, optionName).focus();
    await locationsWorld.page.keyboard.press(key);
  },
);

When(
  "the user chooses the option {string}",
  async ({ locationsWorld }, optionName: string) => {
    await optionOf(locationsWorld.page, optionName).check({ force: true });
  },
);

Then(
  "the option {string} is checked",
  async ({ locationsWorld }, optionName: string) => {
    await expect(optionOf(locationsWorld.page, optionName)).toBeChecked();
  },
);

Then(
  "the option {string} is not checked",
  async ({ locationsWorld }, optionName: string) => {
    await expect(optionOf(locationsWorld.page, optionName)).not.toBeChecked();
  },
);

Then(
  "the option {string} of the group {string} is checked",
  async ({ locationsWorld }, optionName: string, groupName: string) => {
    const group = locationsWorld.page.getByRole(RADIOGROUP_ROLE, {
      name: groupName,
    });
    await expect(
      group.getByRole(RADIO_ROLE, { name: optionName }),
    ).toBeChecked();
  },
);

Then(
  /^the options (.+) are named in the group "(.+)"$/,
  async ({ locationsWorld }, quotedNames: string, groupName: string) => {
    const optionNames = [...quotedNames.matchAll(/"([^"]+)"/g)].map(
      (match) => match[1],
    );
    const group = locationsWorld.page.getByRole(RADIOGROUP_ROLE, {
      name: groupName,
    });
    for (const optionName of optionNames) {
      await expect(
        group.getByRole(RADIO_ROLE, { name: optionName }),
      ).toHaveCount(1);
    }
  },
);

// Verifies FR16 of add-settings-page-and-device-time-location: both languages.
Then(
  "the settings heading is {string}",
  async ({ locationsWorld }, heading: string) => {
    await expect(
      locationsWorld.page.getByRole(HEADING_ROLE, { name: heading }),
    ).toBeVisible();
  },
);

// Verifies FR13 of add-interface-language-selection: the language group is named too.
Then(
  "the groups are named {string}, {string} and {string}",
  async (
    { locationsWorld },
    themeName: string,
    hourFormatName: string,
    languageGroupName: string,
  ) => {
    for (const groupName of [themeName, hourFormatName]) {
      await expect(
        locationsWorld.page.getByRole(RADIOGROUP_ROLE, { name: groupName }),
      ).toBeVisible();
    }
    await expect(
      locationsWorld.page.getByRole("group", { name: languageGroupName }),
    ).toBeVisible();
  },
);

// Verifies NFR-R1 of add-settings-page-and-device-time-location: widths 320 and 2560.
Then(
  "the settings page needs no horizontal scrolling",
  async ({ locationsWorld }) => {
    const { scrollWidth, clientWidth } = await locationsWorld.page.evaluate(
      () => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }),
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  },
);

Then(
  "every settings option is at least {int} px high",
  async ({ locationsWorld }, minHeight: number) => {
    expect(minHeight).toBe(MIN_OPTION_HEIGHT_PX);
    const labels = locationsWorld.page.locator("label").filter({
      has: locationsWorld.page.getByRole(RADIO_ROLE),
    });
    for (const label of await labels.all()) {
      const box = await label.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight);
    }
  },
);

Given(
  "the locations interface language is English",
  async ({ locationsWorld }) => {
    await locationsWorld.seedLanguage(ENGLISH_LANGUAGE);
  },
);
