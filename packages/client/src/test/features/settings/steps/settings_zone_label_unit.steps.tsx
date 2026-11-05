// Verifies FR12, FR13, FR14, FR15, FR16, UX2, M4, M6 of show-zone-abbreviations-and-zone-label-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { useState } from "react";
import { expect, vi } from "vitest";
import { SettingsToggleGroup } from "@/app/settings";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { ZoneLabelPart } from "@/preferences";
import { ZONE_LABEL_PART_NAMES } from "../../locations/steps/zoneLineWorld";
import { createZoneLabelWorld } from "./zoneLabelWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_zone_label_unit.feature");
const ELEMENT_SEPARATOR = ", ";
const UTC_OFFSET_TOGGLE = "UTC offset";
const ABBREVIATION_TOGGLE = "Abbreviation";
const LEGACY_SCHEMA_VERSION = PREFERENCES_SCHEMA_VERSION - 1;
const THEME_STORED_VALUES: Record<string, string> = { Dark: "DARK" };
const HOUR_FORMAT_STORED_VALUES: Record<string, string> = {
  "12-hour": "H12",
};
const THEME_LABEL_KEYS: Record<string, string> = { Dark: "settings.themeDark" };
const HOUR_FORMAT_LABEL_KEYS: Record<string, string> = {
  "12-hour": "settings.hourFormat12",
};
const SAMPLE_OPTIONS = ["A", "B", "C"].map((name) => ({
  value: name,
  label: name,
}));

type PartsName = keyof typeof ZONE_LABEL_PART_NAMES;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLabelWorld();
  let legacyDocumentText = "";
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
  const expectZoneLabel = (_ctx: unknown, partsName: string) =>
    expect(world.shownZoneLabel()).toBe(partsName);
  const expectExample = (_ctx: unknown, example: string) =>
    expect(world.exampleOf()).toEqual(example.split(ELEMENT_SEPARATOR));

  // @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14
  f.Scenario("Both parts by default", ({ Given, And, When, Then }) => {
    Given("no preferences are stored", givenNoPreferences);
    And("the interface language is {string}", givenLanguage);
    When("the user opens the settings", openSettings);
    Then("the zone label shows {string}", expectZoneLabel);
    And("the example shows {string}", expectExample);
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14 @M4
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

  // @show-zone-abbreviations-and-zone-label-setting @FR13
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

  // @show-zone-abbreviations-and-zone-label-setting @FR15
  f.Scenario(
    "A toggle writes the preferences once",
    ({ Given, When, And, Then }) => {
      Given("no preferences are stored", givenNoPreferences);
      When("the user opens the settings", openSettings);
      And("the user turns the zone abbreviation off", () =>
        world.toggle(ABBREVIATION_TOGGLE),
      );
      Then(
        "the stored preferences document holds the zone label with the UTC offset only, after the debounce",
        () => {
          expect(world.storedText()).toBeNull();
          world.runPendingWrite();
          expect(world.storedZoneLabelParts()).toEqual([
            ZoneLabelPart.UTC_OFFSET,
          ]);
        },
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR15
  f.Scenario(
    "The zone label survives a reload",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the user turned the zone abbreviation off", async () => {
        world.openTab();
        await world.toggle(ABBREVIATION_TOGGLE);
        world.runPendingWrite();
        world.closeTabs();
      });
      When("the app is opened again", openSettings);
      Then("the zone label shows {string}", expectZoneLabel);
      And(
        "no location row shows a zone abbreviation from the first render",
        () => expect(world.allRowsZoneLines().flat()).not.toContain("MSK"),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR15 @M6
  f.Scenario("Existing users get both parts", ({ Given, When, Then, And }) => {
    Given(
      "the stored preferences document was written before the zone label existed, with the theme {string}, the hour format {string} and the language {string}",
      (_ctx, theme: string, hourFormat: string, language: string) => {
        legacyDocumentText = JSON.stringify({
          schemaVersion: LEGACY_SCHEMA_VERSION,
          payload: {
            theme: THEME_STORED_VALUES[theme],
            hourFormat: HOUR_FORMAT_STORED_VALUES[hourFormat],
            interfaceLanguage: language,
          },
        });
        world.storeRaw(legacyDocumentText);
      },
    );
    When("the user opens the settings", openSettings);
    Then("the zone label shows {string}", expectZoneLabel);
    And(
      "the theme {string}, the hour format {string} and the language {string} are in force",
      (_ctx, theme: string, hourFormat: string, language: string) => {
        expect(
          screen.getByRole("radio", { name: i18n.t(THEME_LABEL_KEYS[theme]) }),
        ).toBeChecked();
        expect(
          screen.getByRole("radio", {
            name: i18n.t(HOUR_FORMAT_LABEL_KEYS[hourFormat]),
          }),
        ).toBeChecked();
        // The app shell applies the language (see the language storage scenarios); the stored document keeps it.
        expect(world.storedText()).toContain(
          `"interfaceLanguage":"${language}"`,
        );
      },
    );
    And(
      "the stored document is not rewritten until the user changes a setting",
      () => {
        world.runPendingWrite();
        expect(world.storedText()).toBe(legacyDocumentText);
      },
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR15
  f.Scenario(
    "Another tab changes the zone label",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the app is open in two tabs", () => {
        world.givenTwoTabs();
        world.openTab();
        world.openTab();
      });
      When("the user turns the UTC offset off in the first tab", async () => {
        await world.toggle(UTC_OFFSET_TOGGLE, world.openedTabs()[0]);
        world.runPendingWrite(world.openedTabs()[0]);
      });
      Then(
        "the second tab shows no UTC offset on its location rows without a reload",
        () =>
          expect(
            world
              .allRowsZoneLines(world.openedTabs()[1])
              .flat()
              .filter((element) => element.startsWith("UTC")),
          ).toEqual([]),
      );
    },
  );

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
