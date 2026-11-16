// Verifies FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import { runDataRefreshCli } from "../../../scripts/dataRefresh/cli.ts";
import type { DataRefreshDependencies } from "../../../scripts/dataRefresh/cliCommands.ts";

const RELEASE_PATH = "zone-rules/release.json";
const COORDINATES_PATH = "zone-rules/zone-coordinates.json";
const CITY_PATH = "city-data/geonames-cities.json";
const MANIFEST = "packages/client/package.json";

type Fakes = {
  committed?: Record<string, string>;
  refreshed?: Record<string, string>;
  changedPaths?: string[];
  manifestDiff?: string;
  currentBranch?: string;
  headBranch?: string;
};

function createHarness(fakes: Fakes = {}) {
  const outputs: Record<string, string> = {};
  const files: Record<string, string> = {};
  const lines: string[] = [];
  const dependencies: DataRefreshDependencies = {
    readCommittedFile: async (path) => fakes.committed?.[path],
    readRefreshedFile: async (path) => fakes.refreshed?.[path],
    listChangedPaths: async () => fakes.changedPaths ?? [],
    readManifestDiff: async () => fakes.manifestDiff ?? "",
    readCurrentBranch: async () => fakes.currentBranch ?? "main",
    headBranchFromEnvironment: fakes.headBranch,
    writeOutput: async (key, value) => {
      outputs[key] = value;
    },
    writeTextFile: async (fileName, content) => {
      files[fileName] = content;
      return `/tmp/${fileName}`;
    },
    log: (line) => lines.push(line),
  };
  return { dependencies, outputs, files, lines };
}

const zoneRelease = (release: string, ids: string[]) =>
  JSON.stringify({
    release,
    zones: Object.fromEntries(ids.map((id) => [id, {}])),
  });
const zoneCoordinates = (ids: string[]) =>
  JSON.stringify({ zones: Object.fromEntries(ids.map((id) => [id, [1, 2]])) });
const cityData = (dumpDate: string, population = 200_000) =>
  JSON.stringify({
    formatVersion: 1,
    source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate },
    zones: ["Europe/Paris"],
    regions: [],
    cities: [[1, "Paris", 0, "FR", 0, population, 1, 2]],
    zoneCityPopulations: {},
    zoneCityRegions: {},
  });

