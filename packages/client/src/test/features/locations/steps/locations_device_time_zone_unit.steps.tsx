import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  badgeText,
  createDeviceTimeZoneWorld,
  ENGLISH_LANGUAGE,
  RUSSIAN_LANGUAGE,
} from "./deviceTimeZoneWorld";

const feature = await loadFeature("../locations_device_time_zone_unit.feature");

const ROW_BUDGET_MS = 50;
const BUDGET_ROW_COUNT = 50;
const BUDGET_MATCHING_ROW_COUNT = 10;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeZoneWorld();
  const {
    openApp,
    givenDeviceZone,
    givenList,
    givenLanguage,
    thenShowsBadge,
    thenShowsNoBadge,
    thenNoBadgeAnywhere,
    whenAdds,
    whenRemoves,
    expectRowShows,
  } = world;
  let budgetLocations: ReturnType<typeof buildLocation>[];
  let elapsedMs: number;

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage(RUSSIAN_LANGUAGE);
  });

  // @mark-device-time-zone-in-location-list @FR1
  f.Scenario("One row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("No row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("no row shows the badge", thenNoBadgeAnywhere);
  });

  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("Several rows match", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Legacy device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Unknown device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR4
  f.Scenario("Badge follows changes of the list", (steps) => {
    const { Given, And, When, Then } = steps;
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the badge", thenShowsBadge);
    When("the user removes {string}", whenRemoves);
    Then("no row shows the badge", thenNoBadgeAnywhere);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is read once", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the device time zone becomes {string}", givenDeviceZone);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is not stored", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the stored list document holds only the locations", () => {
      expect(Object.keys(world.getBackend().document).sort()).toEqual([
        "locations",
        "status",
      ]);
    });
  });

  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("English interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", (_ctx, city: string, text) =>
      expectRowShows(city, text),
    );
  });

  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows the Russian badge text",
      (_ctx, city: string) => expectRowShows(city, badgeText(RUSSIAN_LANGUAGE)),
    );
  });

  // @mark-device-time-zone-in-location-list @NFR-P1
  f.Scenario("50 rows within the budget", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("50 locations of which some are in the device time zone", () => {
      budgetLocations = Array.from({ length: BUDGET_ROW_COUNT }, (_, index) =>
        buildLocation({
          label: `City ${index}`,
          timeZoneId:
            index < BUDGET_MATCHING_ROW_COUNT ? world.getDeviceZone() : "Asia/Tokyo",
        }),
      );
    });
    When("their rows are presented", () => {
      const startedAt = performance.now();
      presentLocationRows(budgetLocations, {
        language: ENGLISH_LANGUAGE,
        instant: world.clock.instant(),
        translate: i18n.getFixedT(ENGLISH_LANGUAGE),
        deviceTimeZoneId: world.getDeviceZone(),
      });
      elapsedMs = performance.now() - startedAt;
    });
    Then("it takes at most {int} ms", (_ctx, budgetMs: number) => {
      expect(budgetMs).toBe(ROW_BUDGET_MS);
      expect(elapsedMs).toBeLessThanOrEqual(budgetMs);
    });
  });
});
