// Verifies FR4, FR5, FR7 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createSettingsWorld } from "./settingsWorld";

const feature = await loadFeature("../settings_preferences_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSettingsWorld();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-settings-page-and-device-time-location @FR4
  f.Scenario("Default is System", ({ Given, When, Then }) => {
    Given("no preferences are stored", world.givenNoPreferencesStored);
    When("the user opens the settings", () => {
      world.openPage();
    });
    Then("the theme option {string} is checked", (_ctx, name: string) =>
      world.expectThemeChecked(name),
    );
  });

  // @add-settings-page-and-device-time-location @FR5
  f.Scenario("Default is 24-hour", ({ Given, When, Then }) => {
    Given("no preferences are stored", world.givenNoPreferencesStored);
    When("the user opens the settings", () => {
      world.openPage();
    });
    Then("the hour format option {string} is checked", (_ctx, name: string) =>
      world.expectHourFormatChecked(name),
    );
  });

  // @add-settings-page-and-device-time-location @FR7
  f.Scenario("Opening writes nothing", ({ Given, When, Then }) => {
    Given("no preferences are stored", world.givenNoPreferencesStored);
    When(
      "the user opens the app and the settings page and changes nothing",
      () => {
        const opened = world.openPage();
        world.runPendingWrite(opened);
      },
    );
    Then("no preferences document is stored", () =>
      expect(world.storedDocument()).toBeNull(),
    );
  });
});
