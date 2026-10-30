// Verifies FR7 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";
import { HourFormat, ThemePreference } from "@/preferences";
import { createSettingsWorld } from "./settingsWorld";

const feature = await loadFeature("../settings_storage_unit.feature");
const DEFAULT_THEME_OPTION = "System";
const DEFAULT_HOUR_FORMAT_OPTION = "24-hour";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSettingsWorld();
  const expectNoteShown = (key: string) =>
    expect(world.note(key)).toBeInTheDocument();
  const expectNoNote = (key: string) =>
    expect(world.note(key)).not.toBeInTheDocument();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario("Corrupted preferences", ({ Given, When, Then, And }) => {
    Given(
      "the stored preferences document is not valid JSON",
      world.givenCorruptedPreferences,
    );
    When("the user opens the app and the settings page", () => {
      world.openPage();
    });
    Then("the main page was shown with the default preferences", () => {
      world.expectThemeChecked(DEFAULT_THEME_OPTION);
      world.expectHourFormatChecked(DEFAULT_HOUR_FORMAT_OPTION);
    });
    And("the settings page shows the note with a Reset action", () => {
      expectNoteShown("settings.unreadable");
      expect(world.resetButton()).toBeVisible();
    });
  });

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario("Reset", ({ Given, When, Then, And }) => {
    Given("the note about unreadable settings is shown", () => {
      world.givenCorruptedPreferences();
      world.openPage();
      expectNoteShown("settings.unreadable");
    });
    When("the user resets", () => userEvent.click(world.resetButton()));
    Then("no preferences document is stored", () =>
      expect(world.storedDocument()).toBeNull(),
    );
    And("the note is not shown", () => expectNoNote("settings.unreadable"));
  });

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario("Storage unavailable", ({ Given, When, Then, And }) => {
    Given("storage is unavailable", world.givenStorageUnavailable);
    When("the user chooses the hour format {string}", async (_ctx, name) => {
      world.openPage();
      await world.chooseHourFormat(name);
      world.runPendingWrite();
    });
    Then("the hour format {string} is in force", (_ctx, name: string) =>
      world.expectHourFormatChecked(name),
    );
    And("the settings page says changes will not be saved", () =>
      expectNoteShown("settings.saveFailed"),
    );
  });

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario(
    "Choices are written after the debounce",
    ({ Given, When, Then, And }) => {
      Given("no preferences are stored", world.givenNoPreferencesStored);
      When(
        "the user chooses the theme {string} and the hour format {string}",
        async (_ctx, theme: string, hourFormat: string) => {
          world.openPage();
          await world.chooseTheme(theme);
          await world.chooseHourFormat(hourFormat);
        },
      );
      Then("nothing is stored until the pending write runs", () =>
        expect(world.storedDocument()).toBeNull(),
      );
      And(
        "then the stored document holds the theme Dark and the hour format 12-hour",
        () => {
          world.runPendingWrite();
          expect(JSON.parse(world.storedDocument() ?? "{}").payload).toEqual({
            theme: ThemePreference.DARK,
            hourFormat: HourFormat.H12,
          });
        },
      );
    },
  );

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario("Another tab changes the hour format", ({ Given, When, Then }) => {
    Given("the app is open in two tabs", () => {
      world.givenTwoTabs();
      world.openPage();
      world.openPage();
    });
    When(
      "the user chooses the hour format {string} in the first tab",
      async (_ctx, name: string) => {
        const [firstTab] = world.openedPages();
        await world.chooseHourFormat(name, firstTab.container);
        world.runPendingWrite(firstTab);
      },
    );
    Then(
      "the second tab shows the hour format {string} without a reload",
      (_ctx, name: string) => {
        const [, secondTab] = world.openedPages();
        world.expectHourFormatChecked(name, secondTab.container);
      },
    );
  });
});
