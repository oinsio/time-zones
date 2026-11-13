import type {
  FeatureDescriibeCallbackParams,
  StepTest,
} from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  createCompositeCitySearch,
  type GeoNamesCityEntry,
} from "@/adapters/city-search";
import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import {
  cityNamesOf,
  createSearchWorld,
  openSuggestions,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const EQUAL_POPULATION = 500_000;

const feature = await loadFeature("../location_search_ranking.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld(), { citySearch: undefined });
  });

  const whenUserSearches = ({ When }: Pick<StepTest, "When">) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  const thenSuggestionsAreShown = ({ Then }: Pick<StepTest, "Then">) =>
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

  // @add-locations-via-search @FR5 @add-geonames-city-source @FR4
  f.Scenario("One entry per zone", ({ When, Then }) => {
    whenUserSearches({ When });
    Then(
      "the zone city {string} appears once, as a match by city name",
      (_ctx, zoneId: string) => {
        const matches = world.results.filter(
          (result) => result.record.id === zoneId,
        );
        expect(matches).toHaveLength(1);
        expect(matches[0]?.matchKind).toBe(SearchMatchKind.CITY_PREFIX);
      },
    );
  });

  // @add-geonames-city-source @FR4
  f.Scenario("A zone appears once per city", ({ When, Then, And }) => {
    whenUserSearches({ When });
    Then("no city appears twice", () => {
      const ids = world.results.map((result) => result.record.id);
      expect(ids.length).toBeGreaterThan(1);
      expect(new Set(ids).size).toBe(ids.length);
    });
    And(
      "{string} is the zone of more than one result",
      (_ctx, zoneId: string) => {
        expect(
          zoneIdsOf(world).filter((id) => id === zoneId).length,
        ).toBeGreaterThan(1);
      },
    );
  });

  // @add-geonames-city-source @FR5 @UX3
  f.Scenario("Popular locations before larger cities", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("the first result is {string}", (_ctx, cityName: string) => {
      expect(cityNamesOf(world)[0]).toBe(cityName);
    });
  });

  // @add-geonames-city-source @FR5 @UX3
  f.Scenario("Larger cities first", ({ Given, When, Then }) => {
    Given(
      "{string} has a larger population than {string} and neither is a popular location",
      (_ctx, larger: string, smaller: string) => {
        runSearch(world, "san");
        const recordOf = (name: string) =>
          world.results.find((result) => result.record.names.en === name)
            ?.record;
        expect(recordOf(larger)?.population).toBeGreaterThan(
          recordOf(smaller)?.population ?? Infinity,
        );
        expect(recordOf(larger)?.rank).toBe(0);
        expect(recordOf(smaller)?.rank).toBe(0);
      },
    );
    whenUserSearches({ When });
    Then(
      "{string} is listed before {string}",
      (_ctx, first: string, second: string) => {
        const names = cityNamesOf(world);
        expect(names.indexOf(first)).toBeGreaterThanOrEqual(0);
        expect(names.indexOf(first)).toBeLessThan(names.indexOf(second));
      },
    );
  });

  // @add-geonames-city-source @FR5 @UX3
  f.Scenario(
    "Equal population falls back to the name",
    ({ Given, When, Then }) => {
      Given(
        "two cities {string} and {string} with the same match kind, popularity and population",
        (_ctx, first: string, second: string) => {
          const toCity = (id: string, name: string): GeoNamesCityEntry => ({
            id,
            names: { en: name, ru: name },
            countryCode: "US",
            timeZoneId: "America/Chicago",
            population: EQUAL_POPULATION,
          });
          // Listed in reverse alphabetical order: only the name rule can put them right.
          world.citySearch = createCompositeCitySearch([], {
            cities: [toCity("2", second), toCity("1", first)],
            zoneCityPopulations: {},
            zoneCityRegions: {},
          });
        },
      );
      whenUserSearches({ When });
      Then(
        "{string} is listed before {string}",
        (_ctx, first: string, second: string) => {
          const names = cityNamesOf(world);
          expect(names.indexOf(first)).toBeGreaterThanOrEqual(0);
          expect(names.indexOf(first)).toBeLessThan(names.indexOf(second));
        },
      );
    },
  );

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
