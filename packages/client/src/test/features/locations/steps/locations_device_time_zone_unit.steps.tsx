// Verifies FR5 of match-here-mark-to-design.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { HourFormat } from "@/preferences";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  createDeviceTimeZoneWorld,
  ENGLISH_LANGUAGE,
  hereCaption,
  RUSSIAN_LANGUAGE,
} from "./deviceTimeZoneWorld";
import { expectFormattersPerZoneAtMost } from "./rowBudgetWorld";

const feature = await loadFeature("../locations_device_time_zone_unit.feature");

const BUDGET_ROW_COUNT = 50;
const BUDGET_MATCHING_ROW_COUNT = 10;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeZoneWorld();
  const {
    openApp,
    givenDeviceZone,
    givenList,
    givenLanguage,
    thenShowsHereMark,
    thenShowsNoHereMark,
    thenNoHereMarkAnywhere,
    whenAdds,
    whenRemoves,
    expectRowShows,
  } = world;
  let budgetLocations: ReturnType<typeof buildLocation>[];
  let workCount: WorkCount;
  let presentLocationRows: typeof import("@/presenter").presentLocationRows;

  f.BeforeEachScenario(world.reset);
  f.AfterEachScenario(() => workCount?.stop());
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage(RUSSIAN_LANGUAGE);
  });

  // @match-here-mark-to-design @FR1
  // @mark-device-time-zone-in-location-list @FR1
  f.Scenario("One row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows no here mark", thenShowsNoHereMark);
  });

  // @match-here-mark-to-design @FR1
  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("No row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("no row shows the here mark", thenNoHereMarkAnywhere);
  });

  // @match-here-mark-to-design @FR1
  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("Several rows match", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows no here mark", thenShowsNoHereMark);
  });

  // @match-here-mark-to-design @FR1
  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Legacy device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows no here mark", thenShowsNoHereMark);
  });

  // @match-here-mark-to-design @FR1
  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Unknown device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows no here mark", thenShowsNoHereMark);
  });

  // @match-here-mark-to-design @FR5
  // @mark-device-time-zone-in-location-list @FR4
  f.Scenario("Badge follows changes of the list", (steps) => {
    const { Given, And, When, Then } = steps;
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    When("the user removes {string}", whenRemoves);
    Then("no row shows the here mark", thenNoHereMarkAnywhere);
  });

  // @match-here-mark-to-design @FR5
  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is read once", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the device time zone becomes {string}", givenDeviceZone);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the here mark", thenShowsHereMark);
    And("the {string} row shows no here mark", thenShowsNoHereMark);
  });

  // @match-here-mark-to-design @FR5
  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is not stored", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the stored list document holds only the locations", () => {
      expect(Object.keys(world.getBackend().document).sort()).toEqual([
        "homeLocationId",
        "locations",
        "status",
      ]);
    });
  });

  // @match-here-mark-to-design @FR3
  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("English interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows the caption {string}",
      (_ctx, city: string, text) => expectRowShows(city, text),
    );
  });

  // @match-here-mark-to-design @FR3
  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows the Russian here caption",
      (_ctx, city: string) =>
        expectRowShows(city, hereCaption(RUSSIAN_LANGUAGE)),
    );
  });

  // @match-here-mark-to-design @NFR-P1
  // @mark-device-time-zone-in-location-list @NFR-P1
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR2
  f.Scenario("50 rows within the budget", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("50 locations of which some are in the device time zone", () => {
      budgetLocations = Array.from({ length: BUDGET_ROW_COUNT }, (_, index) =>
        buildLocation({
          label: `City ${index}`,
          timeZoneId:
            index < BUDGET_MATCHING_ROW_COUNT
              ? world.getDeviceZone()
              : "Asia/Tokyo",
        }),
      );
    });
    And("no row has been presented yet", async () => {
      vi.resetModules();
      ({ presentLocationRows } = await import("@/presenter"));
    });
    When("their rows are presented", () => {
      workCount = startWorkCount();
      presentLocationRows(budgetLocations, {
        language: ENGLISH_LANGUAGE,
        hourFormat: HourFormat.H24,
        instant: world.clock.instant(),
        translate: i18n.getFixedT(ENGLISH_LANGUAGE),
        deviceTimeZoneId: world.getDeviceZone(),
        homeLocationId: null,
        referenceOffsetMinutes: undefined,
        referenceDay: buildReferenceDay(
          world.clock.instant(),
          world.getDeviceZone(),
        ),
      });
      workCount.stop();
    });
    Then(
      "at most {int} date and time formatters are built per distinct time zone",
      (_ctx, maxFormatters: number) =>
        expectFormattersPerZoneAtMost(workCount, maxFormatters),
    );
    And(
      "at most {int} region name formatter is built",
      (_ctx, maxDisplayNames: number) => {
        expect(workCount.displayNames()).toBeLessThanOrEqual(maxDisplayNames);
      },
    );
  });
});
