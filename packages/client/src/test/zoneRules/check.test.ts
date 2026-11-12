// @add-zone-rules-from-iana @FR8: the zone rules check against zdump
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { runZoneRulesCheck } from "../../../scripts/zoneRules/check.ts";
import type { RunProcess } from "../../../scripts/zoneRules/processTypes.ts";
import {
  createFakeFetch,
  createFakeProcessRunner,
  VALID_VERIFY_STATUS_FILE,
} from "./compileFakes";
import { FIXTURE_RELEASE_DOCUMENT } from "./fixtureReleaseDocument";

const RELEASE_FILE = "zone-rules/release.json";
const COMPILED_ZONE_IDS = [
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Calcutta",
  "Asia/Calcutta2",
];
const NEW_YORK_ZDUMP = readFileSync(
  join(__dirname, "fixtures", "zdump", "America_New_York.txt"),
  "utf8",
);
const FIXTURE_NEW_YORK = FIXTURE_RELEASE_DOCUMENT.zones["America/New_York"];
const FIXTURE_KOLKATA = FIXTURE_RELEASE_DOCUMENT.zones["Asia/Kolkata"];

function buildReleaseText(
  newYorkFutureRule = FIXTURE_NEW_YORK.futureRule,
): string {
  return JSON.stringify({
    release: "2026f",
    cutoff: 946684800,
    zones: {
      "America/New_York": {
        ...FIXTURE_NEW_YORK,
        futureRule: newYorkFutureRule,
      },
      "Asia/Kolkata": FIXTURE_KOLKATA,
      "Asia/Calcutta": "Asia/Kolkata",
      "Asia/Calcutta2": "Asia/Kolkata",
    },
  });
}

function createCompiledDirectory(zoneIds = COMPILED_ZONE_IDS): string {
  const directory = mkdtempSync(join(tmpdir(), "zone-rules-check-test-"));
  for (const zoneId of zoneIds) {
    mkdirSync(dirname(join(directory, zoneId)), { recursive: true });
    writeFileSync(join(directory, zoneId), "");
  }
  return directory;
}

/** Plays zdump: America/New_York gets the captured fixture, every other zone no line. */
function createZdumpRunner(zdumpCalls: string[][]): RunProcess {
  return async (command, args) => {
    if (command !== "zdump") return { exitCode: 0, stdout: "", stderr: "" };
    zdumpCalls.push(args);
    const paths = args.slice(3);
    const stdout = paths
      .filter((path) => path.endsWith("America/New_York"))
      .flatMap((path) =>
        NEW_YORK_ZDUMP.split("\n")
          .filter(Boolean)
          .map((line) => line.replace(/^\S+/, path)),
      )
      .join("\n");
    return { exitCode: 0, stdout, stderr: "" };
  };
}

async function check(argv: string[], releaseText = buildReleaseText()) {
  const zdumpCalls: string[][] = [];
  const logLines: string[] = [];
  const downloads = createFakeFetch();
  const fakes = createFakeProcessRunner({
    verifyStatus: readFileSync(VALID_VERIFY_STATUS_FILE, "utf8"),
    archiveVersion: "2026f",
  });
  const zdumpRunner = createZdumpRunner(zdumpCalls);
  const readPaths: string[] = [];
  const exitCode = await runZoneRulesCheck({
    argv,
    runProcess: async (command, args, options) =>
      command === "zdump"
        ? zdumpRunner(command, args)
        : fakes.runProcess(command, args, options),
    fetchRelease: downloads.fetchRelease,
    readFile: async (path) => {
      readPaths.push(path);
      return releaseText;
    },
    log: (line) => logLines.push(line),
  });
  return {
    exitCode,
    logLines,
    zdumpCalls,
    urls: downloads.urls,
    readPaths,
    calls: fakes.calls,
  };
}

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
    expect(run.logLines.join("\n")).toContain("Europe/Oslo");
  });

  it("exits 1 when the release holds a zone the compiled files lack", async () => {
    const run = await check([
      "--compiled",
      createCompiledDirectory(["America/New_York"]),
    ]);
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("Asia/Kolkata");
  });

  it("exits 1 with the error when the compiled directory does not exist", async () => {
    const run = await check(["--compiled", "/nonexistent/compiled"]);
    expect(run.exitCode).toBe(1);
    expect(run.logLines.join("\n")).toContain("/nonexistent/compiled");
  });

  it("exits 1 when the release file is not a release", async () => {
    const run = await check(["--compiled", createCompiledDirectory()], "{}");
    expect(run.exitCode).toBe(1);
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
