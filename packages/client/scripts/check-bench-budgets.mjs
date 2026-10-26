/**
 * Reads the `vitest bench` JSON report, prints each median and warns about
 * every median above the row budget. Always exits 0: a slow runner never
 * fails the pull request check.
 * Implements FR6 of replace-wall-clock-row-budgets-with-deterministic-checks (D5).
 */
import { appendFileSync, readFileSync } from "node:fs";
import { evaluateBenchBudgets } from "./benchBudgets.ts";

const DEFAULT_REPORT_PATH = "reports/bench/bench.json";
const reportPath = process.argv[2] ?? DEFAULT_REPORT_PATH;

function readReport(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

const { summaryMarkdown, warningLines } = evaluateBenchBudgets(
  readReport(reportPath),
);
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) appendFileSync(summaryFile, summaryMarkdown);
else console.log(summaryMarkdown);
for (const line of warningLines) console.log(line);
