import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import {
  cityNamesOf,
  createSearchWorld,
  openSuggestions,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const feature = await loadFeature("../location_search_ranking.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });

  const whenUserSearches = ({ When }: { When: Function }) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  const thenSuggestionsAreShown = ({ Then }: { Then: Function }) =>
    Then("popular locations are shown as suggestions", () => {
      expect(zoneIdsOf(world)).toEqual(POPULAR_TIME_ZONE_IDS);
    });

  // @add-locations-via-search @FR5 @UX3
  f.Scenario("Abbreviation before city prefix", ({ When, Then }) => {
    whenUserSearches({ When });
    Then(
      "{string} appears after {string}, {string} and {string}",
      (_ctx, later: string, ...earlier: string[]) => {
        const names = cityNamesOf(world);
        for (const earlierName of earlier) {
          expect(names.indexOf(earlierName)).toBeGreaterThanOrEqual(0);
          expect(names.indexOf(later)).toBeGreaterThan(
            names.indexOf(earlierName),
          );
        }
      },
    );
  });

  // @add-locations-via-search @FR5
  f.Scenario("City before country", ({ Given, When, Then }) => {
    Given(
      "a city whose name starts with the query and a country whose name starts with the query",
      () => {
        // The real data holds Montevideo and Mongolia: nothing to set up.
      },
    );
    whenUserSearches({ When });
    Then(
      "{string} is listed before every result of the country {string}",
      (_ctx, cityName: string, countryCode: string) => {
        const cityPosition = cityNamesOf(world).indexOf(cityName);
        const countryPositions = world.results.flatMap((result, position) =>
          result.record.countryCode === countryCode ? [position] : [],
        );
        expect(cityPosition).toBeGreaterThanOrEqual(0);
        expect(countryPositions.length).toBeGreaterThan(0);
        for (const countryPosition of countryPositions) {
          expect(cityPosition).toBeLessThan(countryPosition);
        }
      },
    );
  });

  // @add-locations-via-search @FR5
  f.Scenario("One entry per zone", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("every zone appears once", () => {
      const zoneIds = zoneIdsOf(world);
      expect(zoneIds.length).toBeGreaterThan(1);
      expect(new Set(zoneIds).size).toBe(zoneIds.length);
    });
  });

  // @add-locations-via-search @FR5
  f.Scenario("Result limit", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("at most {int} results are shown", (_ctx, limit: number) => {
      expect(limit).toBe(MAX_SEARCH_RESULTS);
      expect(world.results.length).toBe(limit);
    });
  });

  // @add-locations-via-search @FR6 @UX1
  f.Scenario("Search opened", ({ When, Then }) => {
    When("the user opens the search", () => openSuggestions(world));
    thenSuggestionsAreShown({ Then });
  });

  // @add-locations-via-search @FR6 @UX1
  f.Scenario("Query cleared", ({ Given, When, Then }) => {
    Given("the user typed {string}", (_ctx, query: string) =>
      runSearch(world, query),
    );
    When("the user clears the query", () => {
      runSearch(world, "");
      if (world.results.length === 0) openSuggestions(world);
    });
    thenSuggestionsAreShown({ Then });
  });

  // @add-locations-via-search @FR7 @UX1
  f.Scenario("Nothing found", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("there are no results", () => {
      expect(world.results).toEqual([]);
    });
  });

  // @add-locations-via-search @FR7 @UX1
  f.Scenario("Offsets are not a search input", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("there are no results", () => {
      expect(world.results).toEqual([]);
    });
  });
});
