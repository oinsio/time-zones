// FR7: non-blocking benchmark job of replace-wall-clock-row-budgets-with-deterministic-checks
import { describe, expect, it } from "vitest";
import { readCiJobBlocks } from "../ciWorkflow";

const BENCHMARK_JOB = "benchmark";
const BENCH_KEYWORD = "bench";
const CONTINUE_ON_ERROR = /^\s+continue-on-error:\s*true\s*$/m;
const NEEDS_ANOTHER_JOB = /^\s+needs:\s*(?!\[\s*\]\s*$)\S/m;
const BENCH_COMMAND = "pnpm --filter @time-zones/client bench";
const BUDGET_CHECK_COMMAND = "scripts/check-bench-budgets.mjs";

const jobBlocks = readCiJobBlocks();
const benchmarkJob = jobBlocks.get(BENCHMARK_JOB) ?? "";

describe("CI benchmark job", () => {
  it("should define a benchmark job", () => {
    expect(jobBlocks.has(BENCHMARK_JOB)).toBe(true);
  });

  it("should never fail the workflow", () => {
    expect(benchmarkJob).toMatch(CONTINUE_ON_ERROR);
  });

  it("should not wait for another job", () => {
    expect(benchmarkJob).not.toMatch(NEEDS_ANOTHER_JOB);
  });

  it("should check the budgets after running the benchmarks", () => {
    const benchIndex = benchmarkJob.indexOf(BENCH_COMMAND);
    const budgetCheckIndex = benchmarkJob.indexOf(BUDGET_CHECK_COMMAND);
    expect(benchIndex).toBeGreaterThan(-1);
    expect(budgetCheckIndex).toBeGreaterThan(benchIndex);
  });

  it("should run benchmarks in no other job", () => {
    const otherJobsWithBench = [...jobBlocks]
      .filter(([jobName]) => jobName !== BENCHMARK_JOB)
      .filter(([, jobBlock]) => jobBlock.includes(BENCH_KEYWORD))
      .map(([jobName]) => jobName);
    expect(otherJobsWithBench).toEqual([]);
  });
});
