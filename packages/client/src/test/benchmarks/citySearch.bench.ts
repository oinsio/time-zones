// Implements FR6, verifies NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks (D5).
import { bench, describe } from "vitest";
import {
  SAMPLE_QUERIES,
  searchOnce,
} from "../features/location_search/steps/searchWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;

let nextQueryIndex = 0;

/** One query per iteration, rotating through the samples, so the median is per query. */
const runNextQuery = () => {
  searchOnce(SAMPLE_QUERIES[nextQueryIndex % SAMPLE_QUERIES.length]);
  nextQueryIndex += 1;
};

describe("city search", () => {
  bench("search one query over the full data", runNextQuery, {
    warmupIterations: WARMUP_ITERATIONS,
    iterations: SAMPLE_ITERATIONS,
  });
});
