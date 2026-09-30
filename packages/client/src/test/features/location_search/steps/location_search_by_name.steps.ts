import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  cityNamesOf,
  createSearchWorld,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const feature = await loadFeature("../location_search_by_name.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });

  const whenUserSearches = ({ When }: { When: Function }) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  // @add-locations-via-search @FR1
  f.Scenario("Diacritics are ignored", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  // @add-locations-via-search @FR1
  f.Scenario("Other language than the interface", ({ Given, When, Then }) => {
    Given("the interface language is English", () => {
      world.language = "en";
    });
    whenUserSearches({ When });
    Then(
      "the first result is {string} shown as {string}",
      (_ctx, _city: string, shownName: string) => {
        expect(cityNamesOf(world)[0]).toBe(shownName);
        expect(zoneIdsOf(world)[0]).toBe("Europe/Moscow");
      },
    );
  });

  // @add-locations-via-search @FR1
  f.Scenario("Case and spaces", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("the first result is in {string}", (_ctx, zoneId: string) => {
      expect(zoneIdsOf(world)[0]).toBe(zoneId);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Full city name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("the first result is in {string}", (_ctx, zoneId: string) => {
      expect(zoneIdsOf(world)[0]).toBe(zoneId);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Later word of the name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Prefix of the name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });
});
