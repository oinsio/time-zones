// @add-zone-rules-from-iana @FR7: compiling a release from a signed IANA archive
// Verifies FR3 of build-zic-from-tzcode: the zone tools are run by path; the work directory of each run is removed.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runZoneRulesCompile } from "../../../scripts/zoneRules/compile.ts";
import { TZ_COORDINATOR_KEY_FINGERPRINT } from "../../../scripts/zoneRules/signing.ts";
import { createFakeProcessRunner } from "./compileFakes";
import {
  compile,
  getWorkDirectories,
  isProgram,
  logsMention,
  RELEASE,
  VALID_SCENARIO,
  VALID_STATUS,
} from "./compileWorld";

const OTHER_FINGERPRINT = "0000000000000000000000000000000000000000";

describe("a compile that must stop", () => {
  it.each([
    [
      "a missing VALIDSIG",
      {
        ...VALID_SCENARIO,
        verifyStatus: "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n",
      },
      "no valid signature",
    ],
    ["a failed key import", { ...VALID_SCENARIO, importExitCode: 2 }, "import"],
  ])(
    "stops on %s before zic, names the failed check and writes nothing",
    async (_description, scenario, checkName) => {
      const run = await compile(scenario);
      expect(run.exitCode).not.toBe(0);
      expect(logsMention(run, checkName)).toBe(true);
      expect(run.calls.some((call) => isProgram(call, "zic"))).toBe(false);
      expect(run.writtenFiles.size).toBe(0);
    },
  );

  it("stops when the signature is by another key and names both fingerprints", async () => {
    const otherKeyStatus = VALID_STATUS.split(
      TZ_COORDINATOR_KEY_FINGERPRINT,
    ).join(OTHER_FINGERPRINT);
    const run = await compile({
      ...VALID_SCENARIO,
      verifyStatus: otherKeyStatus,
    });
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, OTHER_FINGERPRINT)).toBe(true);
    expect(logsMention(run, TZ_COORDINATOR_KEY_FINGERPRINT)).toBe(true);
    expect(run.calls.some((call) => isProgram(call, "zic"))).toBe(false);
    expect(run.writtenFiles.size).toBe(0);
  });

  it("stops when the version file names another release and names both", async () => {
    const run = await compile({ ...VALID_SCENARIO, archiveVersion: "2026e" });
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, "2026e")).toBe(true);
    expect(logsMention(run, "2026f")).toBe(true);
    expect(run.calls.some((call) => isProgram(call, "zic"))).toBe(false);
    expect(run.writtenFiles.size).toBe(0);
  });

  it("stops when a download fails", async () => {
    const exitCode = await runZoneRulesCompile({
      argv: [RELEASE],
      runProcess: createFakeProcessRunner(VALID_SCENARIO).runProcess,
      fetchRelease: async () => {
        throw new Error("HTTP 404");
      },
      writeFile: async () => {
        throw new Error("must not write");
      },
      log: () => {},
    });
    expect(exitCode).not.toBe(0);
  });

  it("logs which release it wrote", async () => {
    const run = await compile(VALID_SCENARIO);
    expect(run.logLines).toEqual([
      "Wrote zone-rules/release.json and zone-rules/zone-coordinates.json for the release 2026f",
    ]);
  });

  it.each([
    [
      "tar",
      { tarFailure: { exitCode: 2, stderr: "bad archive" } },
      "tar failed (exit 2): bad archive",
    ],
    [
      "zic",
      { zicFailure: { exitCode: 1, stderr: "bad source" } },
      "zic failed (exit 1): bad source",
    ],
  ])("stops when %s fails and says why", async (_command, failure, message) => {
    const run = await compile({ ...VALID_SCENARIO, ...failure });
    expect(run.exitCode).not.toBe(0);
    expect(run.logLines.join("\n")).toContain(message);
    expect(run.writtenFiles.size).toBe(0);
  });

  // Verifies FR2, FR3 of add-city-coordinates-to-locations.
  it("stops and writes neither file when the archive has no zone table", async () => {
    const run = await compile({ ...VALID_SCENARIO, isZoneTableMissing: true });
    expect(run.exitCode).not.toBe(0);
    expect(run.logLines.join("\n")).toContain("zone.tab");
    expect(run.writtenFiles.size).toBe(0);
  });

  it("stops and writes neither file when a zone table row is malformed", async () => {
    const run = await compile({
      ...VALID_SCENARIO,
      zoneTable: "RU\tbroken\tEurope/Moscow\n",
    });
    expect(run.exitCode).not.toBe(0);
    expect(run.logLines.join("\n")).toContain("line 1");
    expect(run.writtenFiles.size).toBe(0);
  });

  it("unpacks into a source directory and compiles into a compiled directory", async () => {
    const run = await compile(VALID_SCENARIO);
    const tarArguments = run.calls
      .filter((call) => call.command === "tar")
      .at(-1)?.args as string[];
    const zicArguments = run.calls.find((call) => isProgram(call, "zic"))
      ?.args as string[];
    expect(tarArguments[0]).toBe("-xzf");
    expect(tarArguments[2]).toBe("-C");
    expect(tarArguments[3]).toMatch(/[\\/]source$/);
    expect(zicArguments[3]).toMatch(/[\\/]compiled$/);
  });

  it("leaves no temporary directory behind", async () => {
    const runs = [
      await compile(VALID_SCENARIO),
      await compile({ ...VALID_SCENARIO, archiveVersion: "2026e" }),
    ];
    const workDirectories = runs.flatMap((run) =>
      getWorkDirectories(run.calls),
    );
    expect(workDirectories).toHaveLength(runs.length);
    for (const directory of workDirectories) {
      expect(existsSync(directory)).toBe(false);
    }
  });

  it("exits non-zero with a usage line when the release argument is missing", async () => {
    const run = await compile(VALID_SCENARIO, []);
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, "Usage")).toBe(true);
    expect(run.urls).toEqual([]);
  });

  it.each([
    ["latest"],
    ["2026"],
    ["../2026f"],
    ["2026F"],
    ["2026A"],
    ["x2026f"],
  ])("rejects the release name %s", async (name) => {
    const run = await compile(VALID_SCENARIO, [name]);
    expect(run.exitCode).not.toBe(0);
    expect(run.urls).toEqual([]);
  });
});

describe("compile accepts every valid release name (FR5)", () => {
  // @add-remote-zone-rules-updates @FR5
  it.each([["2026aa"], ["2026fx"]])(
    "accepts the release name %s",
    async (name) => {
      const run = await compile(VALID_SCENARIO, [name]);
      expect(run.urls[0]).toContain(`tzdata${name}.tar.gz`);
    },
  );
});
