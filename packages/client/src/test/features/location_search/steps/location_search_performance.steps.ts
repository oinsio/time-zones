// Verifies NFR-P3 of show-zone-abbreviations-and-zone-label-setting (abbreviation query work bound).
// Verifies NFR-P2, NFR-P3 of add-geonames-city-source (D6): work bounds over the prepared full data.
// The shared search of searchWorld.ts runs one preparation query when it is built.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { CITY_NAME_LANGUAGES } from "@/constants";
import {
  MAX_COLLATORS_PER_QUERY,
  NORMALIZATIONS_PER_QUERY,
} from "@/test/workCounters";
import {
  countLoadingWork,
  countPreparationWork,
  countSearchWork,
  SAMPLE_QUERIES,
} from "./searchWorld";

const feature = await loadFeature("../location_search_performance.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workPerQuery: ReturnType<typeof countSearchWork>[] = [];

  f.BeforeEachScenario(() => {
    workPerQuery = [];
  });

  // @add-locations-via-search @NFR-P1 @M6
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR4
  f.Scenario("Query timing", ({ Given, When, Then, And }) => {
    Given("the full data is prepared for search", () => {
      // searchWorld.ts ran the preparation query when it built the shared search.
    });
    When(
      "each of {int} sample queries is run over the full data",
      (_ctx, sampleCount: number) => {
        expect(SAMPLE_QUERIES).toHaveLength(sampleCount);
        workPerQuery = SAMPLE_QUERIES.map(countSearchWork);
      },
    );
    Then("each query normalizes exactly one text", () => {
      for (const { normalizations } of workPerQuery) {
        expect(normalizations).toBe(NORMALIZATIONS_PER_QUERY);
      }
    });
    And("each query builds at most one collator", () => {
      for (const { collators } of workPerQuery) {
        expect(collators).toBeLessThanOrEqual(MAX_COLLATORS_PER_QUERY);
      }
    });
    And("no query builds a country-name formatter", () => {
      for (const { countryNameFormatters } of workPerQuery) {
        expect(countryNameFormatters).toBe(0);
      }
    });
  });

  // @add-geonames-city-source @NFR-P2
  f.Scenario("Preparing the data for search", ({ When, Then }) => {
    let formatterCount = Number.POSITIVE_INFINITY;
    When("the first query is run over freshly loaded search data", () => {
      formatterCount = countPreparationWork();
    });
    Then(
      "at most one country-name formatter per city-name language was built",
      () => {
        expect(formatterCount).toBeLessThanOrEqual(CITY_NAME_LANGUAGES.length);
      },
    );
  });

  // @add-geonames-city-source @NFR-P3
  f.Scenario(
    "Loading without a query does no search work",
    ({ Given, When, Then }) => {
      let normalizationCount = Number.POSITIVE_INFINITY;
      Given("the list holds Kazan and the search was not opened", () => {
        // A stored location is a zone and a label: nothing to set up.
      });
      When(
        "the search data finishes loading and the Kazan row shows its city label",
        () => {
          normalizationCount = countLoadingWork("Europe/Moscow", "Kazan");
        },
      );
      Then("no text was normalized", () => {
        expect(normalizationCount).toBe(0);
      });
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @NFR-P3
  f.Scenario(
    "Abbreviation query within the work bound",
    ({ Given, When, Then, And }) => {
      let abbreviationWork: ReturnType<typeof countSearchWork>;
      Given("the full data is prepared for search", () => {
        // searchWorld.ts ran the preparation query when it built the shared search.
      });
      When(
        "the query {string} is run over the full data",
        (_ctx, query: string) => {
          abbreviationWork = countSearchWork(query);
        },
      );
      Then("it normalizes exactly one text", () =>
        expect(abbreviationWork.normalizations).toBe(NORMALIZATIONS_PER_QUERY),
      );
      And("it builds at most one collator", () =>
        expect(abbreviationWork.collators).toBeLessThanOrEqual(
          MAX_COLLATORS_PER_QUERY,
        ),
      );
    },
  );
});
