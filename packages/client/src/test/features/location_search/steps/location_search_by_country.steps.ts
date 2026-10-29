import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { SearchMatchKind } from "@/ports";
import {
  buildCitySearch,
  cityNamesOf,
  createSearchWorld,
  runSearch,
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

  const givenNoCountryNames = ({ Given }: { Given: Function }) =>
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
