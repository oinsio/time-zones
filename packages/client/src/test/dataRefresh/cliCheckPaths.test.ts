// Verifies FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import { runDataRefreshCli } from "../../../scripts/dataRefresh/cli.ts";
import { createHarness, MANIFEST } from "./cliHarness.ts";

describe("check-paths", () => {
  it("passes for an ordinary branch with the automatic source", async () => {
    const harness = createHarness({
      currentBranch: "feature/x",
      changedPaths: ["packages/client/src/a.ts"],
    });
    expect(
      await runDataRefreshCli(
        ["check-paths", "auto", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(0);
    expect(harness.lines).toEqual(["feature/x is not a data refresh branch"]);
  });

  it("takes the source from GITHUB_HEAD_REF before the current branch", async () => {
    const harness = createHarness({
      headBranch: "data-refresh/city-data",
      currentBranch: "feature/x",
      changedPaths: ["packages/client/zone-rules/release.json"],
    });
    expect(
      await runDataRefreshCli(
        ["check-paths", "auto", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(1);
    expect(harness.lines).toEqual([
      "Outside the data paths of city-data: packages/client/zone-rules/release.json",
    ]);
  });

  it("falls back to the current branch without GITHUB_HEAD_REF", async () => {
    const harness = createHarness({
      currentBranch: "data-refresh/zone-rules",
      changedPaths: ["packages/client/zone-rules/release.json"],
    });
    expect(
      await runDataRefreshCli(
        ["check-paths", "auto", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(0);
  });

  it("reads the manifest diff of a CLDR branch", async () => {
    const harness = createHarness({
      headBranch: "dependabot/npm_and_yarn/cldr-1",
      changedPaths: [MANIFEST, "pnpm-lock.yaml"],
      manifestDiff: '+    "react": "19.1.0",',
    });
    expect(
      await runDataRefreshCli(
        ["check-paths", "auto", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(1);
    expect(harness.lines).toEqual([
      'Outside the data paths of cldr: "react": "19.1.0",',
    ]);
  });

  it("checks an explicit source", async () => {
    const harness = createHarness({
      changedPaths: ["packages/client/city-data/geonames-cities.json"],
    });
    expect(
      await runDataRefreshCli(
        ["check-paths", "city-data", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(0);
  });

  it("rejects an unknown source", async () => {
    const harness = createHarness();
    expect(
      await runDataRefreshCli(
        ["check-paths", "nope", "main", "HEAD"],
        harness.dependencies,
      ),
    ).toBe(1);
  });
});
