import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { cityNamesOf, createSearchWorld, runSearch } from "./searchWorld";

const feature = await loadFeature("../location_search_by_country.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });

  const whenUserSearches = ({ When }: { When: Function }) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  // @add-locations-via-search @FR3
  f.Scenario("Country with several zones", ({ When, Then, And }) => {
    whenUserSearches({ When });
    Then(
      "every result has the country code {string}",
      (_ctx, countryCode: string) => {
        expect(world.results.length).toBeGreaterThan(1);
        for (const result of world.results) {
          expect(result.record.countryCode).toBe(countryCode);
        }
      },
    );
    And("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  // @add-locations-via-search @FR3
  f.Scenario("Country name in Russian", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });
});
