// Verifies FR3, FR5, FR6, FR7, FR8 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import { runDataRefreshCli } from "../../../scripts/dataRefresh/cli.ts";
import {
  CITY_PATH,
  COORDINATES_PATH,
  cityData,
  createHarness,
  RELEASE_PATH,
  zoneCoordinates,
  zoneRelease,
} from "./cliHarness.ts";

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
