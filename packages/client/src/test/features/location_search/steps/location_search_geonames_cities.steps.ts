import zoneCities from "virtual:zone-cities";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { POPULAR_TIME_ZONE_IDS } from "@/constants";
import { installZoneRulesDateTimeFormat } from "@/lib/zoneRules";
import { SearchMatchKind } from "@/ports";
import { fullCityData } from "@/test/fullCityData";
import { committedRelease } from "@/test/installZoneRules";
import { startOnStaleEngine, stopStaleEngine } from "@/test/staleEngineWorld";
import {
  buildCitySearch,
  cityNamesOf,
  createSearchWorld,
  openSuggestions,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const feature = await loadFeature("../location_search_geonames_cities.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();
  const intlDateTimeFormatBefore = Intl.DateTimeFormat;

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });
  f.AfterEachScenario(() => {
    stopStaleEngine();
    Intl.DateTimeFormat = intlDateTimeFormatBefore;
    installZoneRulesDateTimeFormat(committedRelease);
    Intl.DateTimeFormat = intlDateTimeFormatBefore;
  });

  const thenAmongResults = (name: string) =>
    expect(cityNamesOf(world)).toContain(name);

  // @add-geonames-city-source @FR3 @M3
  f.ScenarioOutline(
    "Cities that are not zone cities are found",
    ({ Given, When, Then }, variables) => {
      Given("the interface language is English", () => {
        world.language = "en";
      });
      When('the user searches for "<query>"', () =>
        runSearch(world, variables.query),
      );
      Then('"<city>" in "<zone>" is among the results', () => {
        const isFound = world.results.some(
          (result) =>
            result.record.names.en === variables.city &&
            result.record.timeZoneId === variables.zone,
        );
        expect(isFound).toBe(true);
      });
    },
  );

  // @add-geonames-city-source @FR3 @M3
  f.ScenarioOutline("Found in Russian", ({ Given, When, Then }, variables) => {
    Given("the interface language is English", () => {
      world.language = "en";
    });
    When('the user searches for "<query>"', () =>
      runSearch(world, variables.query),
    );
    Then('"<city>" is among the results shown as "<city>"', () =>
      thenAmongResults(variables.city),
    );
  });

  // @add-geonames-city-source @FR3
  f.Scenario("A later word of a GeoNames city", ({ When, Then }) => {
    When("the user searches for {string}", (_ctx, query: string) =>
      runSearch(world, query),
    );
    Then("{string} is among the results", (_ctx, name: string) =>
      thenAmongResults(name),
    );
  });

  // @add-geonames-city-source @FR10
  f.Scenario(
    "An abbreviation still finds zone cities only",
    ({ When, Then, And }) => {
      When("the user searches for {string}", (_ctx, query: string) =>
        runSearch(world, query),
      );
      Then("every result is a zone city matched by abbreviation", () => {
        expect(world.results.length).toBeGreaterThan(0);
        for (const result of world.results) {
          expect(result.record.id).toBe(result.record.timeZoneId);
          expect(result.matchKind).toBe(SearchMatchKind.ABBREVIATION);
        }
      });
      And("{string} is not among the results", (_ctx, name: string) => {
        expect(cityNamesOf(world)).not.toContain(name);
      });
    },
  );

  // @add-geonames-city-source @FR10
  f.Scenario("Suggestions are unchanged", ({ When, Then }) => {
    When("the user opens the search", () => openSuggestions(world));
    Then("the suggestions are the popular locations, one per zone", () => {
      expect(zoneIdsOf(world)).toEqual(POPULAR_TIME_ZONE_IDS);
      expect(
        world.results.every(
          (result) => result.record.id === result.record.timeZoneId,
        ),
      ).toBe(true);
    });
  });

  // @add-geonames-city-source @FR11
  f.Scenario(
    "A city of a zone the installed release lacks",
    ({ Given, When, Then, And }) => {
      Given(
        "the installed zone rules release does not hold {string}",
        (_ctx, zoneId: string) => {
          const zones = new Map(committedRelease.zones);
          zones.delete(zoneId);
          installZoneRulesDateTimeFormat({ ...committedRelease, zones });
          world.citySearch = buildCitySearch();
        },
      );
      When("the user searches for {string}", (_ctx, query: string) =>
        runSearch(world, query),
      );
      Then("{string} is not among the results", (_ctx, name: string) => {
        expect(cityNamesOf(world)).not.toContain(name);
      });
      And("no error is shown", () => {
        expect(world.results).toBeInstanceOf(Array);
      });
    },
  );

  // @add-geonames-city-source @FR11
  f.Scenario("A city of a zone the engine rejects", ({ Given, When, Then }) => {
    Given("the engine rejects {string}", async (_ctx, zoneId: string) => {
      const { modules } = await startOnStaleEngine({
        staleZones: {},
        rejectedZones: [zoneId],
      });
      world.citySearch = modules.adapters.createCompositeCitySearch(
        (await import("virtual:zone-cities")).default,
        (await import("@/test/fullCityData")).fullCityData,
      );
    });
    When("the user searches for {string}", (_ctx, query: string) =>
      runSearch(world, query),
    );
    Then(
      "{string} in {string} is among the results",
      (_ctx, name: string, zoneId: string) => {
        thenAmongResults(name);
        expect(zoneIdsOf(world)).toContain(zoneId);
      },
    );
  });
});
