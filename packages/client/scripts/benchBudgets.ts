/**
 * Evaluates a `vitest bench` JSON report against the row budget. Pure: no I/O.
 * Implements FR6 of replace-wall-clock-row-budgets-with-deterministic-checks (D5).
 */

export const ROW_BUDGET_MS = 50;
const MEDIAN_FRACTION_DIGITS = 2;
const WARNING_TITLE = "Benchmark budget";
const NO_REPORT_MESSAGE = "no benchmark report";
const TABLE_HEADER = "| Benchmark | Median (ms) |\n| --- | --- |";

type Benchmark = { name: string; median: number };

export type BenchBudgetEvaluation = {
  summaryMarkdown: string;
  warningLines: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Stryker disable next-line ArrayDeclaration: equivalent — a placeholder string is dropped by the record filter
const recordsOf = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

function collectBenchmarks(benchReport: unknown): Benchmark[] {
  return recordsOf(isRecord(benchReport) ? benchReport.files : undefined)
    .flatMap((file) => recordsOf(file.groups))
    .flatMap((group) => recordsOf(group.benchmarks))
    .filter(
      (benchmark): benchmark is Benchmark =>
        typeof benchmark.name === "string" &&
        typeof benchmark.median === "number",
    );
}

const roundMedian = (median: number) =>
  Number(median.toFixed(MEDIAN_FRACTION_DIGITS));

const warningLine = (message: string) =>
  `::warning title=${WARNING_TITLE}::${message}`;

/** A median of exactly the budget is within it; only a larger one is reported. */
export function evaluateBenchBudgets(
  benchReport: unknown,
): BenchBudgetEvaluation {
  const benchmarks = collectBenchmarks(benchReport);
  if (benchmarks.length === 0) {
    return {
      summaryMarkdown: "",
      warningLines: [warningLine(NO_REPORT_MESSAGE)],
    };
  }
  const tableRows = benchmarks.map(
    ({ name, median }) => `| ${name} | ${roundMedian(median)} |`,
  );
  return {
    summaryMarkdown: `${[TABLE_HEADER, ...tableRows].join("\n")}\n`,
    warningLines: benchmarks
      .filter(({ median }) => median > ROW_BUDGET_MS)
      .map(({ name, median }) =>
        warningLine(
          `${name} median ${roundMedian(median)} ms > ${ROW_BUDGET_MS} ms`,
        ),
      ),
  };
}
