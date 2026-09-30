import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { measureSearchMilliseconds } from "./searchWorld";

const feature = await loadFeature("../location_search_performance.feature");

const SAMPLE_QUERIES: readonly string[] = [
  "a",
  "new",
  "york",
  "Moscow",
  "Москва",
  "sao paulo",
  "Kazakhstan",
  "IST",
  "est",
  "qqqq",
];
const MAX_QUERY_MILLISECONDS = 50;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let durations: number[] = [];

  f.BeforeEachScenario(() => {
    durations = [];
  });

  // @add-locations-via-search @NFR-P1 @M6
  f.Scenario("Query timing", ({ When, Then }) => {
    When(
      "each of {int} sample queries is run over the full data",
      (_ctx, sampleCount: number) => {
        expect(SAMPLE_QUERIES).toHaveLength(sampleCount);
        durations = SAMPLE_QUERIES.map(measureSearchMilliseconds);
      },
    );
    Then(
      "each completes in at most {int} milliseconds",
      (_ctx, limitMilliseconds: number) => {
        expect(limitMilliseconds).toBe(MAX_QUERY_MILLISECONDS);
        for (const duration of durations) {
          expect(duration).toBeLessThanOrEqual(limitMilliseconds);
        }
      },
    );
  });
});
