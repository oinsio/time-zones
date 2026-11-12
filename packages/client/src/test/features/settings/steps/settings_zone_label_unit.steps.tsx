// Verifies FR12, FR13, FR14, FR15, FR16, UX2, M4, M6 of show-zone-abbreviations-and-zone-label-setting.
// Verifies FR1, FR2, FR3, FR5, FR6, UX1, UX2, M1, M2 of add-country-to-zone-label.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, vi } from "vitest";
import { SettingsToggleGroup } from "@/app/settings";
import type { ZONE_LABEL_PART_NAMES } from "../../locations/steps/zoneLineWorld";
import { createZoneLabelWorld } from "./zoneLabelWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_zone_label_unit.feature");
const ELEMENT_SEPARATOR = ", ";
const UTC_OFFSET_TOGGLE = "UTC offset";
const COUNTRY_TOGGLE = "Country";
const ABBREVIATION_TOGGLE = "Abbreviation";
const CITY_ONLY_TEXTS = ["City only", "Только город"];
const SAMPLE_OPTIONS = ["A", "B", "C"].map((name) => ({
  value: name,
  label: name,
}));

type PartsName = keyof typeof ZONE_LABEL_PART_NAMES;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLabelWorld();
  let reportedToggles: [string, boolean][] = [];

  const SampleGroup = () => {
    const [selectedValues, setSelectedValues] = useState(["B"]);
    return (
      <SettingsToggleGroup
        caption="Sample"
        options={SAMPLE_OPTIONS}
        selectedValues={selectedValues}
        onToggle={(value, isSelected) => {
          reportedToggles.push([value, isSelected]);
          setSelectedValues(
            isSelected
              ? [...selectedValues, value]
              : selectedValues.filter((other) => other !== value),
          );
        }}
      />
    );
  };
  const sampleToggle = (name: string) => screen.getByRole("button", { name });

  f.BeforeEachScenario(async () => {
    await world.reset();
    reportedToggles = [];
  });
  f.AfterAllScenarios(world.finish);

  const givenNoPreferences = () => localStorage.clear();
  const givenLanguage = (_ctx: unknown, language: string) =>
    world.setLanguage(language);
  const givenList = (_ctx: unknown, city: string) => world.setList(city);
  const openSettings = () => {
    world.openTab();
  };
  const expectExample = (_ctx: unknown, example: string) =>
    expect(world.exampleOf()).toEqual(
      CITY_ONLY_TEXTS.includes(example) ? [] : example.split(ELEMENT_SEPARATOR),
    );

  // @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14
  // @polish-settings-and-remove-offline-update-notice @FR3 @FR4 @UX1 @M1
  // @add-country-to-zone-label @FR1 @FR2 @UX1
  f.Scenario("Both parts by default", ({ Given, And, When, Then }) => {
    Given("no preferences are stored", givenNoPreferences);
    And("the interface language is {string}", givenLanguage);
    When("the user opens the settings", openSettings);
    Then(
      "the {string}, {string} and {string} toggles are on, in this order",
      (_ctx, first: string, second: string, third: string) =>
        expect(world.pressedToggleNames()).toEqual([first, second, third]),
    );
    And("the example shows {string}", expectExample);
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14 @M4
  // @add-country-to-zone-label @FR5 @M1
  f.ScenarioOutline(
    "The example follows the toggles",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is {string}", () =>
        givenLanguage(undefined, variables.language),
      );
      And("the stored zone label is {string}", () =>
        world.storeZoneLabel(variables.parts as PartsName),
      );
      When("the user opens the settings", openSettings);
      Then("the example shows {string}", () =>
        expectExample(undefined, variables.example),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR13 @add-country-to-zone-label @FR3
  f.Scenario("Both off leaves the country", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the interface language is {string}", givenLanguage);
    When("the user opens the settings", openSettings);
    And("the user turns both toggles off", async () => {
      await world.toggle(UTC_OFFSET_TOGGLE);
      await world.toggle(ABBREVIATION_TOGGLE);
    });
    Then(
      "the {string} row's zone line is {string}",
      (_ctx, city: string, zoneLine: string) =>
        expect(world.rowZoneLine(city)).toEqual([zoneLine]),
    );
  });

  // @add-country-to-zone-label @FR3 @UX2
  f.Scenario("All off leaves the city alone", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the interface language is {string}", givenLanguage);
    When("the user opens the settings", openSettings);
    And("the user turns all three toggles off", async () => {
      await world.toggle(COUNTRY_TOGGLE);
      await world.toggle(ABBREVIATION_TOGGLE);
      await world.toggle(UTC_OFFSET_TOGGLE);
    });
    Then(
      "the {string} row shows its city and no zone line",
      (_ctx, city: string) => {
        expect(world.rowZoneLine(city)).toEqual([]);
        expect(world.rowText(city)).toContain(city);
      },
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR16
  f.Scenario("A group with three options", ({ Given, When, Then, And }) => {
    Given(
      "a toggle group with the caption {string} and the options {string}, {string} and {string}, of which {string} is on",
      () => {
        cleanup();
        render(<SampleGroup />);
      },
    );
    When("the user turns {string} on", (_ctx, name: string) =>
      userEvent.click(sampleToggle(name)),
    );
    Then("the group reports that {string} is now on", (_ctx, name: string) =>
      expect(reportedToggles).toEqual([[name, true]]),
    );
    And(
      "{string} stays on and {string} stays off",
      (_ctx, onName: string, offName: string) => {
        expect(sampleToggle(onName)).toHaveAttribute("aria-pressed", "true");
        expect(sampleToggle(offName)).toHaveAttribute("aria-pressed", "false");
      },
    );
  });
});
