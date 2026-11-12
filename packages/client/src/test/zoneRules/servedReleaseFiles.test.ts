// Verifies FR2 of add-remote-zone-rules-updates: only release files are listed.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findServedReleaseFiles } from "../../../scripts/zoneRules/servedReleaseFiles.ts";

let buildDirectory = "";

afterEach(() => rmSync(buildDirectory, { recursive: true, force: true }));

function buildWith(fileNames: string[]): string {
  buildDirectory = mkdtempSync(join(tmpdir(), "served-release-"));
  mkdirSync(join(buildDirectory, "zone-rules"));
  for (const fileName of fileNames) {
    writeFileSync(join(buildDirectory, "zone-rules", fileName), "{}");
  }
  return buildDirectory;
}

describe("findServedReleaseFiles", () => {
  it("lists release files and skips the version file and other names", () => {
    const directory = buildWith(["2025b.json", "version.json", "2025b.txt"]);
    expect(findServedReleaseFiles(directory)).toEqual(["2025b.json"]);
  });

  it("returns nothing when the build has no zone rules directory", () => {
    buildDirectory = mkdtempSync(join(tmpdir(), "served-release-"));
    expect(findServedReleaseFiles(buildDirectory)).toEqual([]);
  });
});
