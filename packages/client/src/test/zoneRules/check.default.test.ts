// @add-zone-rules-from-iana @FR8: the zone rules check against zdump
// Verifies FR3, FR4 of build-zic-from-tzcode: the zone tools of the committed release.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runZoneRulesCheck } from "../../../scripts/zoneRules/check.ts";
import { buildReleaseText, COORDINATES_FILE, check } from "./checkWorld";
import { createFakeFetch, createFakeProcessRunner } from "./compileFakes";

// Verifies FR4 of add-city-coordinates-to-locations: the zone coordinates check of the zone rules check.

describe("runZoneRulesCheck by default", () => {
  it("downloads, verifies and compiles the release the file names, then compares", async () => {
    const run = await check([]);
    expect(run.urls).toEqual([
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz",
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz.asc",
      "https://data.iana.org/time-zones/releases/tzcode2026f.tar.gz",
      "https://data.iana.org/time-zones/releases/tzcode2026f.tar.gz.asc",
    ]);
    expect(run.calls.map((call) => call.command)).toEqual([
      "gpg",
      "gpg",
      "gpg",
      "gpg",
      "tar",
      "tar",
      "make",
      "tar",
      expect.stringMatching(/[\\/]tools[\\/]zic$/),
    ]);
    expect(run.logLines).toContain("0 differences");
    expect(run.exitCode).toBe(0);
  });

  it("stops without comparing when the signature does not verify", async () => {
    const logLines: string[] = [];
    const exitCode = await runZoneRulesCheck({
      argv: [],
      runProcess: createFakeProcessRunner({
        verifyStatus: "",
        archiveVersion: "2026f",
      }).runProcess,
      fetchRelease: createFakeFetch().fetchRelease,
      readFile: async (path) =>
        path === COORDINATES_FILE
          ? readFileSync(COORDINATES_FILE, "utf8")
          : buildReleaseText(),
      log: (line) => logLines.push(line),
    });
    expect(exitCode).toBe(1);
    expect(logLines.join("\n")).toContain("signature");
  });
});