describe("verdict zone-rules", () => {
  it("writes a merge verdict, the title and the body files", async () => {
    const harness = createHarness({
      committed: {
        [RELEASE_PATH]: zoneRelease("2026f", ["Europe/Kyiv"]),
        [COORDINATES_PATH]: zoneCoordinates(["Europe/Kyiv"]),
      },
      refreshed: {
        [RELEASE_PATH]: zoneRelease("2026g", ["Europe/Kyiv"]),
        [COORDINATES_PATH]: zoneCoordinates(["Europe/Kyiv"]),
      },
    });
    const exitCode = await runDataRefreshCli(
      ["verdict", "zone-rules"],
      harness.dependencies,
    );
    expect([exitCode, harness.outputs]).toEqual([
      0,
      {
        verdict: "MERGE",
        title: "Update zone rules to 2026g",
        "body-file": "/tmp/body.md",
        "merge-body-file": "/tmp/merge-body.md",
      },
    ]);
  });

  it("ends the merge body file with the trailer", async () => {
    const harness = createHarness({
      committed: { [RELEASE_PATH]: zoneRelease("2026f", []) },
      refreshed: { [RELEASE_PATH]: zoneRelease("2026g", []) },
    });
    await runDataRefreshCli(["verdict", "zone-rules"], harness.dependencies);
    expect(harness.files["merge-body.md"].split("\n").at(-1)).toBe(
      "Data-Only: true",
    );
  });

  it("prints the verdict and each reason when a zone is missing", async () => {
    const harness = createHarness({
      committed: { [RELEASE_PATH]: zoneRelease("2026f", ["Europe/Kyiv"]) },
      refreshed: { [RELEASE_PATH]: zoneRelease("2026g", []) },
    });
    await runDataRefreshCli(["verdict", "zone-rules"], harness.dependencies);
    expect(harness.lines).toEqual([
      "NEEDS_REVIEW",
      "- The zone identifier Europe/Kyiv of the committed release is missing",
    ]);
  });

  it("merges when neither side has a zone coordinates file", async () => {
    const harness = createHarness({
      committed: { [RELEASE_PATH]: zoneRelease("2026f", ["Europe/Kyiv"]) },
      refreshed: { [RELEASE_PATH]: zoneRelease("2026g", ["Europe/Kyiv"]) },
    });
    await runDataRefreshCli(["verdict", "zone-rules"], harness.dependencies);
    expect(harness.outputs.verdict).toBe("MERGE");
  });

  it("needs review when a zone loses its coordinates", async () => {
    const harness = createHarness({
      committed: {
        [RELEASE_PATH]: zoneRelease("2026f", ["Asia/Almaty"]),
        [COORDINATES_PATH]: zoneCoordinates(["Asia/Almaty"]),
      },
      refreshed: {
        [RELEASE_PATH]: zoneRelease("2026g", ["Asia/Almaty"]),
        [COORDINATES_PATH]: zoneCoordinates([]),
      },
    });
    await runDataRefreshCli(["verdict", "zone-rules"], harness.dependencies);
    expect(harness.lines).toEqual([
      "NEEDS_REVIEW",
      "- The coordinates of the zone Asia/Almaty are missing",
    ]);
  });

  it("fails when a refreshed file is missing", async () => {
    const harness = createHarness({
      committed: { [RELEASE_PATH]: zoneRelease("2026f", []) },
    });
    expect(
      await runDataRefreshCli(["verdict", "zone-rules"], harness.dependencies),
    ).toBe(1);
    expect(harness.lines.at(-1)).toBe(
      `Data refresh failed: Missing file ${RELEASE_PATH}`,
    );
  });
});

describe("verdict city-data", () => {
  it("writes only the verdict when just the dump date differs", async () => {
    const harness = createHarness({
      committed: { [CITY_PATH]: cityData("2026-11-14") },
      refreshed: { [CITY_PATH]: cityData("2026-12-02") },
    });
    await runDataRefreshCli(["verdict", "city-data"], harness.dependencies);
    expect(harness.outputs).toEqual({ verdict: "UNCHANGED" });
  });

  it("titles the pull request with the dump date when cities changed", async () => {
    const harness = createHarness({
      committed: { [CITY_PATH]: cityData("2026-11-14") },
      refreshed: { [CITY_PATH]: cityData("2026-12-02", 250_000) },
    });
    await runDataRefreshCli(["verdict", "city-data"], harness.dependencies);
    expect(harness.outputs).toMatchObject({
      verdict: "MERGE",
      title: "Refresh city data to the dump of 2026-12-02",
    });
  });
});

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

describe("issue", () => {
  it("writes the title and the body file", async () => {
    const harness = createHarness();
    const exitCode = await runDataRefreshCli(
      ["issue", "zone-rules", "Compile the release", "https://run"],
      harness.dependencies,
    );
    expect([exitCode, harness.outputs, harness.files["issue.md"]]).toEqual([
      0,
      {
        title: "Data refresh failed: zone rules",
        "body-file": "/tmp/issue.md",
        "recovery-file": "/tmp/recovery.md",
      },
      "Failed step: Compile the release\nRun: https://run",
    ]);
    expect(harness.files["recovery.md"]).toContain("https://run");
  });

  it("rejects an unknown source", async () => {
    const harness = createHarness();
    expect(
      await runDataRefreshCli(
        ["issue", "nope", "step", "url"],
        harness.dependencies,
      ),
    ).toBe(1);
  });
});

describe("usage", () => {
  it.each([[[]], [["bogus"]], [["verdict", "cldr"]]])(
    "prints the usage and exits 1 for %j",
    async (argumentsList) => {
      const harness = createHarness();
      expect(await runDataRefreshCli(argumentsList, harness.dependencies)).toBe(
        1,
      );
      expect(harness.lines[0]).toMatch(/^Usage:/);
    },
  );
});
