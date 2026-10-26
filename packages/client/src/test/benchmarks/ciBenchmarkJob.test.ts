// FR7: non-blocking benchmark job of replace-wall-clock-row-budgets-with-deterministic-checks
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PACKAGE_ROOT = join(import.meta.dirname, "../../..");
const CI_WORKFLOW_FILE = join(PACKAGE_ROOT, "../../.github/workflows/ci.yml");
const JOBS_SECTION_MARKER = "\njobs:\n";
const JOB_KEY_PATTERN = /^ {2}([\w-]+):\s*$/;
const BENCHMARK_JOB = "benchmark";
const BENCH_KEYWORD = "bench";
const CONTINUE_ON_ERROR = /^\s+continue-on-error:\s*true\s*$/m;
const NEEDS_ANOTHER_JOB = /^\s+needs:\s*(?!\[\s*\]\s*$)\S/m;
const BENCH_COMMAND = "pnpm --filter @time-zones/client bench";
const BUDGET_CHECK_COMMAND = "scripts/check-bench-budgets.mjs";

function splitJobBlocks(workflowText: string): Map<string, string> {
  const jobsStart = workflowText.indexOf(JOBS_SECTION_MARKER);
  const jobsSection = workflowText.slice(
    jobsStart + JOBS_SECTION_MARKER.length,
  );
  const jobBlocks = new Map<string, string>();
  let currentJobName: string | undefined;
  for (const line of jobsSection.split("\n")) {
    const jobKeyMatch = JOB_KEY_PATTERN.exec(line);
    if (jobKeyMatch) {
      currentJobName = jobKeyMatch[1];
      jobBlocks.set(currentJobName, "");
    } else if (currentJobName !== undefined) {
      jobBlocks.set(
        currentJobName,
        `${jobBlocks.get(currentJobName)}${line}\n`,
      );
    }
  }
  return jobBlocks;
}

const jobBlocks = splitJobBlocks(readFileSync(CI_WORKFLOW_FILE, "utf8"));
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
