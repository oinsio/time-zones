import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  MAX_COLLATORS_PER_QUERY,
  NORMALIZATIONS_PER_QUERY,
} from "@/test/workCounters";
import { countSearchWork, SAMPLE_QUERIES } from "./searchWorld";

const feature = await loadFeature("../location_search_performance.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workPerQuery: ReturnType<typeof countSearchWork>[] = [];

  f.BeforeEachScenario(() => {
    workPerQuery = [];
  });

  // @add-locations-via-search @NFR-P1 @M6
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR4
  f.Scenario("Query timing", ({ When, Then, And }) => {
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
  });
});
