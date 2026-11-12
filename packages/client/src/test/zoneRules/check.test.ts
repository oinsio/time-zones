// @add-zone-rules-from-iana @FR8: the zone rules check against zdump
import { readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runZoneRulesCheck } from "../../../scripts/zoneRules/check.ts";
import {
  buildReleaseText,
  COMPILED_ZONE_IDS,
  check,
  createCompiledDirectory,
  FIXTURE_KOLKATA,
  FIXTURE_NEW_YORK,
  RELEASE_FILE,
} from "./checkWorld";
import { createFakeFetch, createFakeProcessRunner } from "./compileFakes";

describe("runZoneRulesCheck with a compiled directory", () => {
  it("prints 0 differences and exits 0 when the release matches zdump", async () => {
    const compiled = createCompiledDirectory();
    const run = await check(["--compiled", compiled]);
    expect(run.logLines).toContain("0 differences");
    expect(run.exitCode).toBe(0);
  });

  it("reads the committed release file and downloads nothing", async () => {
    const run = await check(["--compiled", createCompiledDirectory()]);
    expect(run.readPaths).toEqual([RELEASE_FILE]);
    expect(run.urls).toEqual([]);
    expect(run.calls).toEqual([]);
  });

  it("runs zdump -v -c 2000,2041 on the absolute path of every compiled file", async () => {
    const compiled = createCompiledDirectory();
    const run = await check(["--compiled", compiled]);
    expect(run.zdumpCalls).toHaveLength(1);
    expect(run.zdumpCalls[0]?.slice(0, 3)).toEqual(["-v", "-c", "2000,2041"]);
    expect([...(run.zdumpCalls[0]?.slice(3) ?? [])].sort()).toEqual(
      COMPILED_ZONE_IDS.map((zoneId) => join(compiled, zoneId)).sort(),
    );
  });

  it("exits 1 and names the zone and the instant of the first difference", async () => {
    const run = await check(
      ["--compiled", createCompiledDirectory()],
      buildReleaseText("EST5EDT,M3.2.0,M10.1.0"),
    );
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("America/New_York");
    expect(run.logLines.join("\n")).toContain("2007-11-04T05:59:59Z");
    expect(run.logLines).not.toContain("0 differences");
  });

  it("exits 1 when the compiled files hold a zone the release lacks", async () => {
    const compiled = createCompiledDirectory([
      ...COMPILED_ZONE_IDS,
      "Europe/Oslo",
    ]);
    const run = await check(["--compiled", compiled]);
    expect(run.exitCode).toBe(1);
    expect(run.logLines).toContain(
      "Europe/Oslo differs at -: zdump says a zone of the release, the release says no such zone in the release",
    );
    expect(run.zdumpCalls).toEqual([]);
  });

  it("exits 1 when the release holds a zone the compiled files lack", async () => {
    const run = await check([
      "--compiled",
      createCompiledDirectory(["America/New_York"]),
    ]);
    expect(run.exitCode).toBe(1);
    expect(run.logLines).toContain(
      "Asia/Kolkata differs at -: zdump says a compiled zone file, the release says no such compiled file",
    );
    expect(run.zdumpCalls).toEqual([]);
  });

  it("exits 1 with the error when the compiled directory does not exist", async () => {
    const run = await check(["--compiled", "/nonexistent/compiled"]);
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("/nonexistent/compiled");
  });

  it("exits 1 and says why when the release file is not a release", async () => {
    const run = await check(["--compiled", createCompiledDirectory()], "{}");
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("Invalid zone rules release");
  });

  it("exits 1 and says why when zdump fails", async () => {
    const run = await check(
      ["--compiled", createCompiledDirectory()],
      buildReleaseText(),
      true,
    );
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain(
      "zdump failed (exit 3): zdump broke",
    );
  });

  it("finds a difference in a zone after the first one", async () => {
    const alteredKolkata = JSON.stringify({
      release: "2026f",
      cutoff: 946684800,
      zones: {
        "America/New_York": FIXTURE_NEW_YORK,
        "Asia/Kolkata": { ...FIXTURE_KOLKATA, futureRule: "IST-5:31" },
        "Asia/Calcutta": "Asia/Kolkata",
        "Asia/Calcutta2": "Asia/Kolkata",
        "Asia/Calcutta3": "Asia/Kolkata",
      },
    });
    const run = await check(
      ["--compiled", createCompiledDirectory()],
      alteredKolkata,
    );
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("Asia/Kolkata");
  });

  it("leaves no temporary directory behind", async () => {
    const countWorkDirectories = () =>
      readdirSync(tmpdir()).filter((name) =>
        name.startsWith("zone-rules-check-"),
      ).length;
    const before = countWorkDirectories();
    await check([]);
    await check(["--compiled", createCompiledDirectory()]);
    expect(countWorkDirectories()).toBe(before);
  });

  it("exits 1 when the release file cannot be read", async () => {
    const exitCode = await runZoneRulesCheck({
      argv: [],
      runProcess: createFakeProcessRunner({
        verifyStatus: "",
        archiveVersion: "",
      }).runProcess,
      fetchRelease: createFakeFetch().fetchRelease,
      readFile: async () => {
        throw new Error("ENOENT");
      },
      log: () => {},
    });
    expect(exitCode).toBe(1);
  });
});

describe("runZoneRulesCheck by default", () => {
  it("downloads, verifies and compiles the release the file names, then compares", async () => {
    const run = await check([]);
    expect(run.urls).toEqual([
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz",
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz.asc",
    ]);
    expect(run.calls.map((call) => call.command)).toEqual([
      "gpg",
      "gpg",
      "tar",
      "zic",
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
      readFile: async () => buildReleaseText(),
      log: (line) => logLines.push(line),
    });
    expect(exitCode).toBe(1);
    expect(logLines.join("\n")).toContain("signature");
  });
});
