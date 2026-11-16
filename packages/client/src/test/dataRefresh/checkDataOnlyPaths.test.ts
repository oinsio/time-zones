// Verifies FR6 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import {
  findPathsOutsideData,
  findSourceOfBranch,
} from "../../../scripts/dataRefresh/checkDataOnlyPaths.ts";

const RELEASE_FILE = "packages/client/zone-rules/release.json";
const COORDINATES_FILE = "packages/client/zone-rules/zone-coordinates.json";
const CITY_FILE = "packages/client/city-data/geonames-cities.json";
const MANIFEST = "packages/client/package.json";
const LOCKFILE = "pnpm-lock.yaml";
const cldrDiff = [
  "--- a/packages/client/package.json",
  "+++ b/packages/client/package.json",
  '-    "cldr-bcp47": "48.2.0",',
  '+    "cldr-bcp47": "49.0.0",',
  '-    "cldr-dates-full": "48.2.0"',
  '+    "cldr-dates-full": "49.0.0"',
].join("\n");

describe("findSourceOfBranch", () => {
  it.each([
    ["data-refresh/zone-rules", "zone-rules"],
    ["data-refresh/city-data", "city-data"],
    ["dependabot/npm_and_yarn/cldr-abc123", "cldr"],
    ["dependabot/npm_and_yarn/other-dep", undefined],
    ["data-refresh/other", undefined],
    ["main", undefined],
  ])("reads %s as %s", (branchName, source) => {
    expect(findSourceOfBranch(branchName)).toBe(source);
  });
});

describe("findPathsOutsideData", () => {
  it.each([
    ["zone-rules", [RELEASE_FILE, COORDINATES_FILE], []],
    [
      "zone-rules",
      [RELEASE_FILE, "packages/client/src/main.tsx"],
      ["packages/client/src/main.tsx"],
    ],
    ["city-data", [CITY_FILE], []],
    ["city-data", [CITY_FILE, RELEASE_FILE], [RELEASE_FILE]],
  ] as const)("%s with %j gives %j", (source, changedPaths, offenders) => {
    expect(findPathsOutsideData(source, [...changedPaths])).toEqual(offenders);
  });

  it("accepts the lockfile and the two CLDR version entries", () => {
    expect(
      findPathsOutsideData("cldr", [LOCKFILE, MANIFEST], cldrDiff),
    ).toEqual([]);
  });

  it("names another dependency's version entry", () => {
    const diff = `${cldrDiff}\n-    "react": "19.0.0",\n+    "react": "19.1.0",`;
    expect(findPathsOutsideData("cldr", [LOCKFILE, MANIFEST], diff)).toEqual([
      '"react": "19.0.0",',
      '"react": "19.1.0",',
    ]);
  });

  it("names the manifest when its diff is not given", () => {
    expect(findPathsOutsideData("cldr", [MANIFEST])).toEqual([MANIFEST]);
  });

  it("names a changed file outside the CLDR data paths", () => {
    expect(
      findPathsOutsideData("cldr", [LOCKFILE, "packages/client/src/main.tsx"]),
    ).toEqual(["packages/client/src/main.tsx"]);
  });

  it("does not look at the manifest diff when the manifest is unchanged", () => {
    expect(
      findPathsOutsideData("cldr", [LOCKFILE], '+    "react": "1"'),
    ).toEqual([]);
  });

  it("ignores a manifest diff for the other sources", () => {
    expect(findPathsOutsideData("zone-rules", [MANIFEST], cldrDiff)).toEqual([
      MANIFEST,
    ]);
  });

  it("ignores the headers and hunk lines of a real diff", () => {
    const diff = [
      "diff --git a/packages/client/package.json b/packages/client/package.json",
      "index 1a2b3c..4d5e6f 100644",
      "--- a/packages/client/package.json",
      "+++ b/packages/client/package.json",
      "@@ -40,2 +40,2 @@",
      cldrDiff.split("\n").slice(2).join("\n"),
    ].join("\n");
    expect(findPathsOutsideData("cldr", [MANIFEST], diff)).toEqual([]);
  });

  it("names a changed line even when it contains three dashes", () => {
    expect(
      findPathsOutsideData("cldr", [MANIFEST], '-    "react": "a---b",'),
    ).toEqual(['"react": "a---b",']);
  });

  it("does not take a path that only starts like a data file as data", () => {
    expect(
      findPathsOutsideData("cldr", ["packages/client/package.json.bak"]),
    ).toEqual(["packages/client/package.json.bak"]);
  });

  it("gives the other sources no manifest offenders when the manifest is unchanged", () => {
    expect(
      findPathsOutsideData("zone-rules", [RELEASE_FILE], '+    "react": "1"'),
    ).toEqual([]);
  });
});
