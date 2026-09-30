import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createSearchWorld, runSearch, zoneIdsOf } from "./searchWorld";

const feature = await loadFeature("../location_search_by_abbreviation.feature");

const LEADING_RESULTS_COUNT = 3;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });

  const whenUserSearches = ({ When }: { When: Function }) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  const firstResultIsIn = ({ Then }: { Then: Function }) =>
    Then("the first result is in {string}", (_ctx: unknown, zoneId: string) => {
      expect(zoneIdsOf(world)[0]).toBe(zoneId);
    });

  // @add-locations-via-search @FR4
  f.Scenario("Ambiguous abbreviation", ({ When, Then, And }) => {
    whenUserSearches({ When });
    Then(
      "the first three results are in {string}, {string}, {string} in that order",
      (_ctx, first: string, second: string, third: string) => {
        expect(zoneIdsOf(world).slice(0, LEADING_RESULTS_COUNT)).toEqual([
          first,
          second,
          third,
        ]);
      },
    );
    And(
      "each of the first three results shows {string}",
      (_ctx, abbreviation: string) => {
        const leadingResults = world.results.slice(0, LEADING_RESULTS_COUNT);
        expect(
          leadingResults.map((result) => result.matchedAbbreviation),
        ).toEqual(Array(LEADING_RESULTS_COUNT).fill(abbreviation));
      },
    );
  });

  // @add-locations-via-search @FR4
  f.Scenario("Single-zone abbreviation", ({ When, Then, And }) => {
    whenUserSearches({ When });
    firstResultIsIn({ Then });
    And("the first result shows {string}", (_ctx, abbreviation: string) => {
      expect(world.results[0]?.matchedAbbreviation).toBe(abbreviation);
    });
  });

  // @add-locations-via-search @FR4
  f.Scenario(
    "Partial abbreviation does not match by abbreviation",
    ({ When, Then }) => {
      whenUserSearches({ When });
      Then("no result shows an abbreviation", () => {
        expect(
          world.results.filter((result) => result.matchedAbbreviation),
        ).toEqual([]);
      });
    },
  );
});
