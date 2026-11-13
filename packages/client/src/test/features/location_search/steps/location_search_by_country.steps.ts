import zoneCities from "virtual:zone-cities";
import type {
  FeatureDescriibeCallbackParams,
  StepTest,
} from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { MAX_SEARCH_RESULTS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import {
  buildCitySearch,
  cityNamesOf,
  createSearchWorld,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const feature = await loadFeature("../location_search_by_country.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  let restoreDisplayNames: () => void = () => undefined;

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });
  f.AfterEachScenario(() => {
    restoreDisplayNames();
    restoreDisplayNames = () => undefined;
  });

  const givenNoCountryNames = ({ Given }: Pick<StepTest, "Given">) =>
    Given("the environment has no country names", () => {
      const nativeDisplayNames = Intl.DisplayNames;
      Object.defineProperty(Intl, "DisplayNames", {
        value: undefined,
        configurable: true,
        writable: true,
      });
      restoreDisplayNames = () => {
        Object.defineProperty(Intl, "DisplayNames", {
          value: nativeDisplayNames,
          configurable: true,
          writable: true,
        });
      };
      world.citySearch = buildCitySearch();
    });

  const whenUserSearches = ({ When }: Pick<StepTest, "When">) =>
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

  // @add-geonames-city-source @FR6
  f.Scenario("Other cities of the country", ({ When, Then, And }) => {
    whenUserSearches({ When });
    Then(
      "{string} and {string} are among the results",
      (_ctx, first: string, second: string) => {
        expect(cityNamesOf(world)).toContain(first);
        expect(cityNamesOf(world)).toContain(second);
      },
    );
    And(
      "every zone city of {string} is listed before them",
      (_ctx, countryCode: string) => {
        const firstOtherCity = world.results.findIndex(
          (result) => result.record.id !== result.record.timeZoneId,
        );
        const zoneCityPositions = world.results.flatMap((result, position) =>
          result.record.id === result.record.timeZoneId &&
          result.record.countryCode === countryCode
            ? [position]
            : [],
        );
        const expectedZoneCities = zoneCities.filter(
          (zone) => zone.countryCode === countryCode,
        );
        expect(zoneCityPositions).toHaveLength(expectedZoneCities.length);
        for (const position of zoneCityPositions)
          expect(position).toBeLessThan(firstOtherCity);
      },
    );
  });

  // @add-geonames-city-source @FR6
  f.Scenario(
    "Every zone of a large country stays within the limit",
    ({ When, Then, And }) => {
      whenUserSearches({ When });
      Then("{int} results are shown", (_ctx, count: number) => {
        expect(count).toBe(MAX_SEARCH_RESULTS);
        expect(world.results).toHaveLength(count);
      });
      And(
        "every zone of {string} is among them",
        (_ctx, countryCode: string) => {
          const russianZones = zoneCities.filter(
            (zone) => zone.countryCode === countryCode,
          );
          expect(russianZones.length).toBeGreaterThan(1);
          for (const zone of russianZones) {
            expect(zoneIdsOf(world)).toContain(zone.timeZoneId);
          }
        },
      );
    },
  );

  // @support-legacy-ios-12-safari @FR5
  f.Scenario(
    "No country names on a legacy engine",
    ({ Given, When, Then, And }) => {
      givenNoCountryNames({ Given });
      whenUserSearches({ When });
      Then("no result is matched by country", () => {
        expect(
          world.results.filter(
            (result) => result.matchKind === SearchMatchKind.COUNTRY,
          ),
        ).toEqual([]);
      });
      And("no error is shown", () => {
        expect(world.results).toBeInstanceOf(Array);
      });
    },
  );

  // @support-legacy-ios-12-safari @FR5
  f.Scenario("City search on a legacy engine", ({ Given, When, Then }) => {
    givenNoCountryNames({ Given });
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });
});
