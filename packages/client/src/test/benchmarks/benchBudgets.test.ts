// FR6: budget evaluation of replace-wall-clock-row-budgets-with-deterministic-checks
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { evaluateBenchBudgets } from "../../../scripts/benchBudgets";

const PACKAGE_ROOT = join(import.meta.dirname, "../../..");
const FIXTURES = join(import.meta.dirname, "fixtures");
const UNDER_BUDGET = join(FIXTURES, "underBudget.json");
const OVER_BUDGET = join(FIXTURES, "overBudget.json");
const MISSING_REPORT = join(FIXTURES, "missing.json");
const BENCHMARK_COUNT = 8;
const WARNING_PREFIX = "::warning title=Benchmark budget::";
const NO_REPORT_WARNING = `${WARNING_PREFIX}no benchmark report`;
const TABLE_HEADER_LINES = 2;
const TABLE_HEADER_TITLE = "| Benchmark | Median (ms) |";
const TABLE_HEADER_DIVIDER = "| --- | --- |";

const reportOf = (medians: number[]) => ({
  files: [
    {
      filepath: "a.bench.ts",
      groups: [
        {
          fullName: "a > group",
          benchmarks: medians.map((median, index) => ({
            name: `operation ${index}`,
            median,
          })),
        },
      ],
    },
  ],
});
const EIGHT_UNDER = [1, 2, 3, 4, 5, 6, 7, 8];

describe("evaluateBenchBudgets", () => {
  it("should give no warning and one table row per benchmark when all are under budget", () => {
    const { summaryMarkdown, warningLines } = evaluateBenchBudgets(
      reportOf(EIGHT_UNDER),
    );

    expect(warningLines).toEqual([]);
    expect(summaryMarkdown.trim().split("\n")).toHaveLength(
      BENCHMARK_COUNT + TABLE_HEADER_LINES,
    );
  });

  it("should accept a median of exactly 50", () => {
    expect(evaluateBenchBudgets(reportOf([50])).warningLines).toEqual([]);
  });

  it("should warn about a median of 80 and name the benchmark", () => {
    const { warningLines } = evaluateBenchBudgets(reportOf([1, 80]));

    expect(warningLines).toEqual([
      `${WARNING_PREFIX}operation 1 median 80 ms > 50 ms`,
    ]);
  });

  it("should print each median in the table", () => {
    expect(evaluateBenchBudgets(reportOf([12.3456])).summaryMarkdown).toContain(
      "| operation 0 | 12.35 |",
    );
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty object", {}],
    ["a report without benchmarks", { files: [] }],
    ["a string", "not a report"],
  ])("should give the single no-report warning for %s", (_name, report) => {
    expect(evaluateBenchBudgets(report)).toEqual({
      summaryMarkdown: "",
      warningLines: [NO_REPORT_WARNING],
    });
  });
});

describe("evaluateBenchBudgets on malformed reports", () => {
  const validBenchmark = { name: "kept", median: 1 };

  it.each([
    [
      "a file that is not an object",
      { files: ["x", { groups: [{ benchmarks: [validBenchmark] }] }] },
    ],
    [
      "a group that is not an object",
      { files: [{ groups: [7, { benchmarks: [validBenchmark] }] }] },
    ],
    [
      "a benchmark that is not an object",
      { files: [{ groups: [{ benchmarks: [null, validBenchmark] }] }] },
    ],
    [
      "a benchmark without a name",
      {
        files: [{ groups: [{ benchmarks: [{ median: 3 }, validBenchmark] }] }],
      },
    ],
    [
      "a benchmark with a text median",
      {
        files: [
          {
            groups: [
              { benchmarks: [{ name: "x", median: "3" }, validBenchmark] },
            ],
          },
        ],
      },
    ],
    [
      "a benchmark with no median",
      {
        files: [{ groups: [{ benchmarks: [{ name: "x" }, validBenchmark] }] }],
      },
    ],
  ])("should skip %s", (_name, report) => {
    const { summaryMarkdown } = evaluateBenchBudgets(report);

    expect(summaryMarkdown.trim().split("\n")).toEqual([
      TABLE_HEADER_TITLE,
      TABLE_HEADER_DIVIDER,
      "| kept | 1 |",
    ]);
  });

  it("should give the no-report warning when files is not a list", () => {
    expect(
      evaluateBenchBudgets({ files: { groups: [] } }).warningLines,
    ).toEqual([NO_REPORT_WARNING]);
  });
});

describe("check-bench-budgets.mjs", () => {
  let temporaryDirectory: string;
  let summaryFile: string;

  beforeEach(() => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "bench-budgets-"));
    summaryFile = join(temporaryDirectory, "summary.md");
    writeFileSync(summaryFile, "");
  });
  afterEach(() => rmSync(temporaryDirectory, { recursive: true }));

  const runCheck = (reportPath: string) =>
    execFileSync("node", ["scripts/check-bench-budgets.mjs", reportPath], {
      cwd: PACKAGE_ROOT,
      encoding: "utf8",
      env: { ...process.env, GITHUB_STEP_SUMMARY: summaryFile },
    });
  const warningsIn = (output: string) =>
    output.split("\n").filter((line) => line.startsWith("::warning"));

  it("should exit 0 with no warning and 8 summary rows for the under-budget report", () => {
    const output = runCheck(UNDER_BUDGET);
    const summaryRows = readFileSync(summaryFile, "utf8")
      .split("\n")
      .filter((line) => line.startsWith("| op"));

    expect(warningsIn(output)).toEqual([]);
    expect(summaryRows).toHaveLength(BENCHMARK_COUNT);
  });

  it("should exit 0 with exactly one warning for the over-budget report", () => {
    expect(warningsIn(runCheck(OVER_BUDGET))).toHaveLength(1);
  });

  it("should exit 0 with one warning for a missing report", () => {
    expect(warningsIn(runCheck(MISSING_REPORT))).toEqual([NO_REPORT_WARNING]);
  });

  it("should print the table to stdout when there is no step summary file", () => {
    const output = execFileSync(
      "node",
      ["scripts/check-bench-budgets.mjs", UNDER_BUDGET],
      {
        cwd: PACKAGE_ROOT,
        encoding: "utf8",
        env: { ...process.env, GITHUB_STEP_SUMMARY: "" },
      },
    );

    expect(output).toContain("| op c | 3 |");
  });
});
