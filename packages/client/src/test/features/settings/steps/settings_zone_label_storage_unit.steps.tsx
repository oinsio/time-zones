// Verifies FR15, M6 of show-zone-abbreviations-and-zone-label-setting.
// Verifies FR6, M2 of add-country-to-zone-label.

import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { ZoneLabelPart } from "@/preferences";
import { createZoneLabelWorld } from "./zoneLabelWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../settings_zone_label_storage_unit.feature",
);
const UTC_OFFSET_TOGGLE = "UTC offset";
const COUNTRY_TOGGLE = "Country";
const ABBREVIATION_TOGGLE = "Abbreviation";
/** The schema version before the zone label existed. */
const SCHEMA_VERSION_BEFORE_ZONE_LABEL = 2;
/** The schema version before the zone label had the country. */
const SCHEMA_VERSION_BEFORE_COUNTRY = 4;
const COUNTRY_NAMES = ["Russia", "Россия"];
const COUNTRY_NAME_PATTERN = new RegExp(COUNTRY_NAMES.join("|"));
const THEME_STORED_VALUES: Record<string, string> = { Dark: "DARK" };
const HOUR_FORMAT_STORED_VALUES: Record<string, string> = {
  "12-hour": "H12",
};
const VIEW_STORED_IDS: Record<string, string> = { Grid: "grid" };
const THEME_LABEL_KEYS: Record<string, string> = { Dark: "settings.themeDark" };
const HOUR_FORMAT_LABEL_KEYS: Record<string, string> = {
  "12-hour": "settings.hourFormat12",
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLabelWorld();
  let legacyDocumentText = "";

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const givenNoPreferences = () => localStorage.clear();
  const givenList = (_ctx: unknown, city: string) => world.setList(city);
  const openSettings = () => {
    world.openTab();
  };
  const expectZoneLabel = (_ctx: unknown, partsName: string) =>
    expect(world.shownZoneLabel()).toBe(partsName);
  const expectPreferencesInForce = (
    _ctx: unknown,
    theme: string,
    hourFormat: string,
    language: string,
  ) => {
    expect(
      screen.getByRole("radio", { name: i18n.t(THEME_LABEL_KEYS[theme]) }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", {
        name: i18n.t(HOUR_FORMAT_LABEL_KEYS[hourFormat]),
      }),
    ).toBeChecked();
    // The app shell applies the language (see the language storage scenarios); the stored document keeps it.
    expect(world.storedText()).toContain(`"interfaceLanguage":"${language}"`);
  };
  const expectDocumentNotRewritten = () => {
    world.runPendingWrite();
    expect(world.storedText()).toBe(legacyDocumentText);
  };

  // @show-zone-abbreviations-and-zone-label-setting @FR15 @add-country-to-zone-label @FR6
  f.Scenario(
    "A toggle writes the preferences once",
    ({ Given, When, And, Then }) => {
      Given("no preferences are stored", givenNoPreferences);
      When("the user opens the settings", openSettings);
      And("the user turns the country off", () => world.toggle(COUNTRY_TOGGLE));
      Then(
        "the stored preferences document holds the zone label with the zone abbreviation and the UTC offset, after the debounce",
        () => {
          expect(world.storedText()).toBeNull();
          world.runPendingWrite();
          expect(world.storedZoneLabelParts()).toEqual([
            ZoneLabelPart.UTC_OFFSET,
            ZoneLabelPart.ZONE_ABBREVIATION,
          ]);
        },
      );
    },
  );

  // @add-country-to-zone-label @FR6
  f.Scenario(
    "The country choice survives a reload",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the user turned the country off", async () => {
        world.openTab();
        await world.toggle(COUNTRY_TOGGLE);
        world.runPendingWrite();
        world.closeTabs();
      });
      When("the app is opened again", openSettings);
      Then("the zone label shows {string}", expectZoneLabel);
      And("no location row shows a country name from the first render", () =>
        expect(world.allRowsZoneLines().flat()).not.toContain(COUNTRY_NAMES[0]),
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
  // @add-country-to-zone-label @FR6
  f.Scenario("Existing users get both parts", ({ Given, When, Then, And }) => {
    Given(
      "the stored preferences document was written before the zone label existed, with the theme {string}, the hour format {string} and the language {string}",
      (_ctx, theme: string, hourFormat: string, language: string) => {
        legacyDocumentText = JSON.stringify({
          schemaVersion: SCHEMA_VERSION_BEFORE_ZONE_LABEL,
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
      expectPreferencesInForce,
    );
    And(
      "the stored document is not rewritten until the user changes a setting",
      expectDocumentNotRewritten,
    );
  });

  // @add-country-to-zone-label @FR6 @M2
  f.Scenario(
    "Existing users keep the country",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored preferences document was written before the zone label had the country, with the theme {string}, the hour format {string}, the language {string}, the view {string} and only the UTC offset in the zone label",
        (
          _ctx,
          theme: string,
          hourFormat: string,
          language: string,
          viewName: string,
        ) => {
          legacyDocumentText = JSON.stringify({
            schemaVersion: SCHEMA_VERSION_BEFORE_COUNTRY,
            payload: {
              theme: THEME_STORED_VALUES[theme],
              hourFormat: HOUR_FORMAT_STORED_VALUES[hourFormat],
              interfaceLanguage: language,
              zoneLabelParts: [ZoneLabelPart.UTC_OFFSET],
              viewMode: VIEW_STORED_IDS[viewName],
            },
          });
          world.storeRaw(legacyDocumentText);
        },
      );
      When("the user opens the settings", openSettings);
      Then("the zone label shows {string}", expectZoneLabel);
      And(
        "the theme {string}, the hour format {string}, the language {string} and the view {string} are in force",
        (
          _ctx,
          theme: string,
          hourFormat: string,
          language: string,
          viewName: string,
        ) => {
          expectPreferencesInForce(_ctx, theme, hourFormat, language);
          expect(world.storedText()).toContain(
            `"viewMode":"${VIEW_STORED_IDS[viewName]}"`,
          );
        },
      );
      And(
        "the stored document is not rewritten until the user changes a setting",
        expectDocumentNotRewritten,
      );
    },
  );

  // @add-country-to-zone-label @FR6
  f.Scenario(
    "Another tab changes the country",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the app is open in two tabs", () => {
        world.givenTwoTabs();
        world.openTab();
        world.openTab();
      });
      When("the user turns the country off in the first tab", async () => {
        await world.toggle(COUNTRY_TOGGLE, world.openedTabs()[0]);
        world.runPendingWrite(world.openedTabs()[0]);
      });
      Then(
        "the second tab shows no country name on its Moscow row without a reload",
        () =>
          expect(
            world.rowZoneLine("Moscow", world.openedTabs()[1]),
          ).not.toContainEqual(expect.stringMatching(COUNTRY_NAME_PATTERN)),
      );
    },
  );

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
});
