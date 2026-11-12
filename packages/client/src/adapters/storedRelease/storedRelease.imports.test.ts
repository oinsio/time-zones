// Verifies FR6 of add-remote-zone-rules-updates (D2): boot can import this
// sub-module before Temporal loads, so its sources import nothing that does.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SUB_MODULE_DIRECTORY = __dirname;
const IMPORT_PATTERN = /(?:from|import)\s+["']([^"']+)["']/g;
const ALLOWED_PACKAGES = ["@/lib/zoneRules", "@/constants", "@/ports"];

const readImports = (fileName: string) =>
  [
    ...readFileSync(join(SUB_MODULE_DIRECTORY, fileName), "utf8").matchAll(
      IMPORT_PATTERN,
    ),
  ].map((match) => match[1]);

const sourceFiles = readdirSync(SUB_MODULE_DIRECTORY).filter(
  (fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".test.ts"),
);

describe("stored release sources", () => {
  it("should find the sources", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it.each(sourceFiles)(
    "should import only boot-safe modules in %s",
    (fileName) => {
      const forbiddenImports = readImports(fileName).filter(
        (specifier) =>
          !specifier.startsWith(".") && !ALLOWED_PACKAGES.includes(specifier),
      );
      expect(forbiddenImports).toEqual([]);
    },
  );
});
