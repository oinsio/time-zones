// Implements FR5, UX1 of add-city-coordinates-to-locations: coordinates of city records and an unchanged search.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  createCompositeCitySearch,
  type GeoNamesCityEntry,
} from "@/adapters/city-search";
import { fullCityData, fullZoneCities } from "@/test/fullCityData";
import {
  cityNamesOf,
  createSearchWorld,
  openSuggestions,
  runSearch,
  SAMPLE_QUERIES,
  type SearchWorld,
} from "./searchWorld";

const feature = await loadFeature("../location_search_coordinates.feature");

const withoutCoordinates = (city: GeoNamesCityEntry): GeoNamesCityEntry => {
  const { coordinates: _coordinates, ...rest } = city;
  return rest as GeoNamesCityEntry;
};
const searchWithoutCoordinates = createCompositeCitySearch(
  fullZoneCities.map(({ coordinates: _coordinates, ...rest }) => rest),
  { ...fullCityData, cities: fullCityData.cities.map(withoutCoordinates) },
);

const presentTexts = (results: SearchWorld["results"]) =>
  results.map(({ record, matchKind, matchedAbbreviation }) => ({
    id: record.id,
    names: record.names,
    countryCode: record.countryCode,
    region: record.region,
    timeZoneId: record.timeZoneId,
    matchKind,
    matchedAbbreviation,
  }));

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let world = createSearchWorld();
  const findCoordinates = (name: string) =>
    world.results.find(
      (result) => cityNamesOf({ ...world, results: [result] })[0] === name,
    )?.record.coordinates;

  f.BeforeEachScenario(() => {
    world = createSearchWorld();
  });

  const whenSearchingFor = (_ctx: unknown, query: string) =>
    runSearch(world, query);
  const thenCarries = (
    _ctx: unknown,
    name: string,
    latitude: number,
    longitude: number,
  ) => {
    expect(findCoordinates(name)).toEqual({ latitude, longitude });
  };

  // @add-city-coordinates-to-locations @FR5
  f.Scenario("A GeoNames city result", ({ When, Then }) => {
    When("the user searches for {string}", whenSearchingFor);
    Then(
      "the result {string} carries the coordinates {number}, {number}",
      thenCarries,
    );
  });

  // @add-city-coordinates-to-locations @FR5
  f.Scenario("A zone city result", ({ When, Then }) => {
    When("the user searches for {string}", whenSearchingFor);
    Then(
      "the result {string} carries the coordinates {number}, {number}",
      thenCarries,
    );
  });

  // @add-city-coordinates-to-locations @FR5
  f.Scenario("An abbreviation result", ({ When, Then }) => {
    When("the user searches for {string}", whenSearchingFor);
    Then(
      "the result {string} carries the coordinates {number}, {number}",
      thenCarries,
    );
  });

  // @add-city-coordinates-to-locations @FR5
  f.Scenario(
    "A suggestion carries the coordinates of its zone",
    ({ When, Then }) => {
      When("the user opens the search without typing", () =>
        openSuggestions(world),
      );
      Then(
        "the suggestion {string} carries the coordinates {number}, {number}",
        thenCarries,
      );
    },
  );

  // @add-city-coordinates-to-locations @FR5
  f.Scenario("UTC has no coordinates", ({ When, Then }) => {
    When("the user searches for {string}", whenSearchingFor);
    Then("the result {string} carries no coordinates", (_ctx, name: string) => {
      const utcResult = world.results.find(
        (result) => result.record.timeZoneId === "UTC",
      );
      expect(utcResult?.record.names.en).toBe(name);
      expect(utcResult?.record.coordinates).toBeUndefined();
    });
  });

  // @add-city-coordinates-to-locations @FR5 @UX1
  f.Scenario("Results are unchanged", ({ When, Then }) => {
    let withCoordinates: ReturnType<typeof presentTexts>[] = [];
    let without: ReturnType<typeof presentTexts>[] = [];
    When(
      "each of {int} sample queries is run over the full data",
      (_ctx, sampleCount: number) => {
        expect(SAMPLE_QUERIES).toHaveLength(sampleCount);
        withCoordinates = SAMPLE_QUERIES.map((query) => {
          runSearch(world, query);
          return presentTexts(world.results);
        });
        without = SAMPLE_QUERIES.map((query) =>
          presentTexts(searchWithoutCoordinates.search(query, world.language)),
        );
      },
    );
    Then(
      "the results, their order and their texts are the same as without coordinates",
      () => {
        expect(withCoordinates).toEqual(without);
      },
    );
  });
});
