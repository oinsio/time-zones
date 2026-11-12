// Verifies FR1, FR2, FR3, FR4, M1 of show-zone-abbreviations-and-zone-label-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { vi } from "vitest";
import { committedRelease } from "@/test/installZoneRules";
import { createZoneLineWorld } from "../../locations/steps/zoneLineWorld";
import {
  createListSteps,
  createReadSteps,
  createTableComparisonSteps,
  ENGLISH_LANGUAGE,
  expectNewYorkClocksForward,
  expectNoLoadingState,
  RUSSIAN_LANGUAGE,
  stubFetch,
} from "./zoneAbbreviationsWorld";

const feature = await loadFeature("../zone_abbreviations_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLineWorld();
  const reads = createReadSteps();
  let fetchSpy: ReturnType<typeof vi.fn>;

  f.BeforeEachScenario(async () => {
    await world.reset();
    reads.reset();
    fetchSpy = stubFetch();
  });
  f.AfterAllScenarios(async () => {
    vi.unstubAllGlobals();
    await world.finish();
  });

  const list = createListSteps(world);

  // @show-zone-abbreviations-and-zone-label-setting @FR2 @M1
  f.ScenarioOutline(
    "The abbreviation follows the moment",
    ({ When, Then }, variables) => {
      When('the zone abbreviation of "<zone>" at "<instant>" is read', () =>
        reads.whenRead(undefined, variables.zone, variables.instant),
      );
      Then('it is "<abbreviation>"', () =>
        reads.thenItIs(undefined, variables.abbreviation),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR2
  f.Scenario(
    "The abbreviation changes at the clock change",
    ({ Given, When, Then }) => {
      Given(
        "New York moves its clocks forward at {string}",
        expectNewYorkClocksForward,
      );
      When(
        "the zone abbreviation of {string} is read at {string} and at {string}",
        reads.whenReadTwice,
      );
      Then("it is {string} and then {string}", reads.thenItIsThenIs);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.ScenarioOutline(
    "Numeric designations are no abbreviation",
    ({ When, Then }, variables) => {
      When(
        'the zone abbreviation of "<zone>" at {string} is read',
        (_ctx, instant: string) =>
          reads.whenRead(undefined, variables.zone, instant),
      );
      Then("there is none", reads.thenThereIsNone);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.Scenario("Unknown zone", ({ When, Then }) => {
    When(
      "the zone abbreviation of {string} at {string} is read",
      reads.whenRead,
    );
    Then("there is none", reads.thenThereIsNone);
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.ScenarioOutline("Abbreviation pairs", ({ When, Then }, variables) => {
    When('the abbreviation pair of "<zone>" is read', () =>
      reads.whenReadPair(variables.zone),
    );
    Then('it is "<pair>"', () => reads.thenPairIs(variables.pair));
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR4
  f.Scenario(
    "Available on the first render offline",
    ({ Given, And, When, Then }) => {
      Given("the app is opened without a network connection", () => {
        fetchSpy.mockRejectedValue(new TypeError("offline"));
      });
      And(
        "the list contains {string} and the current instant is {string}",
        (_ctx, city: string, instant: string) => {
          world.setList(city);
          world.setInstant(instant);
        },
      );
      When("the list is first shown", list.showList);
      Then(
        "the {string} row shows {string} in the same render, without a loading state",
        (_ctx, city: string, text: string) => {
          list.expectRowShows(undefined, city, text);
          expectNoLoadingState();
        },
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  f.Scenario("Moscow in Russian and English", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", list.givenInstant);
    And("the list contains {string}", (_ctx, city: string) => {
      list.givenList(undefined, city);
      list.showList();
    });
    When("the interface language is Russian", () =>
      world.setLanguage(RUSSIAN_LANGUAGE),
    );
    Then('the "Moscow" row shows "МСК"', () =>
      list.expectRowShows(undefined, "Moscow", "МСК"),
    );
    When("the interface language is English", () =>
      world.setLanguage(ENGLISH_LANGUAGE),
    );
    Then('the "Moscow" row shows "MSK"', () =>
      list.expectRowShows(undefined, "Moscow", "MSK"),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  f.Scenario(
    "Other abbreviations stay Latin in Russian",
    ({ Given, And, When, Then }) => {
      Given("the interface language is Russian", () =>
        world.setLanguage(RUSSIAN_LANGUAGE),
      );
      And("the current instant is {string}", list.givenInstant);
      And("the list contains {string} and {string}", list.givenList);
      When("the list is shown", list.showList);
      Then(
        "{string} shows {string} and {string} shows {string}",
        list.expectTwoRowsShow,
      );
    },
  );

  // @add-zone-rules-from-iana @FR9
  f.Scenario("Table built from the release", ({ When, Then, And }) => {
    const table = createTableComparisonSteps(committedRelease.release);
    When(
      "the abbreviation table is built from the zone rules release {string}",
      table.expectBuiltFrom,
    );
    Then(
      "{string} has the pair {string}, {string} has {string}, {string} has {string}",
      table.expectPairs,
    );
    And("{string} has no abbreviation", table.expectNoEntry);
  });

  // @add-zone-rules-from-iana @FR9
  f.Scenario(
    "Abbreviations kept from the table before",
    ({ Given, When, Then, And }) => {
      const table = createTableComparisonSteps(committedRelease.release);
      Given(
        "the abbreviation table built before this change",
        table.expectEarlierTable,
      );
      When(
        "it is compared with the table built from the zone rules release {string}",
        table.compare,
      );
      Then(
        "every zone of the earlier table has the same abbreviations in both",
        table.expectOnlyListedDiffer,
      );
      And(
        "the only exceptions are zones whose designations an IANA release note changed, each listed with that release",
        table.expectListedDiffer,
      );
    },
  );
});
