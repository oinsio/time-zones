// FR3, FR13 of support-legacy-ios-12-safari: production sources hold no BigInt.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_ROOT = join(__dirname, "..");
const TEST_DIRECTORY_PREFIX = "test/";
const EXCLUDED_FILE_PATTERN = /\.(test|steps|bench)\.|\.d\.ts$/;
const SOURCE_FILE_PATTERN = /\.tsx?$/;
const BIGINT_PATTERNS = [/\b\d[\d_]*n\b/, /BigInt\(/, /epochNanoseconds/];

function collectProductionSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    const relativePath = `${relative(SOURCE_ROOT, path)}/`;
    if (entry.isDirectory()) {
      return relativePath.startsWith(TEST_DIRECTORY_PREFIX)
        ? []
        : collectProductionSources(path);
    }
    const isProduction =
      SOURCE_FILE_PATTERN.test(entry.name) &&
      !EXCLUDED_FILE_PATTERN.test(entry.name);
    return isProduction ? [path] : [];
  });
}

describe("production sources", () => {
  it("should hold no BigInt literal, BigInt() call or epochNanoseconds", () => {
    const offendingFiles = collectProductionSources(SOURCE_ROOT)
      .filter((path) => {
        const source = readFileSync(path, "utf8");
        return BIGINT_PATTERNS.some((pattern) => pattern.test(source));
      })
      .map((path) => relative(SOURCE_ROOT, path));
    expect(offendingFiles).toEqual([]);
  });
});
