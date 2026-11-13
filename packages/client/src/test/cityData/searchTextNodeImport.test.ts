// Verifies FR3, FR7 of add-geonames-city-source (D11): plain Node loads the module.
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const NODE_SCRIPT =
  "const m = await import('./src/lib/searchText/index.ts'); console.log(m.normalizeSearchText('Ёлка'))";

describe("searchText module in plain Node", () => {
  it("should normalize text when imported by node without Vitest", () => {
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", NODE_SCRIPT],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(output.trim()).toBe("елка");
  });
});
